import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { TimelineItem } from '@/data/timeline';
import { cn } from '@/lib/utils';
import { galleryEvents } from './TimelineGallery';

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
  isCleanMode: boolean;
}

const categoryDots: Record<string, string> = {
  Policy: 'bg-chart-blue',
  Partnerships: 'bg-primary',
  Community: 'bg-chart-pink',
  Research: 'bg-chart-purple',
  Events: 'bg-chart-amber',
  Infrastructure: 'bg-chart-cyan',
};

export function TimelineCard({ item, index, isCleanMode }: TimelineCardProps) {
  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month ? `${monthNames[parseInt(month) - 1]} ${year}` : year;
  };

  return (
    <motion.div
      id={item.id}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="group"
    >
      <div className={cn(
        'relative flex items-start gap-4 py-3 px-4 rounded-xl',
        'transition-all duration-300',
        'hover:bg-card/60 hover:backdrop-blur-sm'
      )}>
        {/* Category dot */}
        <div className={cn(
          'w-3 h-3 rounded-full mt-1.5 shrink-0 ring-2 ring-background',
          categoryDots[item.category]
        )} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Date only */}
          <span className="text-xs text-muted-foreground font-medium">
            {formatDate(item.date)}
          </span>
          
          {/* Title */}
          <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mt-0.5">
            {item.title}
          </h3>
          
          {/* View Photos Link - subtle */}
          {item.galleryEventId && (
            <a
              href="#photo-gallery"
              onClick={(e) => {
                e.preventDefault();
                const gallery = document.getElementById('photo-gallery');
                if (gallery) {
                  gallery.scrollIntoView({ behavior: 'smooth' });
                  window.dispatchEvent(new CustomEvent('setGalleryFilter', { detail: item.galleryEventId }));
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors mt-1"
            >
              <Camera className="h-3 w-3" />
              <span>Photos</span>
            </a>
          )}
        </div>
        
        {/* Featured indicator */}
        {item.isFeatured && (
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
    </motion.div>
  );
}
