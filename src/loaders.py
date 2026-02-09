import rasterio
import numpy as np
from rasterio.warp import reproject, Resampling

def raster_to_grid(path, target_shape, target_transform, target_crs):
    with rasterio.open(path) as src:
        data = np.zeros(target_shape, dtype=np.float32)

        reproject(
            source=rasterio.band(src, 1),
            destination=data,
            src_transform=src.transform,
            src_crs=src.crs,
            dst_transform=target_transform,
            dst_crs=target_crs,
            resampling=Resampling.average,
            src_nodata=src.nodata,
            dst_nodata=np.nan,
            num_threads=-1
        )

    return data
