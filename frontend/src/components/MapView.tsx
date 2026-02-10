import React, { useEffect, useRef, useState } from 'react';
import { LocationData, WeightFactors, Constraints } from '../types';
import { getSuitabilityColor, calculateSuitability } from '../utils/calculations';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';

interface MapViewProps {
  data: LocationData[];
  weights: WeightFactors;
  constraints: Constraints;
  onLocationSelect: (location: LocationData | null) => void;
}

export default function MapView({ data, weights, constraints, onLocationSelect }: MapViewProps) {
  const baseMapRef = useRef<HTMLDivElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

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

  // Convert lat/lng to pixel position using Web Mercator projection
  const latLngToPixel = (lat: number, lng: number) => {
    const tileSize = 256;
    const totalSize = Math.pow(2, zoom) * tileSize;

    const lonToX = (lon: number) => (lon + 180) / 360 * totalSize;
    const latToY = (l: number) => {
      const latRad = l * Math.PI / 180;
      return (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * totalSize;
    };

    const centerX = lonToX(center.lng);
    const centerY = latToY(center.lat);

    const x = dimensions.width / 2 + (lonToX(lng) - centerX);
    const y = dimensions.height / 2 + (latToY(lat) - centerY);

    return { x, y };
  };

  // Convert pixel to lat/lng (Inverse Web Mercator)
  const pixelToLatLng = (x: number, y: number) => {
    const tileSize = 256;
    const totalSize = Math.pow(2, zoom) * tileSize;

    const centerX = (center.lng + 180) / 360 * totalSize;
    const latRadCenter = center.lat * Math.PI / 180;
    const centerY = (1 - Math.log(Math.tan(latRadCenter) + 1 / Math.cos(latRadCenter)) / Math.PI) / 2 * totalSize;

    const worldX = centerX + (x - dimensions.width / 2);
    const worldY = centerY + (y - dimensions.height / 2);

    const lng = (worldX / totalSize) * 360 - 180;
    const n = Math.PI - 2 * Math.PI * worldY / totalSize;
    const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    return { lat, lng };
  };

  // Draw heatmap
  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Determine decimation (Level of Detail) based on zoom
    // Higher skip rate when zoomed out
    const skipRate = zoom < 2 ? 15 : zoom < 3 ? 8 : zoom < 4 ? 3 : 1;

    // Performance optimization: only iterate over a subset of points when zoomed out
    // and only for those that are likely visible
    for (let i = 0; i < data.length; i += skipRate) {
      const location = data[i];
      if (location.excluded) continue;

      // Quick bounding box check before expensive projection
      // This helps if the dataset is global but we are zoomed into a continent
      const { x, y } = latLngToPixel(location.lat, location.lng);

      if (
        x < -20 || x > dimensions.width + 20 ||
        y < -20 || y > dimensions.height + 20
      ) {
        continue;
      }

      // Calculate suitability on the fly only for visible points
      const processed = calculateSuitability(location, weights, constraints);
      if (processed.suitability === 0) continue;

      const color = getSuitabilityColor(processed.suitability, false);
      const size = Math.max(1, Math.min(6, 2 * Math.pow(1.2, zoom - 2)));

      ctx.fillStyle = color;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }, [data, dimensions, center, zoom, weights, constraints]);

  // Draw base map tiles
  useEffect(() => {
    const container = baseMapRef.current;
    if (!container) return;

    container.innerHTML = '';

    const tileSize = 256;
    const totalTiles = Math.pow(2, Math.floor(zoom));
    const factionalZoom = zoom - Math.floor(zoom);
    const scale = Math.pow(2, factionalZoom);

    // Standard Mercator projection for tiles
    const lonToX = (lon: number, z: number) => (lon + 180) / 360 * Math.pow(2, z);
    const latToY = (lat: number, z: number) => {
      const latRad = lat * Math.PI / 180;
      return (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, z);
    };

    const centerTileX = lonToX(center.lng, Math.floor(zoom));
    const centerTileY = latToY(center.lat, Math.floor(zoom));

    const tilesAcross = Math.ceil(dimensions.width / (tileSize * scale)) + 2;
    const tilesDown = Math.ceil(dimensions.height / (tileSize * scale)) + 2;

    const startX = Math.floor(centerTileX - tilesAcross / 2);
    const startY = Math.floor(centerTileY - tilesDown / 2);

    for (let x = startX; x < startX + tilesAcross; x++) {
      for (let y = startY; y < startY + tilesDown; y++) {
        if (x < 0 || x >= totalTiles) continue;
        if (y < 0 || y >= totalTiles) continue;

        const tileX = x;
        const tileY = y;

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
    setDragStart({ x: e.clientX, y: e.clientY, lat: center.lat, lng: center.lng });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart.x !== 0 || dragStart.y !== 0) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only start dragging if the mouse has moved more than 5 pixels
      if (!isDragging && distance > 5) {
        setIsDragging(true);
      }

      if (isDragging) {
        const { lat: newLat, lng: newLng } = pixelToLatLng(
          dimensions.width / 2 - dx,
          dimensions.height / 2 - dy
        );

        setCenter({
          lat: Math.max(-85, Math.min(85, newLat)),
          lng: Math.max(-180, Math.min(180, newLng))
        });
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If movement was minimal, it's a click even if isDragging was briefly true due to jitter
    if (!isDragging || distance < 10) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Optimized Search: Convert click to Lat/Lng and only check nearby points
        const { lat: clickLat, lng: clickLng } = pixelToLatLng(mouseX, mouseY);

        let closestPoint: LocationData | null = null;
        let minDistance = Infinity;

        // Coarse range filter (approx 50km radius for a roughly 5km grid)
        const latDelta = 0.5;
        const lngDelta = 0.5;

        for (let i = 0; i < data.length; i++) {
          const location = data[i];

          // Performance: Filter by Lat/Lng before calculating pixels
          if (
            Math.abs(location.lat - clickLat) > latDelta ||
            Math.abs(location.lng - clickLng) > lngDelta
          ) {
            continue;
          }

          const pos = latLngToPixel(location.lat, location.lng);
          const dist = Math.sqrt(
            Math.pow(pos.x - mouseX, 2) + Math.pow(pos.y - mouseY, 2)
          );

          const detectionRadius = 30;

          if (dist < detectionRadius && dist < minDistance) {
            // Calculate suitability for the selected point
            closestPoint = calculateSuitability(location, weights, constraints);
            minDistance = dist;
          }
        }

        onLocationSelect(closestPoint);
      }
    }

    setIsDragging(false);
    setDragStart({ x: 0, y: 0, lat: 20, lng: 0 });
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
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
          mixBlendMode: 'normal',
          opacity: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Zoom controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-[500]">
        <Button
          size="icon"
          variant="secondary"
          className="bg-[#1e293b] border border-[#fcfdbf]/30 shadow-xl hover:bg-[#fcfdbf]/20 hover:border-[#fcfdbf] text-[#f1f5f9] rounded-lg backdrop-blur-xl"
          onClick={handleZoomIn}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-[#1e293b] border border-[#fcfdbf]/30 shadow-xl hover:bg-[#fcfdbf]/20 hover:border-[#fcfdbf] text-[#f1f5f9] rounded-lg backdrop-blur-xl"
          onClick={handleZoomOut}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-[#1e293b] border border-[#fcfdbf]/30 shadow-xl hover:bg-[#fcfdbf]/20 hover:border-[#fcfdbf] text-[#f1f5f9] rounded-lg backdrop-blur-xl"
          onClick={handleReset}
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-6 right-6 border border-[#fcfdbf]/40 rounded-xl p-4 shadow-2xl z-[500] ring-1 ring-inset ring-white/10"
        style={{ backgroundColor: '#1e293b', opacity: 1 }}
      >
        <h4 className="font-bold text-sm mb-3 text-[#f1f5f9] tracking-tight">Suitability Index</h4>
        <div className="w-12 h-1 bg-gradient-to-r from-[#3b0f70] to-[#fcfdbf] mb-4 rounded-full" />
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-6 h-3.5 rounded-sm shadow-sm ring-1 ring-black/20" style={{ backgroundColor: '#fcfdbf' }}></div>
            <span className="text-xs font-bold text-[#f1f5f9]">High (≥80%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3.5 rounded-sm shadow-sm ring-1 ring-black/20" style={{ backgroundColor: '#fe9f6d' }}></div>
            <span className="text-xs font-bold text-[#f1f5f9]">Good (60-80%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3.5 rounded-sm shadow-sm ring-1 ring-black/20" style={{ backgroundColor: '#de4968' }}></div>
            <span className="text-xs font-bold text-[#f1f5f9]">Moderate (50-60%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3.5 rounded-sm shadow-sm ring-1 ring-black/20" style={{ backgroundColor: '#8c2981' }}></div>
            <span className="text-xs font-bold text-[#f1f5f9]">Low (30-50%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-3.5 rounded-sm shadow-sm ring-1 ring-black/20" style={{ backgroundColor: '#3b0f70' }}></div>
            <span className="text-xs font-bold text-[#f1f5f9]">Poor (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 pt-2 mt-2">
            <div className="w-6 h-3.5 rounded-sm shadow-sm ring-1 ring-black/20" style={{ backgroundColor: '#AEB7B3' }}></div>
            <span className="text-xs font-bold text-[#94a3b8]">Excluded Area</span>
          </div>
        </div>
      </div>


      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-[10px] text-[#AEB7B3]/60 bg-[#000411]/80 px-2 py-1 rounded z-[500]">
        © OpenStreetMap
      </div>
    </div>
  );
}