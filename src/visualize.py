import matplotlib.pyplot as plt
import os
import numpy as np

def plot_heatmap(data, title, out_path="output/population_heatmap.png"):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    plt.figure(figsize=(14, 6))
    plt.imshow(data, cmap="hot", interpolation="nearest", vmin=np.nanmin(data), vmax=np.nanmax(data))

    plt.colorbar(label="Normalized Value")
    plt.title(title)
    plt.axis("off")

    plt.savefig(out_path, dpi=120, bbox_inches='tight')
    plt.close()

    print(f"[OK] Heatmap saved to {out_path}")
