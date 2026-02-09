export interface WeightFactors {
  environmental: number;
  population: number;
  renewable: number;
  water: number;
  terrain: number;
  infrastructure: number;
}

export interface Constraints {
  urbanCores: boolean;
  forests: boolean;
  floodRisk: boolean;
  waterStress: boolean;
}

export interface LocationData {
  lat: number;
  lng: number;
  suitability: number;
  temperature: number;
  populationDensity: 'low' | 'medium' | 'high';
  solarPotential: 'low' | 'medium' | 'high';
  waterStress: 'low' | 'medium' | 'high';
  terrain: 'flat' | 'hilly' | 'mountainous';
  scores: {
    environmental: number;
    population: number;
    renewable: number;
    water: number;
    terrain: number;
    infrastructure: number;
  };
  excluded?: boolean;
}
