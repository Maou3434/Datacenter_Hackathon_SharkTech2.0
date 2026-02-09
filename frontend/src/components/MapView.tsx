import { useEffect, useRef, useState } from 'react';
import { LocationData } from '../types';
import { getSuitabilityColor } from '../utils/calculations';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';

interface MapViewProps {
  data: LocationData[];
  onLocationHover: (location: LocationData | null) => void;
}

export default function MapView({ data, onLocationHover }: MapViewProps) {
  const baseMapRef = useRef<HTMLDivElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [hoveredPoint, setHoveredPoint] = useState<LocationData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Pan and zoom state
  const [center, setCenter] = useState({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, lat: 20, lng: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Convert lat/lng to pixel position
  const latLngToPixel = (lat: number, lng: number) => {
    const scale = Math.pow(2, zoom) * 256 / 360;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const x = centerX + (lng - center.lng) * scale;
    const y = centerY - (lat - center.lat) * scale * Math.cos(center.lat * Math.PI / 180);

    return { x, y };
  };

  // Convert pixel to lat/lng
  const pixelToLatLng = (x: number, y: number) => {
    const scale = Math.pow(2, zoom) * 256 / 360;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    const lng = center.lng + (x - centerX) / scale;
    const lat = center.lat - (y - centerY) / (scale * Math.cos(center.lat * Math.PI / 180));

    return { lat, lng };
  };

  // Draw heatmap overlay
  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw gradient heatmap
    data.forEach(location => {
      if (location.excluded) return;

      const { x, y } = latLngToPixel(location.lat, location.lng);

      // Skip if out of view or invalid data
      if (
        x < -100 || x > dimensions.width + 100 ||
        y < -100 || y > dimensions.height + 100 ||
        isNaN(location.suitability)
      ) {
        return;
      }

      const color = getSuitabilityColor(location.suitability, false);
      const baseRadius = 40;
      const radius = baseRadius * Math.pow(1.5, zoom - 2);

      // Create radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      // Opacity based on suitability (clamped)
      const opacity = Math.max(0.4, Math.min(1, location.suitability * 0.8));
      const alphaHex = Math.floor(opacity * 255).toString(16).padStart(2, '0');

      gradient.addColorStop(0, color + alphaHex);
      gradient.addColorStop(0.4, color + Math.floor(opacity * 180).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, color + '00');

      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }, [data, dimensions, center, zoom]);

  // Draw base map tiles
  useEffect(() => {
    const container = baseMapRef.current;
    if (!container) return;

    container.innerHTML = '';

    const tileSize = 256;
    const numTiles = Math.pow(2, Math.floor(zoom));
    const scale = Math.pow(2, zoom - Math.floor(zoom));

    // Calculate which tiles to load
    const centerTileX = ((center.lng + 180) / 360) * numTiles;
    const centerTileY = ((1 - Math.log(Math.tan(center.lat * Math.PI / 180) + 1 / Math.cos(center.lat * Math.PI / 180)) / Math.PI) / 2) * numTiles;

    const tilesX = Math.ceil(dimensions.width / (tileSize * scale)) + 2;
    const tilesY = Math.ceil(dimensions.height / (tileSize * scale)) + 2;

    const startTileX = Math.floor(centerTileX - tilesX / 2);
    const startTileY = Math.floor(centerTileY - tilesY / 2);

    for (let x = startTileX; x < startTileX + tilesX; x++) {
      for (let y = startTileY; y < startTileY + tilesY; y++) {
        const tileX = ((x % numTiles) + numTiles) % numTiles;
        const tileY = Math.max(0, Math.min(numTiles - 1, y));

        const img = document.createElement('img');
        img.src = `https://tile.openstreetmap.org/${Math.floor(zoom)}/${tileX}/${tileY}.png`;
        img.className = 'absolute';

        const offsetX = (x - centerTileX) * tileSize * scale + dimensions.width / 2;
        const offsetY = (y - centerTileY) * tileSize * scale + dimensions.height / 2;

        img.style.left = `${offsetX}px`;
        img.style.top = `${offsetY}px`;
        img.style.width = `${tileSize * scale}px`;
        img.style.height = `${tileSize * scale}px`;
        img.style.imageRendering = 'crisp-edges';

        container.appendChild(img);
      }
    }
  }, [dimensions, center, zoom]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, lat: center.lat, lng: center.lng });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const scale = Math.pow(2, zoom) * 256 / 360;
      const deltaLng = -dx / scale;
      const deltaLat = dy / (scale * Math.cos(center.lat * Math.PI / 180));

      setCenter({
        lat: Math.max(-85, Math.min(85, dragStart.lat + deltaLat)),
        lng: dragStart.lng + deltaLng
      });
    }

    // Find closest point for hover
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closestPoint: LocationData | null = null;
    let minDistance = Infinity;

    data.forEach(location => {
      const pos = latLngToPixel(location.lat, location.lng);
      const distance = Math.sqrt(
        Math.pow(pos.x - mouseX, 2) + Math.pow(pos.y - mouseY, 2)
      );

      const detectionRadius = 30 * Math.pow(1.5, zoom - 2);

      if (distance < detectionRadius && distance < minDistance) {
        closestPoint = location;
        minDistance = distance;
      }
    });

    setHoveredPoint(closestPoint);
    onLocationHover(closestPoint);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredPoint(null);
    onLocationHover(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setZoom(prev => Math.max(1, Math.min(6, prev + delta)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(6, prev + 0.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(1, prev - 0.5));
  };

  const handleReset = () => {
    setZoom(2);
    setCenter({ lat: 20, lng: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-slate-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Base map tiles */}
      <div
        ref={baseMapRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Heatmap overlay */}
      <canvas
        ref={heatmapCanvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 w-full h-full"
        style={{
          mixBlendMode: 'multiply',
          opacity: 0.7,
          pointerEvents: 'none'
        }}
      />

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="fixed bg-[#160C28] border border-[#2F4B26]/50 shadow-2xl shadow-[#2F4B26]/20 rounded-xl p-4 text-sm z-[1000] pointer-events-none backdrop-blur-xl"
          style={{
            left: tooltipPos.x + 20,
            top: tooltipPos.y + 20,
            maxWidth: '280px'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#2F4B26]/30 pb-2">
              <span className="font-bold text-[#E1EFE6] text-xs">Suitability Score</span>
              <span className="text-2xl font-bold text-[#2F4B26]">
                {(hoveredPoint.suitability * 100).toFixed(0)}%
              </span>
            </div>
            {hoveredPoint.excluded && (
              <div className="text-red-400 font-bold text-xs bg-red-500/10 px-2 py-1 border border-red-500/30 rounded">
                ⚠ Excluded Area
              </div>
            )}
            <div className="grid grid-cols-[100px,1fr] gap-x-3 gap-y-1.5 text-xs">
              <div className="text-[#AEB7B3] font-semibold">Location:</div>
              <div className="font-bold text-[#E1EFE6]">
                {hoveredPoint.lat.toFixed(1)}°, {hoveredPoint.lng.toFixed(1)}°
              </div>

              <div className="text-[#AEB7B3] font-semibold">Temperature:</div>
              <div className="font-bold text-[#E1EFE6]">{hoveredPoint.temperature.toFixed(1)}°C</div>

              <div className="text-[#AEB7B3] font-semibold">Population:</div>
              <div className="font-bold text-[#E1EFE6]">{hoveredPoint.populationDensity}</div>

              <div className="text-[#AEB7B3] font-semibold">Solar:</div>
              <div className="font-bold text-[#E1EFE6]">{hoveredPoint.solarPotential}</div>

              <div className="text-[#AEB7B3] font-semibold">Water:</div>
              <div className="font-bold text-[#E1EFE6]">{hoveredPoint.waterStress}</div>

              <div className="text-[#AEB7B3] font-semibold">Terrain:</div>
              <div className="font-bold text-[#E1EFE6]">{hoveredPoint.terrain}</div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-[500]">
        <Button
          size="icon"
          variant="secondary"
          className="bg-[#160C28] border border-[#2F4B26]/30 shadow-xl hover:bg-[#2F4B26]/20 hover:border-[#2F4B26] text-[#E1EFE6] rounded-lg backdrop-blur-xl"
          onClick={handleZoomIn}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-[#160C28] border border-[#2F4B26]/30 shadow-xl hover:bg-[#2F4B26]/20 hover:border-[#2F4B26] text-[#E1EFE6] rounded-lg backdrop-blur-xl"
          onClick={handleZoomOut}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-[#160C28] border border-[#2F4B26]/30 shadow-xl hover:bg-[#2F4B26]/20 hover:border-[#2F4B26] text-[#E1EFE6] rounded-lg backdrop-blur-xl"
          onClick={handleReset}
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-[#160C28] border border-[#2F4B26]/30 rounded-xl p-4 shadow-xl z-[500] backdrop-blur-xl">
        <h4 className="font-bold text-sm mb-3 text-[#E1EFE6]">Suitability</h4>
        <div className="w-12 h-0.5 bg-[#2F4B26] mb-3 rounded-full" />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-3 rounded-sm border border-[#2F4B26]/20" style={{ backgroundColor: '#2F4B26' }}></div>
            <span className="text-xs font-semibold text-[#AEB7B3]">High 80-100%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3 rounded-sm border border-[#2F4B26]/20" style={{ backgroundColor: '#4a7640' }}></div>
            <span className="text-xs font-semibold text-[#AEB7B3]">Good 60-80%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3 rounded-sm border border-[#2F4B26]/20" style={{ backgroundColor: '#8b9d83' }}></div>
            <span className="text-xs font-semibold text-[#AEB7B3]">Moderate 50-60%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3 rounded-sm border border-[#2F4B26]/20" style={{ backgroundColor: '#d4954e' }}></div>
            <span className="text-xs font-semibold text-[#AEB7B3]">Low 30-50%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3 rounded-sm border border-[#2F4B26]/20" style={{ backgroundColor: '#c97153' }}></div>
            <span className="text-xs font-semibold text-[#AEB7B3]">Poor &lt;30%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3 rounded-sm border border-[#2F4B26]/20" style={{ backgroundColor: '#AEB7B3' }}></div>
            <span className="text-xs font-semibold text-[#AEB7B3]">Excluded</span>
          </div>
        </div>
      </div>

      {/* Map controls hint */}
      <div className="absolute top-6 left-6 bg-[#160C28] border border-[#2F4B26]/30 rounded-xl px-4 py-3 shadow-xl text-xs z-[500] backdrop-blur-xl">
        <div className="font-bold text-sm mb-2 text-[#E1EFE6]">Controls</div>
        <div className="w-12 h-0.5 bg-[#2F4B26] mb-2 rounded-full" />
        <div className="text-[#AEB7B3] space-y-1 font-medium">
          <div>→ Drag to pan</div>
          <div>→ Scroll to zoom</div>
          <div>→ Hover for details</div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#2F4B26]/20 text-[#AEB7B3] font-semibold">
          Zoom: <span className="text-[#2F4B26]">{zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-[10px] text-[#AEB7B3]/60 bg-[#000411]/80 px-2 py-1 rounded z-[500]">
        © OpenStreetMap
      </div>
    </div>
  );
}