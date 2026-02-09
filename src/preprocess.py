import numpy as np

def normalize(arr, invert=False):
    arr = arr.astype(np.float32)
    minv = np.nanmin(arr)
    maxv = np.nanmax(arr)

    norm = (arr - minv) / (maxv - minv + 1e-6)

    if invert:
        norm = 1 - norm

    return norm
