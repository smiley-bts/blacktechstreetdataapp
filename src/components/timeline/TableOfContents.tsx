import { motion } from 'framer-motion';
import { Users, Scroll, Calendar, MessageSquareQuote, Image, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'team-section', label: 'Team', icon: Users },
  { id: 'about-section', label: 'Story', icon: Scroll },
  { id: 'timeline-section', label: 'Timeline', icon: Calendar },
  { id: 'impact-section', label: 'Impact', icon: Building },
  { id: 'testimonials', label: 'Voices', icon: MessageSquareQuote },
  { id: 'photo-gallery', label: 'Gallery', icon: Image },
];

export function TableOfContents() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap justify-center gap-2 md:gap-3 py-6"
    >
      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.button
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            onClick={() => scrollToSection(section.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-card/60 backdrop-blur-sm border border-border/40",
              "text-muted-foreground hover:text-primary hover:border-primary/40",
              "transition-all duration-200"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{section.label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
