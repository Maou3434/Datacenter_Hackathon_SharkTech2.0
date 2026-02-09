import matplotlib.pyplot as plt
import os
import numpy as np

def plot_heatmap(data, title, out_path="output/population_heatmap.png", cmap="viridis"):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    fig, ax = plt.subplots(figsize=(14, 6))
    
    # Set background color (represents NoData/Oceans)
    ax.set_facecolor('#0a192f') # Dark blue/navy
    
    im = ax.imshow(data, cmap=cmap, interpolation="nearest", vmin=np.nanmin(data), vmax=np.nanmax(data))

    plt.colorbar(im, label="Suitability Score")
    ax.set_title(title)
    ax.set_axis_off()

    plt.savefig(out_path, dpi=120, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()

    print(f"[OK] Heatmap saved to {out_path}")
