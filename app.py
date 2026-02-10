from src.grid import create_global_grid
from src.loaders import raster_to_grid
from src.preprocess import normalize
from src.visualize import plot_heatmap
import numpy as np
import glob
import os
import json

# 1. Create grid
lats, lons, transform = create_global_grid()
H, W = len(lats), len(lons)

print(f"Grid size: {H} x {W} = {H*W:,} cells")

# 2. Load WorldPop
print("Loading Population Data...")
pop_path = "data/raw/worldpop_population.tif"
if os.path.exists(pop_path):
    pop_raw = raster_to_grid(pop_path, (H, W), transform, "EPSG:4326")
    pop_raw[pop_raw < 0] = np.nan
else:
    print(f"Warning: Population file not found at {pop_path}")
    pop_raw = np.zeros((H, W))

# 3. Load Temperature Data (12 months)
print("Loading Temperature Data...")
temp_files = sorted(glob.glob("data/raw/wc2.1_2.5m_tavg/*.tif"))
temp_sum = None
stride = 8 # Downsampling for performance (High stride for dev, lower for prod if needed)

# Process Pop
pop = pop_raw[::stride, ::stride]
# Normalize Pop: Lower density is better for datacenters (cheaper land, less risk)
pop_suit = normalize(pop, invert=True) 

# Process Temp
if temp_files:
    for f in temp_files:
        print(f"Processing {os.path.basename(f)}...")
        t = raster_to_grid(f, (H, W), transform, "EPSG:4326")
        t = t[::stride, ::stride]
        if temp_sum is None:
            temp_sum = t
        else:
            temp_sum += t

    t_avg = temp_sum / len(temp_files)
    print(f"Climate stats (Annual Avg): Min: {np.nanmin(t_avg):.2f}°C, Max: {np.nanmax(t_avg):.2f}°C")
    
    # Normalize Temp: Cooler is better (Invert=True)
    temp_suit = normalize(t_avg, invert=True)
else:
    print("Warning: No temperature files found.")
    t_avg = np.zeros_like(pop)
    temp_suit = np.zeros_like(pop)

# 4. Load GHI (Solar) Data
print("Loading GHI Data...")
# Specific file match based on directory listing
ghi_files = glob.glob("data/raw/*GHI*.tiff") + glob.glob("data/raw/*GHI*.tif")
ghi_path = None

if ghi_files:
    # Prefer the specific poster map if available
    for f in ghi_files:
        if "World_GHI_poster-map" in f:
            ghi_path = f
            break
    if not ghi_path:
        ghi_path = ghi_files[0]

if ghi_path:
    print(f"Found GHI file: {ghi_path}")
    ghi_raw = raster_to_grid(ghi_path, (H, W), transform, "EPSG:4326")
    ghi = ghi_raw[::stride, ::stride]
    
    # Simple fix for potential nodata values often represented as very negative numbers
    ghi[ghi < 0] = np.nan
    
    # Normalize GHI: Higher is better for solar
    ghi_suit = normalize(ghi, invert=False)
else:
    print("Warning: GHI data not found. Using filler zeros.")
    ghi = np.zeros_like(pop)
    ghi_suit = np.zeros_like(pop)

# 5. Composite Suitability (Equal weighting for now, adjustable in frontend)
# Weights: Temp (Env) 33%, Pop 33%, GHI (Renewable) 33%
composite_suit = (pop_suit * 0.33) + (temp_suit * 0.33) + (ghi_suit * 0.33)

# Clip extreme values for visualization
vmin, vmax = np.nanpercentile(composite_suit, [1, 99])
composite_vis = np.clip(composite_suit, vmin, vmax)

print(f"Final analysis resolution: {composite_vis.shape}")

# Optional: Generate static heatmap image
plot_heatmap(
    composite_vis,
    "Global Datacenter Suitability (Pop + Temp + GHI)",
    out_path="output/composite_suitability.png",
    cmap="magma"
)

# 6. Export for Frontend
print("Exporting data for frontend...")

# Get coordinates for the downsampled grid
h_sub, w_sub = composite_vis.shape

data_points = []
for r in range(h_sub):
    for c in range(w_sub):
        val = composite_vis[r, c]
        if np.isnan(val):
            continue
            
        # Map indices back to lat/lng
        lat = lats[r * stride]
        lng = lons[c * stride]
        
        # Original values for display
        p_val = pop[r, c] if not np.isnan(pop[r, c]) else 0
        t_val = t_avg[r, c] if not np.isnan(t_avg[r, c]) else 0
        g_val = ghi[r, c] if not np.isnan(ghi[r, c]) else 0
        
        # Normalized scores (0-100)
        s_env = (temp_suit[r, c] if not np.isnan(temp_suit[r, c]) else 0) * 100
        s_pop = (pop_suit[r, c] if not np.isnan(pop_suit[r, c]) else 0) * 100
        s_ren = (ghi_suit[r, c] if not np.isnan(ghi_suit[r, c]) else 0) * 100

        data_points.append({
            "lat": float(lat),
            "lng": float(lng),
            "suitability": float(val),
            "temperature": float(t_val),
            "populationDensity": "high" if p_val > 1000 else "medium" if p_val > 100 else "low",
            "solarPotential": "high" if g_val > 2000 else "medium" if g_val > 1500 else "low", 
            "scores": {
                "environmental": float(s_env),
                "population": float(s_pop),
                "renewable": float(s_ren),
                "water": 0,    
                "terrain": 0,  
                "infrastructure": 0 
            }
        })

# Ensure directory exists
os.makedirs("frontend/public/data", exist_ok=True)
with open("frontend/public/data/heatmap.json", "w") as f:
    json.dump(data_points, f)

print(f"Exported {len(data_points)} points to frontend/public/data/heatmap.json")

