import json
import os
import sys

file_path = "frontend/public/data/heatmap.json"

if not os.path.exists(file_path):
    print(f"Error: {file_path} does not exist.")
    sys.exit(1)

try:
    with open(file_path, "r") as f:
        data = json.load(f)
except json.JSONDecodeError:
    print(f"Error: {file_path} is not valid JSON.")
    sys.exit(1)

if not isinstance(data, list):
    print("Error: Root element is not a list.")
    sys.exit(1)

if not data:
    print("Error: List is empty.")
    sys.exit(1)

print(f"Loaded {len(data)} data points.")

first_item = data[0]
required_keys = ["lat", "lng", "suitability", "temperature", "populationDensity", "solarPotential", "scores"]
score_keys = ["environmental", "population", "renewable"]

for k in required_keys:
    if k not in first_item:
        print(f"Error: Missing key '{k}' in data item.")
        sys.exit(1)

for k in score_keys:
    if k not in first_item["scores"]:
        print(f"Error: Missing score key '{k}' in scores object.")
        sys.exit(1)

print("Structure verification passed.")

# Sanity check for values
temps = [d["temperature"] for d in data]
pops = [d["scores"]["population"] for d in data]
ghis = [d["scores"]["renewable"] for d in data]

print(f"Temperature range: {min(temps):.2f} to {max(temps):.2f}")
print(f"Pop Score range: {min(pops):.2f} to {max(pops):.2f}")
print(f"GHI Score range: {min(ghis):.2f} to {max(ghis):.2f}")

if max(ghis) == 0 and min(ghis) == 0:
    print("Warning: GHI scores are all zero. Check data loading.")
else:
    print("GHI data looks populated.")

print("Verification complete.")
