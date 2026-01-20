import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import btsLogo from '@/assets/logos/bts-square-logo.png';

export function TimelineHero() {
  const scrollToTimeline = () => {
    document.getElementById('timeline-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-5 pb-12 pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20">
          <img src={btsLogo} alt="Black Tech Street" className="w-full h-full object-contain" />
        </div>
        {/* Glow rings */}
        <div className="absolute inset-0 -m-3 rounded-3xl bg-primary/15 blur-xl" />
        <div className="absolute inset-0 -m-6 rounded-3xl bg-primary/5 blur-2xl" />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-center max-w-4xl mb-5"
      >
        <span className="text-gradient-primary">Building the Future</span>
        <br />
        <span className="text-foreground">of Greenwood</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mb-10 px-4 leading-relaxed"
      >
        From the first White House roundtable to national AI leadership, explore Black Tech Street's journey reshaping tech innovation in America.
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        onClick={scrollToTimeline}
        className="group flex flex-col items-center gap-3 text-primary hover:text-primary/80 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
          <Sparkles className="h-4 w-4" />
          Explore the Timeline
        </span>
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
