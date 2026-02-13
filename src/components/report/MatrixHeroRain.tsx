import { useEffect, useRef, useCallback } from 'react';

interface MatrixHeroRainProps {
  height?: number;
}

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}[]()=+*&^%$#@!';

export function MatrixHeroRain({ height = 400 }: MatrixHeroRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const columnsRef = useRef<number[]>([]);
  const glowColumnsRef = useRef<Set<number>>(new Set());
  const animFrameRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 14;
    let columns = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      columns = Math.floor(w / fontSize);

      // Preserve existing drops, add new ones if needed
      const oldDrops = columnsRef.current;
      const newDrops = new Array(columns);
      for (let i = 0; i < columns; i++) {
        newDrops[i] = oldDrops[i] !== undefined ? oldDrops[i] : Math.random() * -50;
      }
      columnsRef.current = newDrops;
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove as any);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let lastTime = 0;
    const interval = 45; // ms per frame

    const draw = (time: number) => {
      animFrameRef.current = requestAnimationFrame(draw);
      
      if (time - lastTime < interval) return;
      lastTime = time;

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = height;
      const drops = columnsRef.current;
      const mouse = mouseRef.current;
      const glowRadius = 120;

      // Fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        // Distance from mouse
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = dist < glowRadius;

        if (isNearMouse) {
          glowColumnsRef.current.add(i);
        }

        const isGlowing = glowColumnsRef.current.has(i);
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        if (isNearMouse) {
          // Bright interactive glow near mouse
          const intensity = 1 - dist / glowRadius;
          const green = Math.floor(180 + intensity * 75);
          const alpha = 0.7 + intensity * 0.3;
          ctx.font = `bold ${fontSize + 2}px monospace`;
          ctx.shadowColor = `rgba(16, 185, 129, ${intensity})`;
          ctx.shadowBlur = 15 + intensity * 20;
          ctx.fillStyle = `rgba(${Math.floor(intensity * 100)}, ${green}, ${Math.floor(100 + intensity * 50)}, ${alpha})`;
        } else if (y < fontSize * 2) {
          // Head of column - brightest
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
          ctx.shadowBlur = 12;
          ctx.fillStyle = 'rgba(180, 255, 220, 0.95)';
        } else if (isGlowing) {
          // Recently glowed - fading
          ctx.font = `${fontSize}px monospace`;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
          // Fade out glow over time
          if (Math.random() > 0.97) glowColumnsRef.current.delete(i);
        } else {
          // Normal trail
          ctx.font = `${fontSize}px monospace`;
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          const trailAlpha = Math.max(0.08, 0.35 - (y / h) * 0.2);
          ctx.fillStyle = `rgba(16, 185, 129, ${trailAlpha})`;
        }

        ctx.fillText(char, x, y);

        // Reset shadow for performance
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Reset drop
        if (y > h && Math.random() > 0.975) {
          drops[i] = Math.random() * -10;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }

      // Scan line effect
      const scanY = (time * 0.03) % h;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.fillRect(0, scanY - 2, w, 4);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove as any);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [height, handleMouseMove, handleMouseLeave]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ background: 'transparent' }}
      />
      {/* Bottom fade to blend into content */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }}
      />
    </div>
  );
}
