import { useState, useMemo } from 'react';
import { Building2, TrendingDown, AlertCircle, ShoppingCart, ArrowUpDown, LogIn, LogOut, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth, UserRole } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';

interface Seller {
  id: string;
  businessName: string;
  industry: string;
  allowancesAvailable: number;
  pricePerTon: number;
}

interface RegionData {
  name: string;
  totalCap: number;
  remainingAllowances: number;
  averagePrice: number;
  sellers: Seller[];
}

const INITIAL_REGIONS_DATA: Record<string, RegionData> = {
  'northern-europe': {
    name: 'Northern Europe',
    totalCap: 125000,
    remainingAllowances: 42500,
    averagePrice: 8500,
    sellers: [
      { id: '1', businessName: 'Nordic Wind Solutions AB', industry: 'Renewable Energy', allowancesAvailable: 8500, pricePerTon: 7200 },
      { id: '2', businessName: 'GreenTech Manufacturing Ltd', industry: 'Manufacturing', allowancesAvailable: 5200, pricePerTon: 7800 },
      { id: '3', businessName: 'Baltic Hydro Power AS', industry: 'Renewable Energy', allowancesAvailable: 12000, pricePerTon: 8100 },
      { id: '4', businessName: 'Sustainable Logistics Group', industry: 'Transportation', allowancesAvailable: 3800, pricePerTon: 8900 },
      { id: '5', businessName: 'EcoSteel Industries', industry: 'Heavy Industry', allowancesAvailable: 6500, pricePerTon: 9200 },
      { id: '6', businessName: 'Nordic Data Centers AB', industry: 'Technology', allowancesAvailable: 4200, pricePerTon: 7500 },
    ]
  },
  'western-europe': {
    name: 'Western Europe',
    totalCap: 180000,
    remainingAllowances: 38400,
    averagePrice: 9800,
    sellers: [
      { id: '7', businessName: 'Rhine Valley Industries GmbH', industry: 'Manufacturing', allowancesAvailable: 7200, pricePerTon: 9200 },
      { id: '8', businessName: 'Alpine Renewable Energy SA', industry: 'Renewable Energy', allowancesAvailable: 9500, pricePerTon: 8900 },
      { id: '9', businessName: 'European Green Logistics', industry: 'Transportation', allowancesAvailable: 4800, pricePerTon: 10200 },
      { id: '10', businessName: 'CleanTech Manufacturing BV', industry: 'Manufacturing', allowancesAvailable: 5900, pricePerTon: 9800 },
      { id: '11', businessName: 'Atlantic Wind Farms Ltd', industry: 'Renewable Energy', allowancesAvailable: 8600, pricePerTon: 9400 },
    ]
  },
  'north-america-west': {
    name: 'North America (West)',
    totalCap: 220000,
    remainingAllowances: 58800,
    averagePrice: 7200,
    sellers: [
      { id: '12', businessName: 'Pacific Solar Systems Inc', industry: 'Renewable Energy', allowancesAvailable: 15200, pricePerTon: 6500 },
      { id: '13', businessName: 'Silicon Valley Data Co', industry: 'Technology', allowancesAvailable: 8900, pricePerTon: 7100 },
      { id: '14', businessName: 'Mountain Wind Energy LLC', industry: 'Renewable Energy', allowancesAvailable: 11500, pricePerTon: 6800 },
      { id: '15', businessName: 'West Coast Manufacturing', industry: 'Manufacturing', allowancesAvailable: 6200, pricePerTon: 7600 },
      { id: '16', businessName: 'Sustainable Transport West', industry: 'Transportation', allowancesAvailable: 4800, pricePerTon: 7900 },
      { id: '17', businessName: 'GreenTech Industries Inc', industry: 'Heavy Industry', allowancesAvailable: 7400, pricePerTon: 7400 },
    ]
  },
  'asia-pacific': {
    name: 'Asia-Pacific',
    totalCap: 195000,
    remainingAllowances: 45600,
    averagePrice: 6800,
    sellers: [
      { id: '18', businessName: 'APAC Renewable Solutions', industry: 'Renewable Energy', allowancesAvailable: 12500, pricePerTon: 6200 },
      { id: '19', businessName: 'Pacific Rim Manufacturing', industry: 'Manufacturing', allowancesAvailable: 8200, pricePerTon: 6600 },
      { id: '20', businessName: 'Solar Energy Asia Ltd', industry: 'Renewable Energy', allowancesAvailable: 10800, pricePerTon: 6400 },
      { id: '21', businessName: 'Green Logistics APAC', industry: 'Transportation', allowancesAvailable: 5100, pricePerTon: 7200 },
      { id: '22', businessName: 'Tech Infrastructure Co', industry: 'Technology', allowancesAvailable: 6800, pricePerTon: 7000 },
    ]
  },
};

export default function CarbonMarketplace() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [regions, setRegions] = useState<Record<string, RegionData>>(INITIAL_REGIONS_DATA);
  const [selectedRegion, setSelectedRegion] = useState<string>('northern-europe');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'price' | 'quantity'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Publish form state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    allowances: '',
    price: ''
  });

  const regionData = regions[selectedRegion];
  const utilizationPercentage = ((regionData.totalCap - regionData.remainingAllowances) / regionData.totalCap) * 100;

  const sortedSellers = useMemo(() => {
    return [...regionData.sellers].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'price') {
        return (a.pricePerTon - b.pricePerTon) * multiplier;
      }
      return (a.allowancesAvailable - b.allowancesAvailable) * multiplier;
    });
  }, [regionData.sellers, sortBy, sortOrder]);

  const handleQuantityChange = (sellerId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setQuantities({ ...quantities, [sellerId]: numValue });
  };

  const handleSort = (column: 'price' | 'quantity') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handlePurchase = (seller: Seller) => {
    const quantity = quantities[seller.id] || 0;
    if (quantity > 0 && quantity <= seller.allowancesAvailable) {
      setRegions(prev => {
        const next = { ...prev };
        const region = { ...next[selectedRegion] };
        const sellers = [...region.sellers];
        const sellerIndex = sellers.findIndex(s => s.id === seller.id);
        
        if (sellerIndex > -1) {
          sellers[sellerIndex] = {
            ...sellers[sellerIndex],
            allowancesAvailable: sellers[sellerIndex].allowancesAvailable - quantity
          };
          region.sellers = sellers;
          region.remainingAllowances = region.remainingAllowances - quantity;
          next[selectedRegion] = region;
        }
        return next;
      });

      // Reset quantity input
      setQuantities(prev => ({ ...prev, [seller.id]: 0 }));
      
      alert(`Success! Purchase of ${formatNumber(quantity)} tons CO₂ from ${seller.businessName} complete.`);
    }
  };

  const handlePublish = () => {
    const allowancesNum = parseFloat(publishForm.allowances);
    const priceNum = parseFloat(publishForm.price);

    if (allowancesNum > 0 && priceNum > 0 && user?.businessName) {
      setRegions(prev => {
        const next = { ...prev };
        const region = { ...next[selectedRegion] };
        
        // Use a stable ID if possible, but random is fine for this hackathon
        const newSeller: Seller = {
          id: `new-${Date.now()}`,
          businessName: user!.businessName,
          industry: 'Industrial/Tech', 
          allowancesAvailable: allowancesNum,
          pricePerTon: priceNum
        };

        region.sellers = [...region.sellers, newSeller];
        region.remainingAllowances += allowancesNum;
        region.totalCap += allowancesNum;
        next[selectedRegion] = region;
        return next;
      });
      
      setIsPublishModalOpen(false);
      setPublishForm({ allowances: '', price: '' });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#000411] p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#2F4B26]/30 flex items-center justify-center shadow-[0_0_20px_rgba(47,75,38,0.3)]">
                <Building2 className="w-6 h-6 text-[#2F4B26]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#E1EFE6] tracking-tight">Carbon Allowance Marketplace</h1>
                <p className="text-[#AEB7B3] mt-1">Fixed-price trading platform for regional carbon allowances</p>
              </div>
            </div>
            
            <Alert className="bg-[#160C28]/60 border-[#2F4B26]/30 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-[#2F4B26]" />
              <AlertDescription className="text-[#AEB7B3] text-sm">
                This is a simulated marketplace for planning and evaluation purposes. Data represents modeled regional carbon markets to help data center planners assess carbon costs during site selection.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => login('buyer')}
                  className="border-[#2F4B26]/40 text-[#E1EFE6] hover:bg-[#2F4B26]/20"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Mock Login: Buyer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => login('business', 'biz-1', 'Business Owner', 'EcoTech Solutions')}
                  className="border-[#2F4B26]/40 text-[#E1EFE6] hover:bg-[#2F4B26]/20"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Mock Login: Business
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4 bg-[#160C28]/60 p-2 pl-4 rounded-lg border border-[#2F4B26]/20">
                <div className="text-right">
                  <div className="text-xs text-[#AEB7B3] uppercase font-bold tracking-tighter">Logged in as</div>
                  <div className="text-[#E1EFE6] font-medium leading-tight">{user?.name} ({user?.role})</div>
                </div>
                <Button size="icon" variant="ghost" onClick={logout} className="text-[#AEB7B3] hover:text-white">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
            
            {user?.role === 'business' && (
              <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2F4B26] hover:bg-[#3d6133] text-[#E1EFE6] shadow-lg shadow-[#2F4B26]/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Publish Allowances
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#160C28] border-[#2F4B26]/40 text-[#E1EFE6]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Publish New Allowances</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="p-4 bg-[#2F4B26]/10 border border-[#2F4B26]/30 rounded-lg">
                      <div className="text-xs text-[#AEB7B3] uppercase font-bold tracking-wider mb-1">Publishing as</div>
                      <div className="text-lg font-bold text-[#E1EFE6]">{user?.businessName}</div>
                      <div className="text-xs text-[#AEB7B3]">Industry: Industrial/Tech</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="allowances">Additional Quantity (tons)</Label>
                        <Input 
                          id="allowances" 
                          type="number" 
                          placeholder="e.g. 500"
                          value={publishForm.allowances}
                          onChange={e => setPublishForm({...publishForm, allowances: e.target.value})}
                          className="bg-[#000411]/60 border-[#2F4B26]/40 text-[#E1EFE6]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Sale Price (₹/ton)</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          placeholder="e.g. 7500"
                          value={publishForm.price}
                          onChange={e => setPublishForm({...publishForm, price: e.target.value})}
                          className="bg-[#000411]/60 border-[#2F4B26]/40 text-[#E1EFE6]"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPublishModalOpen(false)} className="border-[#2F4B26]/40">Cancel</Button>
                    <Button onClick={handlePublish} className="bg-[#2F4B26] hover:bg-[#3d6133]">Confirm & List Allowances</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Region Selection */}
        <Card className="bg-[#160C28]/80 border-[#2F4B26]/30 p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <label className="text-sm text-[#AEB7B3] uppercase tracking-wider font-semibold">Select Region</label>
            <div className="flex gap-4 items-center">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full max-w-md bg-[#000411]/60 border-[#2F4B26]/40 text-[#E1EFE6] focus:ring-[#2F4B26] focus:border-[#2F4B26]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#160C28] border-[#2F4B26]/40 text-[#E1EFE6]">
                  {Object.entries(regions).map(([key, data]) => (
                    <SelectItem key={key} value={key} className="hover:bg-[#2F4B26]/20 focus:bg-[#2F4B26]/20 focus:text-[#E1EFE6]">
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="h-10 px-4 border-[#2F4B26]/30 text-[#AEB7B3] items-center flex">
                 Region Market Active
              </Badge>
            </div>
          </div>
        </Card>

        {/* Region Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#160C28]/80 border-[#2F4B26]/30 p-6 backdrop-blur-xl hover:border-[#2F4B26]/50 transition-all group">
            <div className="space-y-2">
              <div className="text-xs text-[#AEB7B3] uppercase tracking-wider font-semibold">Total Cap</div>
              <div className="text-3xl font-bold text-[#E1EFE6] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                {formatNumber(regionData.totalCap)}
              </div>
              <div className="text-sm text-[#AEB7B3]">tons CO₂</div>
            </div>
          </Card>

          <Card className="bg-[#160C28]/80 border-[#2F4B26]/30 p-6 backdrop-blur-xl hover:border-[#2F4B26]/50 transition-all group">
            <div className="space-y-2">
              <div className="text-xs text-[#AEB7B3] uppercase tracking-wider font-semibold">Available for Purchase</div>
              <div className="text-3xl font-bold text-[#2F4B26] drop-shadow-[0_0_15px_rgba(47,75,38,0.3)]">
                {formatNumber(regionData.remainingAllowances)}
              </div>
              <div className="text-sm text-[#AEB7B3]">tons CO₂</div>
            </div>
          </Card>

          <Card className="bg-[#160C28]/80 border-[#2F4B26]/30 p-6 backdrop-blur-xl hover:border-[#2F4B26]/50 transition-all group">
            <div className="space-y-2">
              <div className="text-xs text-[#AEB7B3] uppercase tracking-wider font-semibold">Cap Utilization</div>
              <div className="text-3xl font-bold text-[#E1EFE6] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                {utilizationPercentage.toFixed(1)}%
              </div>
              <div className="h-2 bg-[#000411] overflow-hidden mt-3">
                <div 
                  className="h-full bg-gradient-to-r from-[#2F4B26] to-[#3d6133] shadow-[0_0_10px_rgba(47,75,38,0.5)] transition-all duration-500"
                  style={{ width: `${utilizationPercentage}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-[#160C28]/80 border-[#2F4B26]/30 p-6 backdrop-blur-xl hover:border-[#2F4B26]/50 transition-all group">
            <div className="space-y-2">
              <div className="text-xs text-[#AEB7B3] uppercase tracking-wider font-semibold">Average Price</div>
              <div className="text-3xl font-bold text-[#E1EFE6] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                ₹{formatNumber(regionData.averagePrice)}
              </div>
              <div className="text-sm text-[#AEB7B3]">per ton CO₂</div>
            </div>
          </Card>
        </div>

        {/* Marketplace Table */}
        <Card className="bg-[#160C28]/80 border-[#2F4B26]/30 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-[#2F4B26]/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#E1EFE6] tracking-tight">Available Sellers</h2>
                <p className="text-sm text-[#AEB7B3] mt-1">Fixed-price carbon allowances • Partial purchases supported</p>
              </div>
              <Badge className="bg-[#2F4B26]/30 text-[#E1EFE6] border-[#2F4B26]/40 px-4 py-2">
                {sortedSellers.length} Sellers
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#000411]/60">
                <TableRow className="border-b border-[#2F4B26]/20 hover:bg-transparent">
                  <TableHead className="text-[#AEB7B3] font-semibold">Business / Entity</TableHead>
                  <TableHead className="text-[#AEB7B3] font-semibold">Industry</TableHead>
                  <TableHead className="text-[#AEB7B3] font-semibold">
                    <button 
                      onClick={() => handleSort('quantity')}
                      className="flex items-center gap-2 hover:text-[#E1EFE6] transition-colors"
                    >
                      Available (tons CO₂)
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-[#AEB7B3] font-semibold">
                    <button 
                      onClick={() => handleSort('price')}
                      className="flex items-center gap-2 hover:text-[#E1EFE6] transition-colors"
                    >
                      Price per Ton
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-[#AEB7B3] font-semibold">Purchase Quantity</TableHead>
                  <TableHead className="text-[#AEB7B3] font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSellers.map((seller) => {
                  const quantity = quantities[seller.id] || 0;
                  const totalCost = quantity * seller.pricePerTon;
                  const isValidQuantity = quantity > 0 && quantity <= seller.allowancesAvailable;
                  const exceedsAvailable = quantity > seller.allowancesAvailable;

                  return (
                    <TableRow 
                      key={seller.id} 
                      className="border-b border-[#2F4B26]/10 hover:bg-[#2F4B26]/10 transition-colors"
                    >
                      <TableCell className="font-medium text-[#E1EFE6]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2F4B26]/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-[#2F4B26]" />
                          </div>
                          <div>
                            <div>{seller.businessName}</div>
                            {quantity > 0 && isValidQuantity && (
                              <div className="text-xs text-[#AEB7B3] mt-1">
                                Total: ₹{formatNumber(totalCost)}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#AEB7B3]">
                        <Badge variant="outline" className="border-[#2F4B26]/30 text-[#AEB7B3]">
                          {seller.industry}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#E1EFE6] font-semibold">
                        {formatNumber(seller.allowancesAvailable)}
                      </TableCell>
                      <TableCell className="text-[#2F4B26] font-bold text-lg">
                        ₹{formatNumber(seller.pricePerTon)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="0"
                            max={seller.allowancesAvailable}
                            step="0.1"
                            placeholder="Enter tons"
                            value={quantities[seller.id] || ''}
                            onChange={(e) => handleQuantityChange(seller.id, e.target.value)}
                            className={`w-32 bg-[#000411]/60 border-[#2F4B26]/40 text-[#E1EFE6] focus:border-[#2F4B26] focus:ring-[#2F4B26] ${
                              exceedsAvailable ? 'border-red-500/50' : ''
                            }`}
                          />
                          {exceedsAvailable && (
                            <div className="text-xs text-red-400">Exceeds available</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => handlePurchase(seller)}
                            disabled={!isValidQuantity || !isAuthenticated || user?.role !== 'buyer'}
                            className="bg-[#2F4B26] hover:bg-[#3d6133] text-[#E1EFE6] disabled:opacity-40 disabled:cursor-not-allowed gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(47,75,38,0.4)] transition-all"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {user?.role === 'business' ? 'Not Eligible' : 'Buy Allowances'}
                          </Button>
                          {!isAuthenticated && (
                            <div className="text-[10px] text-[#AEB7B3] text-center">Login as Buyer to trade</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Footer Info */}
        <Card className="bg-[#160C28]/60 border-[#2F4B26]/20 p-6 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-[#2F4B26] mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#E1EFE6] uppercase tracking-wider">About This Marketplace</h3>
              <p className="text-sm text-[#AEB7B3] leading-relaxed">
                This marketplace simulates regional carbon allowance trading to help data center planners evaluate carbon costs during site selection. 
                Prices are fixed (not auction-based), and partial purchases are supported. All data represents modeled market conditions 
                based on regional carbon policies and availability projections.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
