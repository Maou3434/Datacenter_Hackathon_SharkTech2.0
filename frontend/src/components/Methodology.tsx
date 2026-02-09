import { ArrowLeft, Database, Map, Brain, AlertCircle, Target } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function Methodology() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">Methodology</h1>
          <p className="text-slate-600">
            Understanding the science behind GreenGrid Planner's suitability analysis
          </p>
        </div>
        
        {/* Problem Statement */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <CardTitle>Problem Statement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              Data centers are critical infrastructure for the digital economy, but they come with 
              significant environmental costs: high energy consumption, substantial water usage for 
              cooling, and heat generation.
            </p>
            <p>
              GreenGrid Planner addresses the challenge of identifying optimal locations for sustainable 
              data center placement by balancing environmental impact, infrastructure requirements, 
              and human proximity considerations.
            </p>
            <p>
              The goal is to help planners make data-driven decisions that minimize ecological footprint 
              while maintaining operational efficiency and accessibility.
            </p>
          </CardContent>
        </Card>
        
        {/* Datasets */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <CardTitle>Datasets Used</CardTitle>
            </div>
            <CardDescription>
              Our analysis combines multiple geospatial and environmental datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Environmental Data</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Climate data (temperature, humidity)</li>
                    <li>• Carbon intensity of regional power grids</li>
                    <li>• Natural disaster risk zones</li>
                    <li>• Protected land and biodiversity areas</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Infrastructure Data</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Population density grids</li>
                    <li>• Night-time light intensity (urban proxy)</li>
                    <li>• Fiber optic network coverage</li>
                    <li>• Power grid capacity and reliability</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Resource Availability</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Water stress and availability indices</li>
                    <li>• Renewable energy potential (solar, wind)</li>
                    <li>• Land use and terrain analysis</li>
                    <li>• Seismic and geological stability</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2">Socioeconomic Factors</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Labor market indicators</li>
                    <li>• Educational infrastructure</li>
                    <li>• Economic development indices</li>
                    <li>• Political stability metrics</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Spatial Resolution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-emerald-600" />
              <CardTitle>Spatial Resolution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              Our analysis operates at a <strong>5° × 5° grid resolution</strong>, providing global 
              coverage with approximately 2,500 data points across the globe.
            </p>
            <p>
              This resolution balances computational efficiency with geographical accuracy, allowing 
              real-time interactivity while capturing regional variations in environmental and 
              infrastructure factors.
            </p>
            <p>
              Each grid cell represents an area of approximately 550km × 550km, suitable for 
              strategic planning and initial site identification.
            </p>
          </CardContent>
        </Card>
        
        {/* Scoring Method */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-600" />
              <CardTitle>Scoring & ML Method</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <div>
              <h4 className="font-semibold mb-2">Multi-Criteria Decision Analysis (MCDA)</h4>
              <p>
                We employ a weighted linear combination approach where each location receives scores 
                (0-100) across six key factors:
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-1">
                <li><strong>Environmental Impact:</strong> Lower temperatures and reduced carbon footprint</li>
                <li><strong>Population Sensitivity:</strong> Distance from dense urban areas</li>
                <li><strong>Renewable Energy:</strong> Solar, wind, and hydro potential</li>
                <li><strong>Water Sustainability:</strong> Availability without ecological stress</li>
                <li><strong>Terrain Feasibility:</strong> Flat land suitable for construction</li>
                <li><strong>Infrastructure:</strong> Network connectivity and skilled workforce</li>
              </ol>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2">Suitability Formula</h4>
              <code className="text-xs block">
                Suitability = (W₁×S₁ + W₂×S₂ + W₃×S₃ + W₄×S₄ + W₅×S₅ + W₆×S₆) / (W₁ + W₂ + W₃ + W₄ + W₅ + W₆)
              </code>
              <p className="text-xs mt-2 text-slate-600">
                Where W represents user-defined weights (0-100) and S represents normalized scores (0-100) 
                for each factor.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Constraint-Based Filtering</h4>
              <p>
                Binary constraints allow users to exclude unsuitable areas such as dense urban cores, 
                protected forests, flood-risk zones, and water-stressed regions. These are applied as 
                hard filters before scoring.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Limitations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <CardTitle>Limitations & Assumptions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold mb-2 text-amber-900">Important Assumptions</h4>
              <ul className="space-y-2 text-slate-700">
                <li>
                  <strong>Skilled Labor Proxy:</strong> Workforce availability is inferred using 
                  night-time light intensity and urban infrastructure as proxies, which may not 
                  capture educational quality or specific technical skills.
                </li>
                <li>
                  <strong>Static Analysis:</strong> Current data does not account for future climate 
                  change, infrastructure development, or policy changes.
                </li>
                <li>
                  <strong>Regional Variations:</strong> The 5° grid resolution may mask important 
                  micro-geographical variations within each cell.
                </li>
                <li>
                  <strong>Data Recency:</strong> Environmental and infrastructure data may have 
                  different update frequencies and temporal coverage.
                </li>
              </ul>
            </div>
            
            <p>
              <strong>Recommended Use:</strong> This tool is designed for strategic planning and initial 
              site identification. Final site selection should include detailed ground surveys, regulatory 
              analysis, and stakeholder engagement.
            </p>
            
            <p className="text-xs text-slate-500 italic">
              This is a demonstration tool created for educational and research purposes. For production 
              deployment, additional validation and higher-resolution data would be required.
            </p>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="pt-8 pb-12 text-center">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
