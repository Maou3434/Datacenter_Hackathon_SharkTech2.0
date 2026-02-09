import { Link } from 'react-router';
import { MapPin, Zap, Brain, Eye, Database, Cpu, Globe2, ArrowRight, Layers, Target, Activity, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import Globe3D from './Globe3D';
import FloatingCard3D from './FloatingCard3D';
import GeometricGrid from './GeometricGrid';

export default function LandingPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#000411]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Geometric Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <GeometricGrid />
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#160C28]/30 via-[#000411] to-[#000411]" />
        <div className="absolute top-0 left-0 w-[900px] h-[900px] bg-[#2F4B26]/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-[#160C28]/30 rounded-full blur-[200px]" />
        
        {/* 3D Globe */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[550px] h-[550px] opacity-80 pointer-events-none hidden lg:block">
          <Globe3D />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 border border-[#2F4B26]/40 bg-[#160C28]/60 backdrop-blur-xl shadow-lg">
              <Activity className="w-4 h-4 text-[#2F4B26]" />
              <span className="text-sm text-[#E1EFE6] tracking-wide font-medium">AI-Powered Global Intelligence Platform</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-bold mb-8 tracking-tight leading-[0.95]">
              <span className="text-[#E1EFE6] drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">Precision Site</span>
              <br />
              <span className="bg-gradient-to-r from-[#2F4B26] via-[#3d6133] to-[#2F4B26] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(47,75,38,0.4)]">
                Intelligence
              </span>
            </h1>
            
            <div className="w-20 h-1 bg-gradient-to-r from-[#2F4B26] to-transparent mb-8" />
            
            <p className="text-2xl text-[#AEB7B3] mb-12 max-w-2xl leading-relaxed font-light">Fine-grained global heatmaps for sustainable data center deployment.</p>
            
            <div className="flex gap-5 flex-wrap">
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-[#2F4B26] hover:bg-[#3d6133] text-[#E1EFE6] text-lg px-12 py-7 gap-3 shadow-2xl shadow-[#2F4B26]/30 hover:shadow-[0_0_40px_rgba(47,75,38,0.6)] border-0 font-semibold group transition-all hover:ring-2 hover:ring-white/20"
                >
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/methodology">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-[#2F4B26]/50 bg-[#160C28]/40 backdrop-blur-sm text-[#E1EFE6] hover:bg-[#2F4B26]/30 hover:border-[#2F4B26] hover:text-white hover:shadow-[0_0_30px_rgba(47,75,38,0.5)] text-lg px-12 py-7 shadow-xl transition-all"
                >Methodology</Button>
              </Link>
            </div>
          </div>
          
          {/* Floating 3D Cards */}
          <div className="mt-32 relative h-80 hidden xl:block">
            <FloatingCard3D delay={0}>
              <div className="absolute top-0 left-0 w-72 bg-[#160C28]/80 backdrop-blur-2xl border border-[#2F4B26]/30 p-6 shadow-2xl shadow-[#2F4B26]/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#2F4B26]/30 flex items-center justify-center shadow-[0_0_20px_rgba(47,75,38,0.3)]">
                    <Target className="w-6 h-6 text-[#2F4B26]" />
                  </div>
                  <div className="text-xs text-[#AEB7B3] uppercase tracking-wider font-semibold">Suitability Score</div>
                </div>
                <div className="text-5xl font-bold text-[#E1EFE6] mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">94.2%</div>
                <div className="text-sm text-[#AEB7B3]">Northern Europe Region</div>
              </div>
            </FloatingCard3D>
            
            <FloatingCard3D delay={1}>
              <div className="absolute top-20 right-0 w-80 bg-[#160C28]/80 backdrop-blur-2xl border border-[#2F4B26]/30 p-6 shadow-2xl shadow-[#2F4B26]/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#2F4B26]/30 flex items-center justify-center shadow-[0_0_20px_rgba(47,75,38,0.3)]">
                    <Globe2 className="w-6 h-6 text-[#2F4B26]" />
                  </div>
                  <div className="text-xs text-[#AEB7B3] uppercase tracking-wider font-semibold">Global Coverage</div>
                </div>
                <div className="flex gap-8">
                  <div>
                    <div className="text-3xl font-bold text-[#E1EFE6] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">2,500+</div>
                    <div className="text-xs text-[#AEB7B3] uppercase tracking-wide">Data Points</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#E1EFE6] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">6</div>
                    <div className="text-xs text-[#AEB7B3] uppercase tracking-wide">Factors</div>
                  </div>
                </div>
              </div>
            </FloatingCard3D>
            
            <FloatingCard3D delay={2}>
              <div className="absolute bottom-0 left-1/3 w-64 bg-[#160C28]/80 backdrop-blur-2xl border border-[#2F4B26]/30 p-5 shadow-2xl shadow-[#2F4B26]/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-shadow">
                <div className="text-xs text-[#AEB7B3] mb-3 uppercase tracking-wider font-semibold">Environmental Score</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#AEB7B3]">Carbon Impact</span>
                    <span className="text-[#2F4B26] font-bold">Low</span>
                  </div>
                  <div className="h-2 bg-[#160C28] overflow-hidden shadow-inner">
                    <div className="h-full w-[85%] bg-gradient-to-r from-[#2F4B26] to-[#3d6133] shadow-[0_0_10px_rgba(47,75,38,0.5)]" />
                  </div>
                </div>
              </div>
            </FloatingCard3D>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 relative border-t border-[#2F4B26]/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-2.5 border border-[#2F4B26]/30 bg-[#160C28]/40 backdrop-blur-sm">
              <span className="text-sm text-[#2F4B26] tracking-wider uppercase font-semibold">Pipeline</span>
            </div>
            <h2 className="text-5xl font-bold text-[#E1EFE6] mb-6 tracking-tight">
              Three-Stage Process
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#2F4B26] to-transparent" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                num: '01',
                title: 'Data Ingestion',
                desc: 'Multi-source geospatial datasets aggregated at 5° resolution. Environmental, infrastructure, and resource layers normalized for comprehensive analysis.'
              },
              {
                icon: Brain,
                num: '02',
                title: 'AI Scoring',
                desc: 'Multi-criteria decision analysis with weighted linear combination. Real-time computation adapts to user-defined priority vectors.'
              },
              {
                icon: Eye,
                num: '03',
                title: 'Visual Insights',
                desc: 'Interactive visualization with factor-level attribution. Every score decomposed into interpretable metrics for transparency.'
              }
            ].map((stage, i) => (
              <div key={i} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#2F4B26]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-[#160C28]/60 backdrop-blur-xl border border-[#2F4B26]/20 p-10 group-hover:border-[#2F4B26]/40 group-hover:shadow-[0_0_40px_rgba(47,75,38,0.2)] transition-all duration-300 h-full">
                  <div className="w-16 h-16 bg-[#2F4B26]/30 flex items-center justify-center mb-8 group-hover:bg-[#2F4B26]/40 group-hover:shadow-[0_0_30px_rgba(47,75,38,0.4)] transition-all duration-300 shadow-lg shadow-[#2F4B26]/20">
                    <stage.icon className="w-8 h-8 text-[#E1EFE6] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                  </div>
                  <div className="text-[#2F4B26] text-sm font-bold mb-3 tracking-widest uppercase">[{stage.num}]</div>
                  <h3 className="text-2xl font-bold text-[#E1EFE6] mb-4 tracking-tight">{stage.title}</h3>
                  <p className="text-[#AEB7B3] leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-32 px-6 relative overflow-hidden border-t border-[#2F4B26]/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#160C28]/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-2.5 rounded-full border border-[#2F4B26]/30 bg-[#160C28]/40 backdrop-blur-sm">
              <span className="text-sm text-[#2F4B26] tracking-wider uppercase font-semibold">Strategic Value</span>
            </div>
            <h2 className="text-5xl font-bold text-[#E1EFE6] mb-6 tracking-tight">
              Infrastructure at Scale
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#2F4B26] to-transparent rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                icon: TrendingUp,
                title: 'Operational Efficiency',
                desc: 'Climate-informed placement reduces cooling costs by up to 40%. Proximity to renewable energy sources minimizes carbon intensity and long-term procurement risk.',
                stats: [
                  { value: '40%', label: 'Cost Reduction' },
                  { value: '2,500+', label: 'Locations Analyzed' }
                ]
              },
              {
                icon: Target,
                title: 'Risk Mitigation',
                desc: 'Multi-factor risk assessment including water stress, seismic stability, and flood exposure. Constraint-based filtering excludes high-risk and sensitive areas.',
                stats: [
                  { value: '6', label: 'Risk Factors' },
                  { value: '100%', label: 'Global Coverage' }
                ]
              }
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#2F4B26]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-[#160C28]/60 backdrop-blur-2xl border border-[#2F4B26]/20 p-10 group-hover:border-[#2F4B26]/40 transition-all duration-300">
                  <div className="w-14 h-14 bg-[#2F4B26]/30 flex items-center justify-center mb-6 shadow-lg shadow-[#2F4B26]/20">
                    <item.icon className="w-7 h-7 text-[#E1EFE6]" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#E1EFE6] mb-5 tracking-tight">{item.title}</h3>
                  <p className="text-[#AEB7B3] leading-relaxed mb-6 text-lg">{item.desc}</p>
                  <div className="flex gap-8 pt-4 border-t border-[#2F4B26]/20">
                    {item.stats.map((stat, j) => (
                      <div key={j}>
                        <div className="text-3xl font-bold text-[#2F4B26]">{stat.value}</div>
                        <div className="text-sm text-[#AEB7B3]">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-32 px-6 relative border-t border-[#2F4B26]/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-2.5 border border-[#2F4B26]/30 bg-[#160C28]/40 backdrop-blur-sm">
              <span className="text-sm text-[#2F4B26] tracking-wider uppercase font-semibold">Technology</span>
            </div>
            <h2 className="text-5xl font-bold text-[#E1EFE6] mb-6 tracking-tight">
              Built on Modern Geospatial Stack
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#2F4B26] to-transparent" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: Layers, label: 'Raster Analysis' },
              { icon: Database, label: 'Multi-Source' },
              { icon: Brain, label: 'AI Engine' },
              { icon: Globe2, label: 'Global Scale' },
              { icon: Cpu, label: 'Real-time' },
              { icon: Zap, label: 'Interactive' }
            ].map((tech, i) => (
              <div 
                key={i}
                className="group bg-[#160C28]/60 backdrop-blur-xl border border-[#2F4B26]/20 p-8 hover:border-[#2F4B26]/40 hover:bg-[#160C28]/80 transition-all duration-300"
              >
                <tech.icon className="w-10 h-10 text-[#2F4B26] mb-4 mx-auto group-hover:text-[#3d6133] transition-colors" />
                <div className="text-sm text-[#AEB7B3] text-center font-medium">{tech.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden border-t border-[#2F4B26]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#160C28]/40 to-[#000411]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#2F4B26]/10 rounded-full blur-[200px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-6xl font-bold text-[#E1EFE6] mb-8 tracking-tight">Ready for Eco-Smart Deployment?</h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#2F4B26] to-transparent mx-auto mb-8 rounded-full" />
          <p className="text-2xl text-[#AEB7B3] mb-12 max-w-3xl mx-auto font-light leading-relaxed">Identify the most sustainable data center locations with AI-powered environmental intelligence and precision.</p>
          <Link to="/dashboard">
            <Button 
              size="lg" 
              className="bg-[#2F4B26] hover:bg-[#3d6133] text-[#E1EFE6] text-xl px-16 py-10 gap-4 shadow-2xl shadow-[#2F4B26]/30 hover:shadow-[0_0_50px_rgba(47,75,38,0.6)] border-0 font-semibold rounded-xl group transition-all hover:ring-2 hover:ring-white/30"
            >
              Explore Global Heatmap
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2F4B26]/20 bg-[#000411]/80 backdrop-blur-xl py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <MapPin className="w-6 h-6 text-[#2F4B26]" />
            <span className="font-bold text-xl text-[#E1EFE6] tracking-wide">Precision Site Intelligence</span>
          </div>
          <div className="w-16 h-0.5 bg-[#2F4B26] mx-auto mb-5" />
          <p className="text-[#AEB7B3] mb-3">
            AI-Powered Site Intelligence for Data Center Placement
          </p>
          <p className="text-sm text-[#AEB7B3]/60">
            © 2026 GreenGrid Planner • Built for strategic infrastructure decisions
          </p>
        </div>
      </footer>
    </div>
  );
}