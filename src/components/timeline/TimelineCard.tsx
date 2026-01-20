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
        'relative flex items-start gap-3 py-3 px-4 rounded-xl',
        'transition-all duration-300',
        'hover:bg-card/60 hover:backdrop-blur-sm'
      )}>
        {/* BTS brand dot with hover animation */}
        <div className="relative mt-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background group-hover:scale-125 group-hover:ring-primary/30 transition-all duration-300" />
          {/* Glow on hover */}
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary/50 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Month — Title format with refined typography */}
          <h3 className="text-sm md:text-base font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{formatMonth(item.date)}</span>
            <span className="text-muted-foreground/40 mx-2">—</span>
            <span className="font-semibold">{item.title}</span>
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
      </div>
    </motion.div>
  );
}
