import numpy as np
from rasterio.transform import from_origin
from config import *

def create_global_grid():
    lats = np.arange(LAT_MAX, LAT_MIN, -RESOLUTION_DEG)
    lons = np.arange(LON_MIN, LON_MAX, RESOLUTION_DEG)

    transform = from_origin(
        west=LON_MIN,
        north=LAT_MAX,
        xsize=RESOLUTION_DEG,
        ysize=RESOLUTION_DEG
    )

    return lats, lons, transform
