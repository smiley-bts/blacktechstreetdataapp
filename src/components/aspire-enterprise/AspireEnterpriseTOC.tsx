import { motion } from 'framer-motion';

const tocItems = [
  { id: 'overview-section', label: 'Overview' },
  { id: 'modules-section', label: 'Modules' },
  { id: 'pricing-section', label: 'Pricing' },
  { id: 'why-section', label: 'Why ASPIRE' },
  { id: 'contact-section', label: 'Contact' },
];

export function AspireEnterpriseTOC() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex flex-wrap justify-center gap-2 py-6"
    >
      {tocItems.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 + index * 0.05 }}
          onClick={() => scrollToSection(item.id)}
          className="relative px-4 py-2 text-sm font-medium text-muted-foreground rounded-full 
                     border border-border/50 bg-card/30 backdrop-blur-sm
                     hover:text-primary hover:border-primary/50 hover:bg-primary/5
                     transition-all duration-300 group"
        >
          {/* Glow on hover */}
          <span className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 
                          transition-all duration-300 blur-sm" />
          <span className="relative">{item.label}</span>
        </motion.button>
      ))}
    </motion.nav>
  );
}
