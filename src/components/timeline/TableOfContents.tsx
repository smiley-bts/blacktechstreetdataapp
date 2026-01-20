import { motion } from 'framer-motion';
import { Users, Scroll, Calendar, MessageSquareQuote, Image, Building, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'team-section', label: 'Team', icon: Users },
  { id: 'about-section', label: 'Story', icon: Scroll },
  { id: 'timeline-section', label: 'Timeline', icon: Calendar },
  { id: 'impact-section', label: 'Impact', icon: Building },
  { id: 'testimonials', label: 'Voices', icon: MessageSquareQuote },
  { id: 'news-section', label: 'Media', icon: Play },
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
      className="flex flex-wrap md:flex-nowrap justify-center gap-1.5 md:gap-2 py-6"
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
            whileHover={{ 
              scale: 1.08, 
              y: -2,
              transition: { type: 'spring', stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "group relative flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full",
              "bg-card/60 backdrop-blur-sm border border-border/40",
              "text-muted-foreground",
              "hover:text-primary hover:border-primary/50 hover:bg-primary/10",
              "hover:shadow-lg hover:shadow-primary/20",
              "transition-all duration-300"
            )}
          >
            {/* Glow effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <Icon className="relative h-3.5 w-3.5 md:h-4 md:w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative text-xs md:text-sm font-medium">{section.label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
