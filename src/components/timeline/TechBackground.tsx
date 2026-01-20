import { useEffect, useState, useMemo } from 'react';

interface TechBackgroundProps {
  isVisible: boolean;
}

// Matrix-style characters
const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

function MatrixColumn({ index, totalColumns }: { index: number; totalColumns: number }) {
  const chars = useMemo(() => {
    const length = 15 + Math.floor(Math.random() * 20);
    return Array.from({ length }, () => 
      matrixChars[Math.floor(Math.random() * matrixChars.length)]
    );
  }, []);

  const duration = 8 + Math.random() * 12;
  const delay = Math.random() * 10;
  const left = (index / totalColumns) * 100;

  return (
    <div
      className="absolute flex flex-col items-center text-primary/40 font-mono text-xs select-none animate-matrix-fall"
      style={{ 
        left: `${left}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {chars.map((char, i) => (
        <span 
          key={i} 
          className={i === 0 ? 'text-primary brightness-150' : ''}
          style={{ 
            opacity: 1 - (i / chars.length) * 0.7,
            textShadow: i === 0 ? '0 0 10px hsl(var(--primary))' : 'none'
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export function TechBackground({ isVisible }: TechBackgroundProps) {
  const [pageHeight, setPageHeight] = useState(0);
  const columnCount = 40;
  
  useEffect(() => {
    const updateHeight = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Also update when content changes
    const observer = new MutationObserver(updateHeight);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);
  
  if (!isVisible) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={{ height: pageHeight || '100%', minHeight: '100vh' }}
    >
      {/* Matrix rain effect - multiple layers for full coverage */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(columnCount)].map((_, i) => (
          <MatrixColumn key={`a-${i}`} index={i} totalColumns={columnCount} />
        ))}
      </div>
      
      {/* Second wave with different timing */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(Math.floor(columnCount / 2))].map((_, i) => (
          <MatrixColumn key={`b-${i}`} index={i * 2 + 0.5} totalColumns={columnCount} />
        ))}
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient orbs - positioned throughout the page */}
      <div className="absolute top-[10%] left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-[30%] right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute top-[50%] left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-[70%] right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute top-[90%] left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      {/* Corner circuits */}
      <svg className="absolute top-0 left-0 w-40 h-40 text-primary/10" viewBox="0 0 100 100">
        <path d="M0 50 L30 50 L40 40 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M50 0 L50 30 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="60" cy="40" r="2" fill="currentColor" />
      </svg>
      
      <svg className="absolute bottom-0 right-0 w-40 h-40 text-primary/10 rotate-180" viewBox="0 0 100 100">
        <path d="M0 50 L30 50 L40 40 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M50 0 L50 30 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="60" cy="40" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
