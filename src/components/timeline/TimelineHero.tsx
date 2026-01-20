import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import btsLogoB from '@/assets/logos/bts-b-logo.png';

// Matrix-style falling characters
const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';

function MatrixRain() {
  const columns = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      chars: [...Array(8)].map(() => matrixChars[Math.floor(Math.random() * matrixChars.length)]),
      left: `${i * 5 + Math.random() * 2}%`,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {columns.map((col) => (
        <motion.div
          key={col.id}
          className="absolute top-0 text-primary font-mono text-xs leading-tight"
          style={{ left: col.left }}
          initial={{ y: '-100%' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: col.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: col.delay,
          }}
        >
          {col.chars.map((char, i) => (
            <motion.div
              key={i}
              className="opacity-70"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              {char}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export function TimelineHero() {
  const scrollToTimeline = () => {
    document.getElementById('timeline-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-5 pb-6 pt-16 overflow-hidden">
      {/* Matrix rain effect */}
      <MatrixRain />
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Horizontal scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Vertical scanning line */}
        <motion.div
          className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
          }}
        />
      </div>
      
      {/* Floating particles with glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 7}%`,
              top: `${15 + (i % 4) * 20}%`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 8px hsl(var(--primary) / 0.6)',
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      {/* Pulsing rings behind logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/20"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
      
      {/* Logo and Text - Horizontal Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6"
      >
        {/* B Logo with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.1,
            type: 'spring',
            stiffness: 200,
          }}
          className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0"
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <img 
            src={btsLogoB} 
            alt="Black Tech Street" 
            className="relative w-full h-full object-contain"
          />
        </motion.div>

        {/* Text with glitch effect on hover */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center md:text-left"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight relative"
            whileHover={{ 
              textShadow: '2px 2px 0 hsl(var(--primary) / 0.3), -2px -2px 0 hsl(var(--primary) / 0.2)',
            }}
          >
            <motion.span
              animate={{
                textShadow: [
                  '0 0 0 transparent',
                  '0 0 10px hsl(var(--primary) / 0.3)',
                  '0 0 0 transparent',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Black Tech Street
            </motion.span>
          </motion.h1>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        onClick={scrollToTimeline}
        className="relative z-10 group flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.button>

      {/* Timeline start marker */}
      <div id="timeline-start" className="absolute bottom-0" />
    </section>
  );
}
