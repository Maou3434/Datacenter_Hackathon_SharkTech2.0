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
  const [showMap, setShowMap] = useState(false);
  const [realData, setRealData] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate base data once for mock fallback if needed
  const baseData = useMemo(() => generateGlobalData(), []);

  // Calculate suitability based on applied weights and constraints
  const processedData = useMemo(() => {
    if (!showMap) return [];

    // Use real data if available, otherwise use baseData
    const dataToUse = realData.length > 0 ? realData : baseData;

    return dataToUse.map(location =>
      calculateSuitability(location, appliedWeights, appliedConstraints)
    );
  }, [baseData, realData, appliedWeights, appliedConstraints, showMap]);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/data/heatmap.json');
      if (response.ok) {
        const data = await response.json();
        setRealData(data);
      }
    } catch (error) {
      console.error("Failed to load real heatmap data:", error);
    } finally {
      setIsLoading(false);
      setAppliedWeights(weights);
      setAppliedConstraints(constraints);
      setShowMap(true);
    }
  };

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
    setConstraints(DEFAULT_CONSTRAINTS);
    setAppliedWeights(DEFAULT_WEIGHTS);
    setAppliedConstraints(DEFAULT_CONSTRAINTS);
    setShowMap(false);
    setRealData([]);
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
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-[#160C28] border border-[#2F4B26] p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#2F4B26] border-t-white rounded-full animate-spin"></div>
                <div className="text-[#E1EFE6] font-bold">Processing Real-Time Data...</div>
              </div>
            </div>
          )}
          <MapView data={processedData} onLocationHover={setHoveredLocation} />
        </div>
        <InfoPanel hoveredLocation={hoveredLocation} weights={appliedWeights} />
      </div>
    </div>
  );
}