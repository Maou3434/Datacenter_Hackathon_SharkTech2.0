import { useEffect, useRef } from 'react';

export default function GeometricGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let time = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = 60;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          const offset = Math.sin(time + i * 0.5 + j * 0.5) * 10;
          
          // Draw angular connection lines - MUCH BRIGHTER
          ctx.strokeStyle = `rgba(47, 75, 38, ${0.7 + Math.abs(offset) * 0.1})`;
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + gridSize, y);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + gridSize);
          ctx.stroke();
          
          // Draw corner markers - MUCH BRIGHTER
          if ((i + j) % 3 === 0) {
            const size = 5 + Math.abs(offset) * 0.5;
            ctx.fillStyle = `rgba(47, 75, 38, ${0.85 + Math.abs(offset) * 0.08})`;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            
            // Add bright glow around markers
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(47, 75, 38, 0.9)';
            ctx.fillStyle = `rgba(225, 239, 230, ${0.4 + Math.abs(offset) * 0.06})`;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            ctx.shadowBlur = 0;
          }
          
          // Add glowing nodes at intersections - BRIGHTER
          if ((i + j) % 4 === 0) {
            const pulse = Math.sin(time * 2 + i + j) * 0.5 + 0.5;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(225, 239, 230, 0.9)';
            ctx.fillStyle = `rgba(225, 239, 230, ${0.6 + pulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          
          // Add diagonal connection lines for more density
          if ((i + j) % 5 === 0) {
            ctx.strokeStyle = `rgba(47, 75, 38, ${0.5 + Math.abs(offset) * 0.08})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize, y + gridSize);
            ctx.stroke();
          }
        }
      }
      
      // Add floating particles
      const numParticles = 20;
      for (let p = 0; p < numParticles; p++) {
        const px = (Math.sin(time * 0.3 + p * 1.5) * 0.5 + 0.5) * canvas.width;
        const py = (Math.cos(time * 0.2 + p * 2) * 0.5 + 0.5) * canvas.height;
        const pulse = Math.sin(time * 3 + p) * 0.5 + 0.5;
        
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(225, 239, 230, 0.8)';
        ctx.fillStyle = `rgba(225, 239, 230, ${0.6 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      time += 0.02;
      frameRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className="w-full h-full opacity-90"
    />
  );
}
