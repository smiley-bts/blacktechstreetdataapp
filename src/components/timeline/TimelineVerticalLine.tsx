import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { TimelineItem } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface TimelineVerticalLineProps {
  items: TimelineItem[];
  timelineStartRef: React.RefObject<HTMLDivElement>;
  timelineEndRef: React.RefObject<HTMLDivElement>;
}

const categoryColors: Record<string, string> = {
  Policy: 'bg-chart-blue',
  Partnerships: 'bg-primary',
  Community: 'bg-chart-pink',
  Research: 'bg-chart-purple',
  Events: 'bg-chart-amber',
  Infrastructure: 'bg-chart-cyan',
};

export function TimelineVerticalLine({ items, timelineStartRef, timelineEndRef }: TimelineVerticalLineProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dotPositions, setDotPositions] = useState<number[]>([]);
  const lineContainerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: lineContainerRef,
    offset: ["start center", "end center"]
  });
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate dot positions based on item elements
  useEffect(() => {
    const calculatePositions = () => {
      if (!lineContainerRef.current) return;
      
      const containerRect = lineContainerRef.current.getBoundingClientRect();
      const containerTop = lineContainerRef.current.offsetTop;
      const containerHeight = lineContainerRef.current.offsetHeight;
      
      const positions = items.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return 0;
        
        const elRect = el.getBoundingClientRect();
        const elTop = el.offsetTop;
        const relativePosition = (elTop - containerTop + elRect.height / 2) / containerHeight;
        return Math.max(0, Math.min(1, relativePosition));
      });
      
      setDotPositions(positions);
    };

    calculatePositions();
    window.addEventListener('resize', calculatePositions);
    
    // Recalculate after content loads
    const timeout = setTimeout(calculatePositions, 500);
    
    return () => {
      window.removeEventListener('resize', calculatePositions);
      clearTimeout(timeout);
    };
  }, [items]);

  // Track active item based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      
      let closestIndex = -1;
      let closestDistance = Infinity;
      
      items.forEach((item, index) => {
        const el = document.getElementById(item.id);
        if (!el) return;
        
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);
        
        if (distance < closestDistance && rect.top < window.innerHeight && rect.bottom > 0) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      setActiveIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const handleDotClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div 
      ref={lineContainerRef}
      className="absolute left-4 md:left-8 top-0 bottom-0 w-px z-10 hidden md:block"
    >
      {/* Background line */}
      <div className="absolute inset-0 w-px bg-border/30" />
      
      {/* Animated progress line */}
      <motion.div 
        className="absolute top-0 left-0 w-px bg-gradient-to-b from-primary via-primary to-primary/50 origin-top"
        style={{ 
          scaleY,
          height: '100%',
        }}
      />
      
      {/* Glow effect on progress line */}
      <motion.div 
        className="absolute top-0 left-[-1px] w-[3px] bg-primary/30 blur-sm origin-top"
        style={{ 
          scaleY,
          height: '100%',
        }}
      />

      {/* Milestone dots */}
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => handleDotClick(item.id)}
          className="absolute left-1/2 -translate-x-1/2 group z-20"
          style={{ top: `${dotPositions[index] * 100}%` }}
          aria-label={`Jump to ${item.title}`}
        >
          {/* Outer ring on active */}
          <motion.div
            className={cn(
              'absolute inset-0 -m-2 rounded-full',
              activeIndex === index ? 'bg-primary/20' : 'bg-transparent'
            )}
            animate={{
              scale: activeIndex === index ? [1, 1.5, 1] : 1,
              opacity: activeIndex === index ? [0.5, 0, 0.5] : 0,
            }}
            transition={{
              duration: 2,
              repeat: activeIndex === index ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
          
          {/* Main dot */}
          <motion.div
            className={cn(
              'w-3 h-3 rounded-full border-2 transition-all duration-300',
              activeIndex === index
                ? `${categoryColors[item.category]} border-primary shadow-lg shadow-primary/50`
                : 'bg-card border-border/50 group-hover:border-primary/50 group-hover:bg-muted'
            )}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
          
          {/* Tooltip */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30">
            <p className="text-xs font-medium text-foreground">{item.title}</p>
            <p className="text-[10px] text-muted-foreground">{item.year}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
