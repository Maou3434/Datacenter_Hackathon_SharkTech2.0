import { WeightFactors, Constraints } from '../types';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RotateCcw, Zap } from 'lucide-react';
import { Label } from './ui/label';

interface ControlPanelProps {
  weights: WeightFactors;
  constraints: Constraints;
  onWeightsChange: (weights: WeightFactors) => void;
  onConstraintsChange: (constraints: Constraints) => void;
  onUpdate: () => void;
  onReset: () => void;
}

export default function ControlPanel({
  weights,
  constraints,
  onWeightsChange,
  onConstraintsChange,
  onUpdate,
  onReset
}: ControlPanelProps) {

  const handleWeightChange = (key: keyof WeightFactors, value: number[]) => {
    onWeightsChange({ ...weights, [key]: value[0] });
  };

  const handleConstraintChange = (key: keyof Constraints, checked: boolean) => {
    onConstraintsChange({ ...constraints, [key]: checked });
  };

  const weightConfigs = [
    {
      key: 'environmental' as keyof WeightFactors,
      label: 'Temperature Coeff.',
      description: 'Cooler climates favored for efficiency'
    },
    {
      key: 'population' as keyof WeightFactors,
      label: 'Population Density',
      description: 'Lower density favored (land cost/risk)'
    },
    {
      key: 'renewable' as keyof WeightFactors,
      label: 'Solar Potential (GHI)',
      description: 'Higher Global Horizontal Irradiance'
    }
  ];

  const constraintConfigs = [
    { key: 'urbanCores' as keyof Constraints, label: 'Dense urban cores' },
    { key: 'forests' as keyof Constraints, label: 'Protected land' },
    { key: 'floodRisk' as keyof Constraints, label: 'Flood-risk zones' }
  ];

  return (
    <Card className="w-80 h-full overflow-y-auto p-6 border-r border-[#2F4B26]/20 border-t-0 border-b-0 border-l-0 bg-[#000411] rounded-none">
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-lg mb-1 text-[#E1EFE6]">Control Panel</h2>
          <div className="w-12 h-0.5 bg-[#2F4B26] mb-2 rounded-full" />
          <p className="text-sm text-[#AEB7B3]">
            Adjust factor priorities
          </p>
        </div>

        {/* Weight Sliders */}
        <div className="space-y-6">
          <h3 className="font-bold text-sm text-[#2F4B26] border-b border-[#2F4B26]/20 pb-2 uppercase tracking-wide">
            Prioritize Factors
          </h3>

          {weightConfigs.map(config => (
            <div key={config.key} className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-[#E1EFE6]">{config.label}</Label>
                  <p className="text-xs text-[#AEB7B3] mt-0.5">{config.description}</p>
                </div>
                <span className="text-sm font-bold text-[#2F4B26] ml-2">
                  {weights[config.key]}%
                </span>
              </div>
              <Slider
                value={[weights[config.key]]}
                onValueChange={(value: number[]) => handleWeightChange(config.key, value)}
                max={100}
                step={5}
                className="cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Constraint Toggles */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-sm text-[#2F4B26] border-b border-[#2F4B26]/20 pb-2 uppercase tracking-wide">
            Exclude Areas
          </h3>

          {constraintConfigs.map(config => (
            <div key={config.key} className="flex items-center space-x-3 group">
              <Checkbox
                id={config.key}
                checked={constraints[config.key]}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  handleConstraintChange(config.key, checked as boolean)
                }
                className="border-2 border-[#2F4B26]/40 data-[state=checked]:bg-[#2F4B26] data-[state=checked]:border-[#2F4B26] rounded"
              />
              <label
                htmlFor={config.key}
                className="text-sm cursor-pointer select-none text-[#AEB7B3] group-hover:text-[#E1EFE6] transition-colors"
              >
                {config.label}
              </label>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button onClick={onUpdate} className="w-full gap-2 bg-[#2F4B26] hover:bg-[#3d6133] text-[#E1EFE6] border-0 font-semibold rounded-lg shadow-lg shadow-[#2F4B26]/20 hover:shadow-[0_0_30px_rgba(47,75,38,0.5)] transition-all hover:ring-1 hover:ring-white/20" size="lg">
            <Zap className="w-4 h-4" />
            Update Heatmap
          </Button>
          <Button onClick={onReset} variant="outline" className="w-full gap-2 border border-[#2F4B26]/40 text-[#AEB7B3] hover:bg-[#2F4B26]/20 hover:text-[#E1EFE6] hover:border-[#2F4B26] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-lg transition-all">
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </Card>
  );
}