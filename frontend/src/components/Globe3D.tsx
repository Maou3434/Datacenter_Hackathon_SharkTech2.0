import { useEffect, useRef } from 'react';

interface DataCenter {
  lat: number;
  lng: number;
  name: string;
}

interface Connection {
  from: DataCenter;
  to: DataCenter;
  packets: Packet[];
}

interface Packet {
  progress: number;
  speed: number;
  color: string;
}

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let rotation = 0;
    
    // Expanded data center locations - 20 major hubs
    const dataCenters: DataCenter[] = [
      { lat: 37.7, lng: -122.4, name: 'San Francisco' },
      { lat: 38.9, lng: -77.0, name: 'Virginia' },
      { lat: 33.4, lng: -111.9, name: 'Phoenix' },
      { lat: 41.9, lng: -87.6, name: 'Chicago' },
      { lat: 32.8, lng: -96.8, name: 'Dallas' },
      { lat: 51.5, lng: -0.1, name: 'London' },
      { lat: 52.5, lng: 13.4, name: 'Frankfurt' },
      { lat: 48.9, lng: 2.3, name: 'Paris' },
      { lat: 52.4, lng: 4.9, name: 'Amsterdam' },
      { lat: 59.3, lng: 18.1, name: 'Stockholm' },
      { lat: 1.3, lng: 103.8, name: 'Singapore' },
      { lat: 35.7, lng: 139.7, name: 'Tokyo' },
      { lat: 37.6, lng: 126.9, name: 'Seoul' },
      { lat: 31.2, lng: 121.5, name: 'Shanghai' },
      { lat: 22.3, lng: 114.2, name: 'Hong Kong' },
      { lat: -33.9, lng: 151.2, name: 'Sydney' },
      { lat: 19.1, lng: 72.9, name: 'Mumbai' },
      { lat: -23.5, lng: -46.6, name: 'São Paulo' },
      { lat: 45.5, lng: -73.6, name: 'Montreal' },
      { lat: 25.3, lng: 55.3, name: 'Dubai' },
    ];
    
    // Create more connections between data centers
    const connections: Connection[] = [
      // Trans-Atlantic
      { from: dataCenters[1], to: dataCenters[5], packets: [] },
      { from: dataCenters[0], to: dataCenters[5], packets: [] },
      { from: dataCenters[1], to: dataCenters[6], packets: [] },
      { from: dataCenters[1], to: dataCenters[8], packets: [] },
      // Europe internal
      { from: dataCenters[5], to: dataCenters[6], packets: [] },
      { from: dataCenters[6], to: dataCenters[8], packets: [] },
      { from: dataCenters[8], to: dataCenters[9], packets: [] },
      { from: dataCenters[7], to: dataCenters[5], packets: [] },
      // Europe-Asia
      { from: dataCenters[6], to: dataCenters[10], packets: [] },
      { from: dataCenters[5], to: dataCenters[11], packets: [] },
      { from: dataCenters[6], to: dataCenters[19], packets: [] },
      { from: dataCenters[19], to: dataCenters[16], packets: [] },
      // Trans-Pacific
      { from: dataCenters[0], to: dataCenters[11], packets: [] },
      { from: dataCenters[11], to: dataCenters[15], packets: [] },
      { from: dataCenters[0], to: dataCenters[10], packets: [] },
      // US Cross-country
      { from: dataCenters[0], to: dataCenters[1], packets: [] },
      { from: dataCenters[0], to: dataCenters[2], packets: [] },
      { from: dataCenters[2], to: dataCenters[4], packets: [] },
      { from: dataCenters[3], to: dataCenters[1], packets: [] },
      { from: dataCenters[4], to: dataCenters[1], packets: [] },
      // Asia connections
      { from: dataCenters[10], to: dataCenters[11], packets: [] },
      { from: dataCenters[10], to: dataCenters[16], packets: [] },
      { from: dataCenters[11], to: dataCenters[12], packets: [] },
      { from: dataCenters[12], to: dataCenters[13], packets: [] },
      { from: dataCenters[13], to: dataCenters[14], packets: [] },
      { from: dataCenters[14], to: dataCenters[10], packets: [] },
      // Australia
      { from: dataCenters[15], to: dataCenters[10], packets: [] },
      // South America
      { from: dataCenters[1], to: dataCenters[17], packets: [] },
      { from: dataCenters[17], to: dataCenters[5], packets: [] },
      // North America - Canada
      { from: dataCenters[18], to: dataCenters[1], packets: [] },
      { from: dataCenters[18], to: dataCenters[3], packets: [] },
    ];
    
    // Initialize packets
    connections.forEach(conn => {
      const numPackets = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numPackets; i++) {
        conn.packets.push({
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          color: Math.random() > 0.5 ? '#2F4B26' : '#4a6e3d'
        });
      }
    });
    
    // Simplified continent outlines (rough approximations)
    const continents = [
      // North America
      [
        { lat: 70, lng: -170 }, { lat: 70, lng: -50 }, { lat: 45, lng: -50 },
        { lat: 25, lng: -80 }, { lat: 15, lng: -85 }, { lat: 10, lng: -90 },
        { lat: 15, lng: -110 }, { lat: 30, lng: -120 }, { lat: 50, lng: -130 },
        { lat: 60, lng: -140 }, { lat: 70, lng: -170 }
      ],
      // South America
      [
        { lat: 10, lng: -80 }, { lat: -5, lng: -75 }, { lat: -20, lng: -70 },
        { lat: -35, lng: -65 }, { lat: -55, lng: -70 }, { lat: -50, lng: -75 },
        { lat: -20, lng: -50 }, { lat: -5, lng: -35 }, { lat: 10, lng: -50 },
        { lat: 10, lng: -80 }
      ],
      // Europe
      [
        { lat: 70, lng: -10 }, { lat: 70, lng: 40 }, { lat: 60, lng: 60 },
        { lat: 50, lng: 50 }, { lat: 40, lng: 40 }, { lat: 35, lng: 10 },
        { lat: 35, lng: -10 }, { lat: 45, lng: -10 }, { lat: 55, lng: -5 },
        { lat: 60, lng: -5 }, { lat: 70, lng: -10 }
      ],
      // Africa
      [
        { lat: 35, lng: -10 }, { lat: 35, lng: 50 }, { lat: 20, lng: 50 },
        { lat: 10, lng: 40 }, { lat: -10, lng: 40 }, { lat: -30, lng: 30 },
        { lat: -35, lng: 20 }, { lat: -30, lng: 15 }, { lat: -10, lng: 10 },
        { lat: 10, lng: 15 }, { lat: 35, lng: -10 }
      ],
      // Asia
      [
        { lat: 70, lng: 40 }, { lat: 75, lng: 100 }, { lat: 70, lng: 180 },
        { lat: 50, lng: 150 }, { lat: 35, lng: 140 }, { lat: 20, lng: 120 },
        { lat: 0, lng: 100 }, { lat: -10, lng: 120 }, { lat: 10, lng: 100 },
        { lat: 20, lng: 80 }, { lat: 30, lng: 70 }, { lat: 40, lng: 60 },
        { lat: 50, lng: 50 }, { lat: 70, lng: 40 }
      ],
      // Australia
      [
        { lat: -10, lng: 115 }, { lat: -15, lng: 130 }, { lat: -25, lng: 150 },
        { lat: -40, lng: 145 }, { lat: -40, lng: 115 }, { lat: -25, lng: 113 },
        { lat: -10, lng: 115 }
      ]
    ];
    
    // Draw continents on the globe
    const drawContinents = (centerX: number, centerY: number, radius: number, rot: number) => {
      ctx.strokeStyle = 'rgba(47, 75, 38, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(47, 75, 38, 0.12)';
      
      continents.forEach(continent => {
        ctx.beginPath();
        let isFirstPoint = true;
        
        continent.forEach(point => {
          const latRad = point.lat * Math.PI / 180;
          const lngRad = (point.lng / 180) * Math.PI + rot;
          
          const x3d = Math.cos(latRad) * Math.cos(lngRad);
          const y3d = Math.sin(latRad);
          const z3d = Math.cos(latRad) * Math.sin(lngRad);
          
          // Only draw if visible (front-facing)
          if (z3d > -0.2) {
            const x = centerX + x3d * radius * 0.85;
            const y = centerY - y3d * radius * 0.85;
            
            if (isFirstPoint) {
              ctx.moveTo(x, y);
              isFirstPoint = false;
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    };
    
    // Simplified world map grid
    const drawWorldMap = (centerX: number, centerY: number, radius: number, rot: number) => {
      ctx.strokeStyle = 'rgba(47, 75, 38, 0.2)';
      ctx.lineWidth = 0.5;
      
      // Draw latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lng = -180; lng <= 180; lng += 5) {
          const angle = (lng / 180) * Math.PI + rot;
          const z = Math.sin(angle);
          
          if (z > -0.2) {
            const x = centerX + Math.cos(angle) * radius * Math.cos(lat * Math.PI / 180) * 0.85;
            const y = centerY + Math.sin(lat * Math.PI / 180) * radius * 0.85;
            
            if (lng === -180) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Draw longitude lines
      for (let lng = -180; lng <= 180; lng += 30) {
        ctx.beginPath();
        for (let lat = -80; lat <= 80; lat += 5) {
          const angle = (lng / 180) * Math.PI + rot;
          const z = Math.sin(angle);
          
          if (z > -0.2) {
            const x = centerX + Math.cos(angle) * radius * Math.cos(lat * Math.PI / 180) * 0.85;
            const y = centerY + Math.sin(lat * Math.PI / 180) * radius * 0.85;
            
            if (lat === -80) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };
    
    // Convert lat/lng to 3D position
    const latLngTo3D = (lat: number, lng: number, rot: number) => {
      const latRad = lat * Math.PI / 180;
      const lngRad = (lng / 180) * Math.PI + rot;
      
      const x = Math.cos(latRad) * Math.cos(lngRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lngRad);
      
      return { x, y, z };
    };
    
    // Project 3D to 2D
    const project3D = (x: number, y: number, z: number, centerX: number, centerY: number, radius: number) => {
      return {
        x: centerX + x * radius * 0.85,
        y: centerY - y * radius * 0.85,
        z: z
      };
    };
    
    // Draw curved connection between two points
    const drawConnection = (from: DataCenter, to: DataCenter, centerX: number, centerY: number, radius: number, rot: number) => {
      const fromPos = latLngTo3D(from.lat, from.lng, rot);
      const toPos = latLngTo3D(to.lat, to.lng, rot);
      
      const fromProj = project3D(fromPos.x, fromPos.y, fromPos.z, centerX, centerY, radius);
      const toProj = project3D(toPos.x, toPos.y, toPos.z, centerX, centerY, radius);
      
      // Only draw if both points are visible (front-facing)
      if (fromProj.z < -0.1 || toProj.z < -0.1) return null;
      
      // Draw curved path (arc above the globe)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(47, 75, 38, 0.2)';
      ctx.lineWidth = 1.5;
      
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        
        // Interpolate between from and to
        const interpX = fromPos.x + (toPos.x - fromPos.x) * t;
        const interpY = fromPos.y + (toPos.y - fromPos.y) * t;
        const interpZ = fromPos.z + (toPos.z - fromPos.z) * t;
        
        // Add arc height
        const arcHeight = Math.sin(t * Math.PI) * 0.3;
        const length = Math.sqrt(interpX * interpX + interpY * interpY + interpZ * interpZ);
        
        const arcX = interpX * (1 + arcHeight) / length;
        const arcY = interpY * (1 + arcHeight) / length;
        const arcZ = interpZ * (1 + arcHeight) / length;
        
        const proj = project3D(arcX, arcY, arcZ, centerX, centerY, radius);
        
        if (i === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.stroke();
      
      return { fromProj, toProj, fromPos, toPos };
    };
    
    const drawGlobe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;
      
      // Draw globe sphere with gradient
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgba(22, 12, 40, 0.9)');
      gradient.addColorStop(0.5, 'rgba(0, 4, 17, 0.95)');
      gradient.addColorStop(1, 'rgba(0, 4, 17, 1)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw outer glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.95, centerX, centerY, radius * 1.15);
      glowGradient.addColorStop(0, 'rgba(47, 75, 38, 0.25)');
      glowGradient.addColorStop(1, 'rgba(47, 75, 38, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      // Draw world map grid
      drawWorldMap(centerX, centerY, radius, rotation);
      
      // Draw continents
      drawContinents(centerX, centerY, radius, rotation);
      
      // Draw connections and packets
      connections.forEach(conn => {
        const pathData = drawConnection(conn.from, conn.to, centerX, centerY, radius, rotation);
        
        if (pathData) {
          // Draw animated packets along the path
          conn.packets.forEach(packet => {
            const t = packet.progress;
            
            const fromPos = latLngTo3D(conn.from.lat, conn.from.lng, rotation);
            const toPos = latLngTo3D(conn.to.lat, conn.to.lng, rotation);
            
            // Interpolate position
            const interpX = fromPos.x + (toPos.x - fromPos.x) * t;
            const interpY = fromPos.y + (toPos.y - fromPos.y) * t;
            const interpZ = fromPos.z + (toPos.z - fromPos.z) * t;
            
            // Add arc
            const arcHeight = Math.sin(t * Math.PI) * 0.3;
            const length = Math.sqrt(interpX * interpX + interpY * interpY + interpZ * interpZ);
            
            const arcX = interpX * (1 + arcHeight) / length;
            const arcY = interpY * (1 + arcHeight) / length;
            const arcZ = interpZ * (1 + arcHeight) / length;
            
            const proj = project3D(arcX, arcY, arcZ, centerX, centerY, radius);
            
            if (proj.z > -0.1) {
              // Draw packet with trail
              const trailLength = 8;
              for (let i = 0; i < trailLength; i++) {
                const trailT = Math.max(0, t - i * 0.02);
                const trailInterpX = fromPos.x + (toPos.x - fromPos.x) * trailT;
                const trailInterpY = fromPos.y + (toPos.y - fromPos.y) * trailT;
                const trailInterpZ = fromPos.z + (toPos.z - fromPos.z) * trailT;
                
                const trailArcHeight = Math.sin(trailT * Math.PI) * 0.3;
                const trailArcX = trailInterpX * (1 + trailArcHeight) / length;
                const trailArcY = trailInterpY * (1 + trailArcHeight) / length;
                const trailArcZ = trailInterpZ * (1 + trailArcHeight) / length;
                
                const trailProj = project3D(trailArcX, trailArcY, trailArcZ, centerX, centerY, radius);
                
                const alpha = (1 - i / trailLength) * 0.6;
                const size = (1 - i / trailLength) * 2.5;
                
                ctx.beginPath();
                ctx.arc(trailProj.x, trailProj.y, size, 0, Math.PI * 2);
                ctx.fillStyle = packet.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();
              }
              
              // Draw main packet
              ctx.beginPath();
              ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
              ctx.fillStyle = packet.color;
              ctx.fill();
              
              // Glow around packet
              const packetGlow = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, 8);
              packetGlow.addColorStop(0, packet.color + 'aa');
              packetGlow.addColorStop(1, packet.color + '00');
              
              ctx.beginPath();
              ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
              ctx.fillStyle = packetGlow;
              ctx.fill();
            }
            
            // Update packet progress
            packet.progress += packet.speed;
            if (packet.progress > 1) {
              packet.progress = 0;
            }
          });
        }
      });
      
      // Draw data centers
      dataCenters.forEach(dc => {
        const pos = latLngTo3D(dc.lat, dc.lng, rotation);
        const proj = project3D(pos.x, pos.y, pos.z, centerX, centerY, radius);
        
        if (proj.z > -0.2) {
          const alpha = (proj.z + 0.2) * 0.8;
          
          // Pulsing glow
          const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
          
          // Outer glow
          const dcGlow = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, 15 * pulse);
          dcGlow.addColorStop(0, `rgba(47, 75, 38, ${alpha * 0.5})`);
          dcGlow.addColorStop(1, 'rgba(47, 75, 38, 0)');
          
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 15 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = dcGlow;
          ctx.fill();
          
          // Draw circle for data center (softer than hexagon)
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(22, 12, 40, ${alpha})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(47, 75, 38, ${alpha * 0.9})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Inner core
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(225, 239, 230, ${alpha * 0.8})`;
          ctx.fill();
          
          // Draw rings around active data centers
          if (Math.random() > 0.7) {
            for (let r = 1; r <= 2; r++) {
              ctx.beginPath();
              ctx.arc(proj.x, proj.y, 9 + r * 5, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(47, 75, 38, ${alpha * 0.15 * (3 - r) / 2})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      });
      
      rotation += 0.002;
      frameRef.current = requestAnimationFrame(drawGlobe);
    };
    
    drawGlobe();
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="w-full h-full"
    />
  );
}
