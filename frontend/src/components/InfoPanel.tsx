import { LocationData, WeightFactors } from '../types';
import { Card } from './ui/card';
import { getScenarioDescription } from '../utils/calculations';

interface InfoPanelProps {
  selectedLocation: LocationData | null;
  weights: WeightFactors;
}

export default function InfoPanel({ selectedLocation, weights }: InfoPanelProps) {
  const scenarioDesc = getScenarioDescription(weights);

  if (!selectedLocation) {
    return (
      <Card className="h-48 p-6 border-t border-[#fcfdbf]/20 border-b-0 border-l-0 border-r-0 bg-[#1e293b] rounded-none shadow-2xl">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm mb-2 text-[#f1f5f9]">Heatmap Information</h3>
            <div className="w-16 h-1 bg-[#fcfdbf]/40 mb-3 rounded-full" />
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
              Bright yellow areas indicate optimal conditions for data center placement.
              Click on locations for detailed analysis.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-[#94a3b8]">
              {scenarioDesc}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const scores = [
    { label: 'Environmental', value: selectedLocation.scores.environmental },
    { label: 'Population', value: selectedLocation.scores.population },
    { label: 'Renewable', value: selectedLocation.scores.renewable },
    { label: 'Water', value: selectedLocation.scores.water },
    { label: 'Terrain', value: selectedLocation.scores.terrain },
    { label: 'Infrastructure', value: selectedLocation.scores.infrastructure }
  ];

  return (
    <Card className="h-48 p-6 border-t border-[#fcfdbf]/20 border-b-0 border-l-0 border-r-0 overflow-y-auto bg-[#1e293b] rounded-none shadow-2xl">
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-sm mb-1 text-[#f1f5f9]">Location Analysis</h3>
          <div className="w-16 h-1 bg-[#fcfdbf]/60 mb-2 rounded-full" />
          <p className="text-xs text-[#cbd5e1] mb-3 font-mono">
            {selectedLocation.lat.toFixed(1)}°, {selectedLocation.lng.toFixed(1)}°
            {selectedLocation.excluded && <span className="text-red-400 ml-2 font-bold">[Excluded]</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {scores.map((score) => (
            <div key={score.label} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#94a3b8]">{score.label}</span>
                <span className="text-xs font-bold text-[#fcfdbf]">
                  {score.value.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden ring-1 ring-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#de4968] to-[#fcfdbf] rounded-full transition-all duration-300"
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-[#cbd5e1]">
            Overall Suitability: <span className="font-bold text-[#fcfdbf] text-sm">
              {(selectedLocation.suitability * 100).toFixed(0)}%
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}
