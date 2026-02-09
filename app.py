from src.grid import create_global_grid
from src.loaders import raster_to_grid
from src.preprocess import normalize
from src.visualize import plot_heatmap
import numpy as np

# 1. Create grid
lats, lons, transform = create_global_grid()
H, W = len(lats), len(lons)

print(f"Grid size: {H} x {W} = {H*W:,} cells")

# 2. Load WorldPop
pop = raster_to_grid(
    "data/raw/worldpop_population.tif",
    (H, W),
    transform,
    "EPSG:4326"
)

# Mask NoData values early
pop[pop < 0] = np.nan

# ---- EARLY DOWNSAMPLING FOR SPEED ----
stride = 4 # Process every 4th cell (~20km)
pop = pop[::stride, ::stride]
print(f"Downsampled grid size: {pop.shape}")

print("Population stats (raw):")
print("Min:", np.nanmin(pop), "Max:", np.nanmax(pop))

# 3. Normalize (lower pop = better)
pop_norm = normalize(pop, invert=True)

print("Population stats (normalized):")
print("Min:", np.nanmin(pop_norm), "Max:", np.nanmax(pop_norm))

# ---- VISUALIZATION PREP ----
pop_vis = pop_norm # Already downsampled

# Clip extreme values for visualization only
p_low, p_high = 1, 99
vmin, vmax = np.nanpercentile(pop_vis, [p_low, p_high])
pop_vis = np.clip(pop_vis, vmin, vmax)

print("Visualized grid size:", pop_vis.shape)

plot_heatmap(
    pop_vis,
    "Global Population Suitability (Downsampled View)",
    out_path="output/population_heatmap.png"
)

