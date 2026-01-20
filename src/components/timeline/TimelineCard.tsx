import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowRight, ChevronDown } from 'lucide-react';
import { TimelineItem } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
  isCleanMode: boolean;
}

export function TimelineCard({ item, index, isCleanMode }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatMonth = (dateStr: string) => {
    const [, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month ? monthNames[parseInt(month) - 1] : '';
  };

  const hasExpandableContent = item.longDescription || item.description;

  return (
    <motion.div
      id={item.id}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="group"
    >
      <motion.div 
        className={cn(
          'relative flex items-start gap-3 py-3 px-4 rounded-xl',
          'transition-all duration-300 cursor-pointer',
          'hover:bg-card/80 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5',
          'border border-transparent hover:border-primary/20',
          isExpanded && 'bg-card/60 border-primary/30 shadow-lg shadow-primary/10'
        )}
        onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
        whileHover={{ x: isExpanded ? 0 : 4 }}
      >
        {/* BTS brand dot with pulse animation */}
        <div className="relative mt-1.5 shrink-0">
          <motion.div 
            className={cn(
              "w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background",
              isExpanded && "ring-primary/30"
            )}
            animate={{ scale: isExpanded ? 1.3 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
          {/* Glow effect */}
          <motion.div 
            className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary/40 blur-md"
            animate={{ scale: isExpanded ? 2 : 1, opacity: isExpanded ? 0.8 : 0 }}
            transition={{ duration: 0.3 }}
          />
          {/* Ripple effect */}
          <div className={cn(
            "absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary/30",
            "opacity-0 group-hover:opacity-100 group-hover:animate-ping",
            isExpanded && "opacity-0 group-hover:opacity-0"
          )} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Month — Title format with refined typography */}
          <h3 className="text-sm md:text-base font-medium text-foreground leading-snug transition-colors duration-300">
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
              isExpanded ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
            )}>
              {formatMonth(item.date)}
            </span>
            <span className="text-muted-foreground/40 mx-2">—</span>
            <span className={cn(
              "font-semibold transition-colors duration-300",
              isExpanded ? "text-primary" : "group-hover:text-primary"
            )}>
              {item.title}
            </span>
          </h3>
          
          {/* Expandable description */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {item.longDescription || item.description}
                </p>
                
                {/* View Photos Link - shown when expanded */}
                {item.galleryEventId && (
                  <motion.a
                    href="#photo-gallery"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const gallery = document.getElementById('photo-gallery');
                      if (gallery) {
                        gallery.scrollIntoView({ behavior: 'smooth' });
                        window.dispatchEvent(new CustomEvent('setGalleryFilter', { detail: item.galleryEventId }));
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-3 group/photos"
                    whileHover={{ x: 2 }}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span className="relative font-medium">
                      View Photos
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover/photos:w-full transition-all duration-300" />
                    </span>
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover/photos:opacity-100 group-hover/photos:ml-0 transition-all duration-300" />
                  </motion.a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Collapsed photos link */}
          {!isExpanded && item.galleryEventId && (
            <motion.a
              href="#photo-gallery"
              onClick={(e) => {
                e.stopPropagation();
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
        
        {/* Expand/collapse indicator */}
        {hasExpandableContent && (
          <motion.div
            className={cn(
              "self-center transition-colors duration-300",
              isExpanded ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/50"
            )}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
