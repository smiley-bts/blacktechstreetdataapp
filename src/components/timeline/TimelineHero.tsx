import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import btsLogo from '@/assets/logos/bts-square-logo.png';

export function TimelineHero() {
  const scrollToTimeline = () => {
    document.getElementById('timeline-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-5 pb-12 pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mb-8"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-border/30 shadow-lg shadow-primary/10">
          <img src={btsLogo} alt="Black Tech Street" className="w-full h-full object-contain" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 -m-2 rounded-3xl bg-primary/10 blur-xl" />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-center max-w-4xl mb-4"
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
        className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mb-8 px-4"
      >
        From the first White House roundtable to national AI leadership, explore Black Tech Street's journey reshaping tech innovation in America.
      </motion.p>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        onClick={scrollToTimeline}
        className="group flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <span className="text-sm font-medium">Explore the Timeline</span>
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
