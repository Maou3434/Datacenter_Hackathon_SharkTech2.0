
import os
import glob
import json
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.warp import calculate_default_transform, reproject
from sklearn.linear_model import Ridge
from sklearn.preprocessing import MinMaxScaler
import torch
import time

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def get_target_profile(dst_res=0.25):
    """
    Define a target profile for WGS84 grid at ~30km resolution.
    0.25 degrees is approx 27-30km at equator.
    """
    dst_crs = 'EPSG:4326'
    # Global extent
    left, bottom, right, top = -180, -90, 180, 90
    dst_width = int((right - left) / dst_res)
    dst_height = int((top - bottom) / dst_res)
    
    dst_transform = rasterio.transform.from_bounds(
        left, bottom, right, top, dst_width, dst_height
    )
    
    return dst_crs, dst_transform, dst_width, dst_height

def read_and_resample(src_path, dst_height, dst_width, dst_crs, dst_transform):
    """
    Read a raster and resample it to the target grid efficiently.
    """
    try:
        with rasterio.open(src_path) as src:
            source_data = src.read(
                1,
                out_shape=(dst_height, dst_width),
                resampling=Resampling.average # Use average for downsampling
            )
            return source_data
    except Exception as e:
        print(f"Error reading {src_path}: {e}")
        return None

def process_pipeline():
    start_time = time.time()
    print("Starting processing pipeline with CUDA acceleration...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # 1. Define Target Grid (30km ~ 0.25 deg)
    DST_RES = 0.25 
    dst_crs, dst_transform, dst_width, dst_height = get_target_profile(DST_RES)
    print(f"Target Grid: {dst_width}x{dst_height}")

    # 2. Extract Data
    
    # A. Temperature (Average of 12 months)
    print("Processing Temperature...")
    temp_files = sorted(glob.glob("data/raw/wc2.1_2.5m_tavg/*.tif"))
    if temp_files:
        # Accumulate on GPU
        temp_sum = torch.zeros((dst_height, dst_width), dtype=torch.float32, device=device)
        temp_counts = torch.zeros((dst_height, dst_width), dtype=torch.float32, device=device)
        
        for f in temp_files:
            data = read_and_resample(f, dst_height, dst_width, dst_crs, dst_transform)
            if data is not None:
                data_t = torch.from_numpy(data.astype(np.float32)).to(device)
                mask = (data_t > -100) # Valid range
                temp_sum[mask] += data_t[mask]
                temp_counts[mask] += 1
        
        # Avoid divide by zero
        temp_avg = torch.where(temp_counts > 0, temp_sum / temp_counts, torch.tensor(float('nan'), device=device))
    else:
        print("No temperature files found!")
        temp_avg = torch.full((dst_height, dst_width), float('nan'), device=device)

    # B. Population
    print("Processing Population...")
    pop_files = glob.glob("data/raw/worldpop*.tif")
    if pop_files:
        pop_data_np = read_and_resample(pop_files[0], dst_height, dst_width, dst_crs, dst_transform)
        if pop_data_np is not None:
            pop_data = torch.from_numpy(pop_data_np.astype(np.float32)).to(device)
            pop_data[pop_data < 0] = float('nan')
        else:
            pop_data = torch.zeros((dst_height, dst_width), dtype=torch.float32, device=device)
    else:
        print("No population file found!")
        pop_data = torch.zeros((dst_height, dst_width), dtype=torch.float32, device=device)

    # C. GHI
    print("Processing GHI...")
    ghi_files = glob.glob("data/raw/*GHI*.tif") + glob.glob("data/raw/*GHI*.tiff")
    if ghi_files:
        ghi_path = next((f for f in ghi_files if "poster-map" in f), ghi_files[0])
        ghi_data_np = read_and_resample(ghi_path, dst_height, dst_width, dst_crs, dst_transform)
        if ghi_data_np is not None:
            ghi_data = torch.from_numpy(ghi_data_np.astype(np.float32)).to(device)
            ghi_data[ghi_data < 0] = float('nan')
        else:
            ghi_data = torch.zeros((dst_height, dst_width), dtype=torch.float32, device=device)
    else:
        print("No GHI file found!")
        ghi_data = torch.zeros((dst_height, dst_width), dtype=torch.float32, device=device)

    # 3. Data Preparation for Ridge Regression (On GPU)
    print("Preparing data for Ridge Regression (CUDA)...")
    
    # Flatten
    flat_temp = temp_avg.flatten()
    flat_pop = pop_data.flatten()
    flat_ghi = ghi_data.flatten()

    # Create mask for valid land coordinates
    valid_mask = (~torch.isnan(flat_temp)) & (~torch.isnan(flat_ghi)) & (~torch.isnan(flat_pop))
    
    if not valid_mask.any():
        print("Error: No valid data points found! Check input files.")
        return

    # Filtered features
    X = torch.stack((flat_temp[valid_mask], flat_pop[valid_mask], flat_ghi[valid_mask]), dim=1)
    
    # Normalize X (0-1)
    X_min = X.min(dim=0)[0]
    X_max = X.max(dim=0)[0]
    X_scaled = (X - X_min) / (X_max - X_min + 1e-6)

    # 4. Ridge Regression (CUDA implementation)
    print("Training Ridge Regression (Synthetic, CUDA)...")
    
    x_temp = X_scaled[:, 0]
    x_pop = X_scaled[:, 1]
    x_ghi = X_scaled[:, 2]
    
    # Synthetic Suitability Score (0-1)
    torch.manual_seed(42)
    noise = torch.randn(x_temp.shape, device=device) * 0.05
    y_target = (0.5 * x_ghi) - (0.3 * x_temp) - (0.2 * x_pop) + 0.5 + noise
    
    # Ridge solve: (X^T X + alpha*I)^-1 X^T y
    alpha = 1.0
    XT = X_scaled.t()
    A = torch.mm(XT, X_scaled) + alpha * torch.eye(X_scaled.shape[1], device=device)
    b = torch.mm(XT, y_target.unsqueeze(1))
    coeffs = torch.linalg.solve(A, b)
    intercept = y_target.mean() - torch.mm(X_scaled.mean(dim=0).unsqueeze(0), coeffs)
    
    print(f"Ridge Coefficients: Temp={coeffs[0,0]:.4f}, Pop={coeffs[1,0]:.4f}, GHI={coeffs[2,0]:.4f}")
    
    # Predict
    y_pred = torch.mm(X_scaled, coeffs) + intercept
    y_pred = y_pred.squeeze()
    
    # Scale output to 0-100
    y_pred_norm = (y_pred - y_pred.min()) / (y_pred.max() - y_pred.min() + 1e-6) * 100

    # 5. Reconstruct Map
    print("Reconstructing Map...")
    full_suitability = torch.full(flat_temp.shape, float('nan'), device=device)
    full_suitability[valid_mask] = y_pred_norm
    full_suitability = full_suitability.reshape((dst_height, dst_width))
    

    # 6. Export to JSON (Optimized with Pandas)
    print("Exporting to JSON...")
    import pandas as pd
    
    # Move relevant data to CPU
    valid_mask_cpu = valid_mask.cpu().numpy()
    indices = np.where(valid_mask_cpu)[0]
    
    # Get all cells' row/col indices
    rows, cols = np.indices((dst_height, dst_width))
    rows_flat = rows.flatten()[indices]
    cols_flat = cols.flatten()[indices]
    
    # Use transform to get lat/lon
    xs, ys = rasterio.transform.xy(dst_transform, rows_flat, cols_flat, offset='center')
    
    # Filter datasets and move to CPU
    v_suit = full_suitability.flatten()[valid_mask].cpu().numpy()
    v_temp = flat_temp[valid_mask].cpu().numpy()
    v_pop = flat_pop[valid_mask].cpu().numpy()
    v_ghi = flat_ghi[valid_mask].cpu().numpy()

    # Create DataFrame
    df = pd.DataFrame({
        "lat": np.array(ys).round(3),
        "lng": np.array(xs).round(3),
        "suitability": v_suit.round(2),
        "temperature": v_temp.round(1),
        "raw_p": v_pop,
        "raw_g": v_ghi
    })

    # Vectorized category and score calculation
    df['populationDensity'] = np.where(df['raw_p'] > 1000, "high", np.where(df['raw_p'] > 100, "medium", "low"))
    df['solarPotential'] = np.where(df['raw_g'] > 2000, "high", np.where(df['raw_g'] > 1500, "medium", "low"))
    
    # Vectorized scores (0-100)
    df['s_env'] = ((40 - df['temperature']) / 80 * 100).clip(0, 100).round(1)
    df['s_pop'] = ((1 - (df['raw_p'] / 1000)) * 100).clip(0, 100).round(1)
    df['s_ren'] = ((df['raw_g'] / 2500) * 100).clip(0, 100).round(1)

    # Format into the nested structure expected by the frontend
    # Since we want a specific nested JSON structure, we can construct the list of dicts
    # This is still a loop but much faster as it's just on the final pointers.
    
    # Using more efficient list comprehension for nesting
    data_points = [
        {
            "lat": row.lat, "lng": row.lng, "suitability": row.suitability,
            "temperature": row.temperature, "populationDensity": row.populationDensity,
            "solarPotential": row.solarPotential,
            "scores": {
                "environmental": row.s_env, "population": row.s_pop, "renewable": row.s_ren,
                "water": 0, "terrain": 0, "infrastructure": 0
            }
        }
        for row in df.itertuples()
    ]

    # Write JSON
    out_path = "frontend/public/data/heatmap.json"
    ensure_dir(os.path.dirname(out_path))
    
    with open(out_path, "w") as f:
        json.dump(data_points, f)
        
    print(f"Done! Exported {len(data_points)} points in {time.time() - start_time:.2f}s")

if __name__ == "__main__":
    process_pipeline()
