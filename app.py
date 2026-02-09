from src.grid import create_global_grid
from src.loaders import raster_to_grid
from src.preprocess import normalize
from src.visualize import plot_heatmap
import numpy as np

import glob
import os

# 1. Create grid
lats, lons, transform = create_global_grid()
H, W = len(lats), len(lons)

print(f"Grid size: {H} x {W} = {H*W:,} cells")

# 2. Load WorldPop
pop_raw = raster_to_grid("data/raw/worldpop_population.tif", (H, W), transform, "EPSG:4326")
pop_raw[pop_raw < 0] = np.nan

# 3. Load Temperature Data (12 months)
temp_files = sorted(glob.glob("data/raw/wc2.1_2.5m_tavg/*.tif"))
print(f"Loading {len(temp_files)} temperature files...")

temp_sum = None
stride = 4 # Early downsampling for performance

# Process Pop
pop = pop_raw[::stride, ::stride]
pop_suit = normalize(pop, invert=True)

# Process Temp
for f in temp_files:
    t = raster_to_grid(f, (H, W), transform, "EPSG:4326")
    t = t[::stride, ::stride]
    if temp_sum is None:
        temp_sum = t
    else:
        temp_sum += t

t_avg = temp_sum / len(temp_files)

print("Climate stats (Annual Avg):")
print(f"Min: {np.nanmin(t_avg):.2f}°C, Max: {np.nanmax(t_avg):.2f}°C")

# Normalize Temp (Invert=True because cooler is better for datacenters)
temp_suit = normalize(t_avg, invert=True)

# 4. Composite Suitability (50/50 Weight)
composite_suit = (pop_suit * 0.5) + (temp_suit * 0.5)

# Clip extreme values for visualization
vmin, vmax = np.nanpercentile(composite_suit, [1, 99])
composite_vis = np.clip(composite_suit, vmin, vmax)

print(f"Final analysis resolution: {composite_vis.shape}")

plot_heatmap(
    composite_vis,
    "Global Datacenter Suitability (Pop Density + Annual Temperature)",
    out_path="output/composite_suitability.png",
    cmap="magma"
)

# 5. Export for Frontend
import json

# Get coordinates for the downsampled grid
h_sub, w_sub = composite_vis.shape
# Re-calculate lats/lons for the downsampled grid if necessary or just use the indices
# For simplicity in this hackathon, we'll export a list of records

print("Exporting data for frontend...")
data_points = []
for r in range(h_sub):
    for c in range(w_sub):
        val = composite_vis[r, c]
        if np.isnan(val):
            continue
            
        # Map indices back to lat/lng (approximate for display)
        # Using the same logic as visualize.py but simpler
        lat = lats[r * stride]
        lng = lons[c * stride]
        
        # Calculate some pseudo-scores for fields we haven't integrated yet
        # In a real environment, these would come from specific datasets
        renewable_val = np.random.uniform(30, 90)
        water_val = np.random.uniform(40, 85)
        terrain_val = 80 if np.random.random() > 0.2 else 40 # Mostly flat
        infra_val = 50 + (pop[r, c] / 5000 * 40) if not np.isnan(pop[r, c]) else 30
        
        data_points.append({
            "lat": float(lat),
            "lng": float(lng),
            "suitability": float(val),
            "temperature": float(t_avg[r, c]),
            "populationDensity": "high" if pop[r, c] > 1000 else "medium" if pop[r, c] > 100 else "low",
            "solarPotential": "high" if renewable_val > 70 else "medium" if renewable_val > 40 else "low",
            "waterStress": "high" if water_val < 50 else "medium" if water_val < 70 else "low",
            "terrain": "flat" if terrain_val > 70 else "hilly" if terrain_val > 40 else "mountainous",
            "scores": {
                "environmental": float(temp_suit[r, c] * 100),
                "population": float(pop_suit[r, c] * 100),
                "renewable": float(renewable_val),
                "water": float(water_val),
                "terrain": float(terrain_val),
                "infrastructure": float(min(100, infra_val))
            }
        })

# Ensure directory exists
os.makedirs("frontend/public/data", exist_ok=True)
with open("frontend/public/data/heatmap.json", "w") as f:
    json.dump(data_points, f)

print(f"Exported {len(data_points)} points to frontend/public/data/heatmap.json")

