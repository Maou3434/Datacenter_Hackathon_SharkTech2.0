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

  // Water availability
  const water = 30 + Math.random() * 60;

  // Terrain (more mountainous in certain regions)
  const terrain = tempZone > 20 && tempZone < 50 ?
    50 + Math.random() * 40 : 60 + Math.random() * 30;

  // Infrastructure (higher near populated areas)
  const infrastructure = 100 - population * 0.6 + Math.random() * 20;

  const scores = {
    environmental,
    population,
    renewable,
    water,
    terrain,
    infrastructure
  };

  return {
    lat,
    lng,
    suitability: 0.5,
    temperature: 30 - tempZone * 0.4 + Math.random() * 10,
    populationDensity: population > 70 ? 'high' : population > 40 ? 'medium' : 'low',
    solarPotential: renewable > 70 ? 'high' : renewable > 40 ? 'medium' : 'low',
    waterStress: water < 40 ? 'high' : water < 65 ? 'medium' : 'low',
    terrain: terrain > 70 ? 'flat' : terrain > 40 ? 'hilly' : 'mountainous',
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
  if (constraints.waterStress && location.waterStress === 'high') {
    excluded = true;
  }
  if (constraints.floodRisk && location.lat < 10 && location.lat > -10) {
    excluded = true; // Simplified flood risk based on tropical regions
  }

  if (excluded) {
    return { ...location, suitability: 0, excluded: true };
  }

  // Normalize weights
  const totalWeight =
    weights.environmental +
    weights.population +
    weights.renewable +
    weights.water +
    weights.terrain +
    weights.infrastructure;

  if (totalWeight === 0) {
    return { ...location, suitability: 0.5, excluded: false };
  }

  // Calculate weighted score with defensive fallbacks for missing scores
  const suitability = (
    ((location.scores.environmental ?? 0) * weights.environmental) +
    ((location.scores.population ?? 0) * weights.population) +
    ((location.scores.renewable ?? 0) * weights.renewable) +
    ((location.scores.water ?? 0) * weights.water) +
    ((location.scores.terrain ?? 0) * weights.terrain) +
    ((location.scores.infrastructure ?? 0) * weights.infrastructure)
  ) / (totalWeight * 100);

  return { ...location, suitability, excluded: false };
}

export function getSuitabilityColor(suitability: number, excluded: boolean): string {
  if (excluded) return '#AEB7B3'; // Medium gray

  if (suitability >= 0.8) return '#2F4B26'; // Dark green
  if (suitability >= 0.7) return '#3d6133'; // Medium green
  if (suitability >= 0.6) return '#4a7640'; // Light green
  if (suitability >= 0.5) return '#8b9d83'; // Pale green
  if (suitability >= 0.4) return '#c4a853'; // Yellow-green
  if (suitability >= 0.3) return '#d4954e'; // Orange
  return '#c97153'; // Red-orange
}

export function getScenarioDescription(weights: WeightFactors): string {
  const factors = [
    { name: 'environmental sustainability', value: weights.environmental },
    { name: 'population proximity', value: weights.population },
    { name: 'renewable energy', value: weights.renewable },
    { name: 'water sustainability', value: weights.water },
    { name: 'terrain feasibility', value: weights.terrain },
    { name: 'infrastructure', value: weights.infrastructure }
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