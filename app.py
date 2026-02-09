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

