import { motion } from 'framer-motion';
import { Camera, ArrowRight } from 'lucide-react';
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
      whileHover={{ x: 4 }}
      className="group cursor-pointer"
    >
      <motion.div 
        className={cn(
          'relative flex items-start gap-3 py-3 px-4 rounded-xl',
          'transition-all duration-300',
          'hover:bg-card/80 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5',
          'border border-transparent hover:border-primary/20'
        )}
      >
        {/* BTS brand dot with pulse animation */}
        <div className="relative mt-1.5 shrink-0">
          <motion.div 
            className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background"
            whileHover={{ scale: 1.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
          {/* Glow effect that expands on hover */}
          <motion.div 
            className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary/40 blur-md"
            initial={{ scale: 1, opacity: 0 }}
            whileHover={{ scale: 2, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Ripple effect */}
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Month — Title format with refined typography */}
          <h3 className="text-sm md:text-base font-medium text-foreground leading-snug transition-colors duration-300">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
              {formatMonth(item.date)}
            </span>
            <motion.span 
              className="text-muted-foreground/40 mx-2 inline-block"
              initial={{ width: 8 }}
              whileHover={{ width: 16 }}
            >
              —
            </motion.span>
            <span className="font-semibold group-hover:text-primary transition-colors duration-300">
              {item.title}
            </span>
          </h3>
          
          {/* View Photos Link - animated */}
          {item.galleryEventId && (
            <motion.a
              href="#photo-gallery"
              onClick={(e) => {
                e.preventDefault();
                const gallery = document.getElementById('photo-gallery');
                if (gallery) {
                  gallery.scrollIntoView({ behavior: 'smooth' });
                  window.dispatchEvent(new CustomEvent('setGalleryFilter', { detail: item.galleryEventId }));
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors mt-1.5 group/photos"
              whileHover={{ x: 2 }}
            >
              <Camera className="h-3 w-3 group-hover/photos:scale-110 transition-transform" />
              <span className="relative">
                Photos
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover/photos:w-full transition-all duration-300" />
              </span>
              <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover/photos:opacity-100 group-hover/photos:ml-0 transition-all duration-300" />
            </motion.a>
          )}
        </div>
        
        {/* Hover arrow indicator */}
        <motion.div
          className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -5 }}
          whileHover={{ x: 0 }}
        >
          <ArrowRight className="h-4 w-4 text-primary/50" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
