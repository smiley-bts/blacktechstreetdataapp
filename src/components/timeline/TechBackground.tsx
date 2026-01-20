import { motion } from 'framer-motion';

interface TechBackgroundProps {
  isVisible: boolean;
}

export function TechBackground({ isVisible }: TechBackgroundProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
      {[...Array(20)].map((_, i) => (
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
