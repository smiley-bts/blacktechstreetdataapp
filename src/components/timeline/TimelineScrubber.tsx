import { motion } from 'framer-motion';
import { TimelineItem } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface TimelineScrubberProps {
  items: TimelineItem[];
  activeId: string | null;
  onNavigate: (id: string) => void;
  isVisible: boolean;
}

const categoryColors: Record<string, string> = {
  Policy: 'bg-chart-blue',
  Partnerships: 'bg-primary',
  Community: 'bg-chart-pink',
  Research: 'bg-chart-purple',
  Events: 'bg-chart-amber',
  Infrastructure: 'bg-chart-cyan',
};

export function TimelineScrubber({ items, activeId, onNavigate, isVisible }: TimelineScrubberProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-1"
    >
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-full p-2 shadow-lg">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group relative flex items-center justify-center w-8 h-8"
            aria-label={`Jump to ${item.title}`}
          >
            {/* Connecting line */}
            {index < items.length - 1 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-1 bg-border/50" />
            )}
            
            {/* Dot */}
            <motion.div
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                activeId === item.id
                  ? `${categoryColors[item.category]} scale-125 ring-2 ring-offset-2 ring-offset-card ring-primary/50`
                  : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/60'
              )}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            />
            
            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-2 py-1 bg-card border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <span className="text-xs font-medium text-foreground">{item.title}</span>
              <span className="block text-xs text-muted-foreground">{item.year}</span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
