import { useEffect, useRef, useState } from 'react';

interface FloatingCard3DProps {
  delay?: number;
  children: React.ReactNode;
}

export default function FloatingCard3D({ delay = 0, children }: FloatingCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  
  useEffect(() => {
    let offset = delay;
    
    const animate = () => {
      offset += 0.01;
      const y = Math.sin(offset) * 10;
      const rotateX = Math.sin(offset * 0.7) * 2;
      const rotateY = Math.cos(offset * 0.5) * 2;
      
      setTransform(`translateY(${y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
      requestAnimationFrame(animate);
    };
    
    const animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [delay]);
  
  return (
    <div
      ref={cardRef}
      style={{
        transform,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  );
}
