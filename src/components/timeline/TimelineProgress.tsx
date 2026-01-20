import { motion, useScroll, useSpring } from 'framer-motion';

export function TimelineProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50 origin-left"
      style={{ scaleX }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-primary"
        style={{ scaleX }}
      />
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 blur-sm bg-primary/50"
        style={{ scaleX }}
      />
    </motion.div>
  );
}
