import { useState, useMemo } from 'react';
import ControlPanel from './ControlPanel';
import MapView from './MapView';
import InfoPanel from './InfoPanel';
import { WeightFactors, Constraints, LocationData } from '../types';
import { generateGlobalData, calculateSuitability } from '../utils/calculations';

const DEFAULT_WEIGHTS: WeightFactors = {
  environmental: 50,
  population: 40,
  renewable: 60,
  water: 50,
  terrain: 40,
  infrastructure: 30
};

const DEFAULT_CONSTRAINTS: Constraints = {
  urbanCores: false,
  forests: false,
  floodRisk: false,
  waterStress: false
};

export default function Dashboard() {
  const [weights, setWeights] = useState<WeightFactors>(DEFAULT_WEIGHTS);
  const [constraints, setConstraints] = useState<Constraints>(DEFAULT_CONSTRAINTS);
  const [appliedWeights, setAppliedWeights] = useState<WeightFactors>(DEFAULT_WEIGHTS);
  const [appliedConstraints, setAppliedConstraints] = useState<Constraints>(DEFAULT_CONSTRAINTS);
  const [hoveredLocation, setHoveredLocation] = useState<LocationData | null>(null);
  
  // Generate base data once
  const baseData = useMemo(() => generateGlobalData(), []);
  
  // Calculate suitability based on applied weights and constraints
  const processedData = useMemo(() => {
    return baseData.map(location => 
      calculateSuitability(location, appliedWeights, appliedConstraints)
    );
  }, [baseData, appliedWeights, appliedConstraints]);
  
  const handleUpdate = () => {
    setAppliedWeights(weights);
    setAppliedConstraints(constraints);
  };
  
  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
    setConstraints(DEFAULT_CONSTRAINTS);
    setAppliedWeights(DEFAULT_WEIGHTS);
    setAppliedConstraints(DEFAULT_CONSTRAINTS);
  };
  
  return (
    <div className="h-full flex bg-[#000411]">
      <ControlPanel
        weights={weights}
        constraints={constraints}
        onWeightsChange={setWeights}
        onConstraintsChange={setConstraints}
        onUpdate={handleUpdate}
        onReset={handleReset}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <MapView data={processedData} onLocationHover={setHoveredLocation} />
        </div>
        <InfoPanel hoveredLocation={hoveredLocation} weights={appliedWeights} />
      </div>
    </div>
  );
}