from osgeo import gdal
import os

def analyze_tif(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    # Open the dataset
    dataset = gdal.Open(file_path)
    if not dataset:
        print("Failed to open dataset.")
        return

    print(f"--- Analysis for {os.path.basename(file_path)} ---")
    print(f"Driver: {dataset.GetDriver().ShortName}/{dataset.GetDriver().LongName}")
    print(f"Size: {dataset.RasterXSize} x {dataset.RasterYSize} x {dataset.RasterCount}")
    print(f"Projection: {dataset.GetProjection()}")
    
    geotransform = dataset.GetGeoTransform()
    if geotransform:
        print(f"Origin: ({geotransform[0]}, {geotransform[3]})")
        print(f"Pixel Size: ({geotransform[1]}, {geotransform[5]})")

    # Analyze first band
    band = dataset.GetRasterBand(1)
    min_val, max_val, mean_val, std_dev = band.GetStatistics(True, True)
    print(f"Band 1 Stats: Min={min_val:.2f}, Max={max_val:.2f}, Mean={mean_val:.2f}")

if __name__ == "__main__":
    # Test with worldpop data
    analyze_tif("data/raw/worldpop_population.tif")
