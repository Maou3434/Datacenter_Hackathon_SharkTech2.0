import { Link, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { Info, BookOpen, MapPin, LayoutDashboard, Home, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export default function TopNavigation() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const auth = useAuth();
  
  return (
    <nav className="bg-[#000411] border-b border-[#2F4B26]/20 px-6 py-4 flex items-center justify-between backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-lg border border-[#2F4B26]/50 bg-[#2F4B26]/20 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(47,75,38,0.4)] transition-all">
          <MapPin className="w-5 h-5 text-[#2F4B26]" />
        </div>
        <span className="font-bold text-lg text-[#E1EFE6] tracking-wide">Precision Site Intelligence</span>
      </Link>
      
      <div className="flex items-center gap-3">
        {isDashboard ? (
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-[#AEB7B3] hover:text-[#E1EFE6] hover:bg-[#2F4B26]/20 rounded-lg">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        ) : (
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-[#AEB7B3] hover:text-[#E1EFE6] hover:bg-[#2F4B26]/20 rounded-lg">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-[#AEB7B3] hover:text-[#E1EFE6] hover:bg-[#2F4B26]/20 rounded-lg">
              <Info className="w-4 h-4" />
              About
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#160C28] border border-[#2F4B26]/30 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#E1EFE6] text-2xl font-bold">About GreenGrid Planner</DialogTitle>
              <DialogDescription className="text-base pt-4 space-y-4 text-[#AEB7B3]">
                <p>
                  GreenGrid Planner is a decision-support tool that visualizes global suitability 
                  heatmaps for sustainable data center placement, based on environmental impact 
                  and human-infrastructure proxies.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#E1EFE6] text-sm">Target Users</h4>
                  <ul className="list-none pl-5 space-y-1">
                    <li className="before:content-['→'] before:text-[#2F4B26] before:mr-2 before:font-bold">Data center planners looking for optimal locations</li>
                    <li className="before:content-['→'] before:text-[#2F4B26] before:mr-2 before:font-bold">Sustainability teams evaluating environmental impact</li>
                    <li className="before:content-['→'] before:text-[#2F4B26] before:mr-2 before:font-bold">Policy makers and research professionals</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#E1EFE6] text-sm">Key Features</h4>
                  <ul className="list-none pl-5 space-y-1">
                    <li className="before:content-['→'] before:text-[#2F4B26] before:mr-2 before:font-bold">Real-time interactive suitability heatmaps</li>
                    <li className="before:content-['→'] before:text-[#2F4B26] before:mr-2 before:font-bold">Customizable priority weights for multiple factors</li>
                    <li className="before:content-['→'] before:text-[#2F4B26] before:mr-2 before:font-bold">Constraint-based filtering for sensitive areas</li>
                    <li className="before:content-['→'] before:text-[#2F4B26] before:mr-2 before:font-bold">Detailed explainability for every location</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        
        <Link to="/methodology">
          <Button 
            variant={location.pathname === '/methodology' ? 'default' : 'ghost'} 
            size="sm" 
            className={location.pathname === '/methodology' 
              ? "gap-2 bg-[#2F4B26] text-[#E1EFE6] hover:bg-[#3d6133] border-0 font-semibold rounded-lg" 
              : "gap-2 text-[#AEB7B3] hover:text-white hover:bg-[#2F4B26]/30 hover:shadow-[0_0_20px_rgba(47,75,38,0.4)] rounded-lg transition-all"}
          >
            <BookOpen className="w-4 h-4" />
            Methodology
          </Button>
        </Link>
        
        <Link to="/marketplace">
          <Button 
            variant={location.pathname === '/marketplace' ? 'default' : 'ghost'} 
            size="sm" 
            className={location.pathname === '/marketplace' 
              ? "gap-2 bg-[#2F4B26] text-[#E1EFE6] hover:bg-[#3d6133] border-0 font-semibold rounded-lg" 
              : "gap-2 text-[#AEB7B3] hover:text-white hover:bg-[#2F4B26]/30 hover:shadow-[0_0_20px_rgba(47,75,38,0.4)] rounded-lg transition-all"}
          >
            <ShoppingCart className="w-4 h-4" />
            Marketplace
          </Button>
        </Link>
        {/* Auth status */}
        {auth?.user && (
          <div className="flex items-center gap-2">
            <img src={auth.user.picture} alt={auth.user.name} className="w-8 h-8 rounded-full" />
            <Button variant="ghost" size="sm" onClick={auth.signOut} className="text-[#AEB7B3]">
              Sign out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}