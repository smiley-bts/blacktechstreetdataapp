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

export function TimelineCard({ item, index, isCleanMode }: TimelineCardProps) {
  const formatMonth = (dateStr: string) => {
    const [, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month ? monthNames[parseInt(month) - 1] : '';
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
        {/* BTS brand dot */}
        <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 ring-2 ring-background bg-primary" />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Month - Title format */}
          <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
            <span className="text-muted-foreground font-medium">{formatMonth(item.date)}</span>
            <span className="text-muted-foreground/60 mx-1.5">—</span>
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
