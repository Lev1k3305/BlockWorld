import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      '#f472b6', // Pink
      '#c084fc', // Purple
      '#fbbf24', // Gold
      '#60a5fa', // Sky blue
      '#e879f9', // Magenta
      '#ffffff', // Soft white
    ];

    let particles: Particle[] = [];

    const initParticles = () => {
      const count = Math.min(Math.floor((width * height) / 9000), 120);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.5 + 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.7 + 0.3,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.4 - 0.1, // Slow upwards float
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initParticles();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep fairytale gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#090a16');
      gradient.addColorStop(0.4, '#120d2b');
      gradient.addColorStop(0.75, '#1e113a');
      gradient.addColorStop(1, '#0c071a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Glowing cosmic nebulae (ambient radial gradients)
      const glow1 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.3,
        20,
        width * 0.2,
        height * 0.3,
        width * 0.45
      );
      glow1.addColorStop(0, 'rgba(236, 72, 153, 0.15)');
      glow1.addColorStop(0.6, 'rgba(168, 85, 247, 0.08)');
      glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(
        width * 0.8,
        height * 0.7,
        20,
        width * 0.8,
        height * 0.7,
        width * 0.5
      );
      glow2.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
      glow2.addColorStop(0.5, 'rgba(147, 51, 234, 0.08)');
      glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // Render glowing floating particles
      particles.forEach((p) => {
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = Math.max(
          0.1,
          p.alpha + Math.sin(p.pulsePhase) * 0.25
        );

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 4;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
