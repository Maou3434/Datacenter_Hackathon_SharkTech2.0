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
      <Card
        className="h-48 p-6 border-t border-[#fcfdbf]/20 border-b-0 border-l-0 border-r-0 rounded-none shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#ecf2fbff', opacity: 1 }}
      >
        <div className="flex gap-8 h-full">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-bold text-sm mb-2 text-[#f1f5f9]">Heatmap Information</h3>
              <div className="w-16 h-1 bg-[#fcfdbf]/80 mb-3 rounded-full" />
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                Bright yellow areas indicate optimal conditions for data center placement.
                Click on locations for detailed analysis.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-[#94a3b8] italic">
                {scenarioDesc}
              </p>
            </div>
          </div>

          <div className="w-56 shrink-0 border-l border-white/5 pl-8 hidden md:block">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Suitability Key</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 rounded-full" style={{ backgroundColor: '#fcfdbf' }}></div>
                <span className="text-[10px] font-bold text-[#cbd5e1]">High Efficiency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 rounded-full" style={{ backgroundColor: '#de4968' }}></div>
                <span className="text-[10px] font-bold text-[#cbd5e1]">Moderate Potential</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 rounded-full" style={{ backgroundColor: ' #d4c1ebff' }}></div>
                <span className="text-[10px] font-bold text-[#cbd5e1]">Low Suitability</span>
              </div>
            </div>
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
    <Card
      className="h-48 p-6 border-t border-[#fcfdbf]/20 border-b-0 border-l-0 border-r-0 overflow-y-auto rounded-none shadow-2xl"
      style={{ backgroundColor: '#8eafe5ff', opacity: 1 }}
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-sm mb-1 text-[#f1f5f9]">Location Analysis</h3>
          <div className="w-16 h-1 bg-[#fcfdbf]/80 mb-2 rounded-full" />
          <p className="text-xs text-[#cbd5e1] mb-3 font-mono">
            {selectedLocation.lat.toFixed(1)}°, {selectedLocation.lng.toFixed(1)}°
            {selectedLocation.excluded && <span className="text-red-400 ml-2 font-bold">[Excluded]</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {scores.map((score) => (
            <div key={score.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">{score.label}</span>
                <span className="text-xs font-bold text-[#fcfdbf]">
                  {score.value.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden ring-1 ring-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${score.value}%`,
                    backgroundColor: score.value > 80 ? '#fcfdbf' : score.value > 60 ? '#fe9f6d' : score.value > 40 ? '#de4968' : '#3b0f70'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
          <p className="text-xs text-[#cbd5e1]">
            Overall Score: <span className="font-bold text-[#fcfdbf] text-sm ml-1">
              {(selectedLocation.suitability * 100).toFixed(0)}%
            </span>
          </p>
          <p className="text-[10px] text-[#94a3b8] italic">
            Computed based on active weight profile
          </p>
        </div>
      </div>
    </Card>
  );
}
