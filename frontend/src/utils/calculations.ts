import { WeightFactors, Constraints, LocationData } from '../types';

// Generate mock global data points
export function generateGlobalData(): LocationData[] {
  const locations: LocationData[] = [];

  // Create a grid of locations across the globe
  for (let lat = -60; lat <= 70; lat += 5) {
    for (let lng = -180; lng <= 180; lng += 5) {
      locations.push(generateLocationData(lat, lng));
    }
  }

  return locations;
}

function generateLocationData(lat: number, lng: number): LocationData {
  // Generate realistic-looking scores based on latitude/longitude
  const latFactor = Math.abs(lat) / 90;
  const tempZone = Math.abs(lat);

  // Higher latitudes tend to be cooler (better for data centers)
  const environmental = Math.min(95, 40 + latFactor * 50 + Math.random() * 20);

  // Population density varies by region
  const population = Math.max(10, 80 - latFactor * 40 + Math.random() * 30);

  // Renewable energy (solar better near equator, wind better at mid-latitudes)
  const renewable = tempZone > 30 && tempZone < 60 ?
    60 + Math.random() * 35 : 40 + Math.random() * 40;

  const scores = {
    environmental,
    population,
    renewable
  };

  return {
    lat,
    lng,
    suitability: 0.5,
    temperature: 30 - tempZone * 0.4 + Math.random() * 10,
    populationDensity: population > 70 ? 'high' : population > 40 ? 'medium' : 'low',
    solarPotential: renewable > 70 ? 'high' : renewable > 40 ? 'medium' : 'low',
    waterStress: 'low', // default
    terrain: 'flat', // default
    scores
  };
}

export function calculateSuitability(
  location: LocationData,
  weights: WeightFactors,
  constraints: Constraints
): LocationData {
  // Check exclusions based on constraints
  let excluded = false;

  if (constraints.urbanCores && location.populationDensity === 'high') {
    excluded = true;
  }
  // Simplified flood risk based on tropical regions
  if (constraints.floodRisk && location.lat < 10 && location.lat > -10) {
    excluded = true;
  }

  if (excluded) {
    return { ...location, suitability: 0, excluded: true };
  }

  // Normalize weights
  const totalWeight =
    weights.environmental +
    weights.population +
    weights.renewable;

  if (totalWeight === 0) {
    return { ...location, suitability: 0.5, excluded: false };
  }

  // Calculate weighted score with defensive fallbacks for missing scores
  const suitability = (
    ((location.scores.environmental ?? 0) * weights.environmental) +
    ((location.scores.population ?? 0) * weights.population) +
    ((location.scores.renewable ?? 0) * weights.renewable)
  ) / (totalWeight * 100);

  return { ...location, suitability, excluded: false };
}

// Suitability Colormap Stops (Red-Yellow-Green)
const SUITABILITY_STOPS = [
  { p: 0.0, c: '#ef4444' }, // Poor (Red)
  { p: 0.25, c: '#f97316' }, // Low (Orange)
  { p: 0.5, c: '#facc15' }, // Moderate (Yellow)
  { p: 0.75, c: '#4ade80' }, // Good (Light Green)
  { p: 1.0, c: '#22c55e' }  // High (Green)
];


function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
}

export function getSuitabilityColor(suitability: number, excluded: boolean): string {
  if (excluded) return '#AEB7B3';

  // Clamping to [0, 1]
  const val = Math.max(0, Math.min(1, suitability));

  // Find the two stops to interpolate between
  let lower = SUITABILITY_STOPS[0];
  let upper = SUITABILITY_STOPS[SUITABILITY_STOPS.length - 1];

  for (let i = 0; i < SUITABILITY_STOPS.length - 1; i++) {
    if (val >= SUITABILITY_STOPS[i].p && val <= SUITABILITY_STOPS[i + 1].p) {
      lower = SUITABILITY_STOPS[i];
      upper = SUITABILITY_STOPS[i + 1];
      break;
    }
  }

  const range = upper.p - lower.p;
  const t = range === 0 ? 0 : (val - lower.p) / range;

  const c1 = hexToRgb(lower.c);
  const c2 = hexToRgb(upper.c);

  return rgbToHex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  );
}

export function getScenarioDescription(weights: WeightFactors): string {
  const factors = [
    { name: 'temperature efficiency', value: weights.environmental },
    { name: 'low population density', value: weights.population },
    { name: 'solar potential', value: weights.renewable }
  ];

  // Find top 2 priorities
  const sorted = [...factors].sort((a, b) => b.value - a.value);
  const top = sorted.filter(f => f.value > 0).slice(0, 2);

  if (top.length === 0) {
    return "Adjust the weight sliders to prioritize different factors.";
  }

  if (top.length === 1) {
    return `This scenario prioritizes ${top[0].name}, favoring regions that excel in this factor.`;
  }

  return `This scenario prioritizes ${top[0].name} and ${top[1].name}, favoring regions with strong performance in these areas.`;
}