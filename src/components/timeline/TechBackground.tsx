import { motion } from 'framer-motion';
import { useMemo } from 'react';

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
    <motion.div
      className="absolute top-0 flex flex-col items-center text-primary/40 font-mono text-xs select-none"
      style={{ left: `${left}%` }}
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ 
        y: ['0%', '100vh'],
        opacity: [0, 0.6, 0.6, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
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
    </motion.div>
  );
}

export function TechBackground({ isVisible }: TechBackgroundProps) {
  const columnCount = 30;
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Matrix rain effect */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(columnCount)].map((_, i) => (
          <MatrixColumn key={i} index={i} totalColumns={columnCount} />
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

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

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

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
    </div>
  );
}
