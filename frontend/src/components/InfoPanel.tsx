import { LocationData, WeightFactors } from '../types';
import { Card } from './ui/card';
import { getScenarioDescription } from '../utils/calculations';

interface InfoPanelProps {
  hoveredLocation: LocationData | null;
  weights: WeightFactors;
}

export default function InfoPanel({ hoveredLocation, weights }: InfoPanelProps) {
  const scenarioDesc = getScenarioDescription(weights);
  
  if (!hoveredLocation) {
    return (
      <Card className="h-48 p-6 border-t border-[#2F4B26]/20 border-b-0 border-l-0 border-r-0 bg-[#000411] rounded-none">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm mb-2 text-[#E1EFE6]">Heatmap Information</h3>
            <div className="w-16 h-0.5 bg-[#2F4B26] mb-3 rounded-full" />
            <p className="text-sm text-[#AEB7B3] leading-relaxed">
              Green areas indicate optimal conditions for data center placement. 
              Hover over locations for detailed analysis.
            </p>
          </div>
          
          <div className="pt-2 border-t border-[#2F4B26]/10">
            <p className="text-xs text-[#AEB7B3]/80">
              {scenarioDesc}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  const scores = [
    { label: 'Environmental', value: hoveredLocation.scores.environmental },
    { label: 'Population', value: hoveredLocation.scores.population },
    { label: 'Renewable', value: hoveredLocation.scores.renewable },
    { label: 'Water', value: hoveredLocation.scores.water },
    { label: 'Terrain', value: hoveredLocation.scores.terrain },
    { label: 'Infrastructure', value: hoveredLocation.scores.infrastructure }
  ];
  
  return (
    <Card className="h-48 p-6 border-t border-[#2F4B26]/20 border-b-0 border-l-0 border-r-0 overflow-y-auto bg-[#000411] rounded-none">
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-sm mb-1 text-[#E1EFE6]">Location Analysis</h3>
          <div className="w-16 h-0.5 bg-[#2F4B26] mb-2 rounded-full" />
          <p className="text-xs text-[#AEB7B3] mb-3">
            {hoveredLocation.lat.toFixed(1)}°, {hoveredLocation.lng.toFixed(1)}° 
            {hoveredLocation.excluded && <span className="text-red-400 ml-2">[Excluded]</span>}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {scores.map((score) => (
            <div key={score.label} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#AEB7B3]">{score.label}</span>
                <span className="text-xs font-bold text-[#2F4B26]">
                  {score.value.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#160C28] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#2F4B26] to-[#3d6133] rounded-full transition-all duration-300"
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t border-[#2F4B26]/10">
          <p className="text-xs text-[#AEB7B3]">
            Overall Suitability: <span className="font-bold text-[#2F4B26]">
              {(hoveredLocation.suitability * 100).toFixed(0)}%
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}
