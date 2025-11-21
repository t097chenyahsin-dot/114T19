import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  alpha: number;
  size: number;
}

interface FireworksProps {
  onComplete?: () => void;
}

const Fireworks: React.FC<FireworksProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const completeCalled = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;

    // Animation State
    let phase: 'rocket' | 'explosion' | 'frozen' = 'rocket';
    let rocket = {
      x: width / 2,
      y: height,
      // Very slow ascent
      velocity: { x: 0, y: -height * 0.006 }, 
      targetY: height * 0.35
    };
    
    let particles: Particle[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      if (phase === 'rocket') {
        rocket.x = width / 2;
      }
    };

    window.addEventListener('resize', resize);

    const createExplosion = (x: number, y: number) => {
      // Bigger: More particles
      const particleCount = 500; 
      const colors = ['#D946EF', '#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        // Bigger: Higher initial speed range for larger radius
        const speed = Math.random() * 15 + 5; 
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particles.push({
          x: x,
          y: y,
          color: color,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          },
          alpha: 1,
          size: Math.random() * 4 + 2
        });
      }
    };

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Clear canvas completely for crisp static image, or with slight trail during motion
      if (phase === 'frozen') {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.25)'; 
        ctx.fillRect(0, 0, width, height);
      }

      if (phase === 'rocket') {
        // Draw Rocket
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();

        // Move Rocket
        rocket.y += rocket.velocity.y;
        
        // Check if ready to explode
        if (rocket.y <= rocket.targetY) {
          phase = 'explosion';
          createExplosion(rocket.x, rocket.y);
        }
      } 
      else if (phase === 'explosion') {
        let maxSpeed = 0;

        particles.forEach((particle) => {
          // Friction to slow them down
          particle.velocity.x *= 0.96; 
          particle.velocity.y *= 0.96; 
          
          // NO Gravity: User requested "don't slide down"
          // particle.velocity.y += 0.00; 

          // Apply velocity with a time-scale factor for "Slow Motion" feel
          const slowMotionFactor = 0.4;
          particle.x += particle.velocity.x * slowMotionFactor;
          particle.y += particle.velocity.y * slowMotionFactor;

          // Track max speed to detect when it "stops"
          const speed = Math.sqrt(particle.velocity.x ** 2 + particle.velocity.y ** 2);
          if (speed > maxSpeed) maxSpeed = speed;
        });

        // Draw Particles
        particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        });

        // Threshold for freezing
        if (maxSpeed < 0.5) {
          phase = 'frozen';
          if (onComplete && !completeCalled.current) {
            completeCalled.current = true;
            onComplete();
          }
        }
      }
      else if (phase === 'frozen') {
        // Static Render: No physics updates, just draw at last positions
        particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        });
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [onComplete]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default Fireworks;