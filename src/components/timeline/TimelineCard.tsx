import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Share2, ChevronDown, ChevronUp, ExternalLink, Camera } from 'lucide-react';
import { TimelineItem } from '@/data/timeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MediaLinksSection } from './MediaLinksSection';
import { galleryEvents } from './TimelineGallery';

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
  isCleanMode: boolean;
}

const categoryColors: Record<string, string> = {
  Policy: 'bg-chart-blue/20 text-chart-blue border-chart-blue/30',
  Partnerships: 'bg-primary/20 text-primary border-primary/30',
  Community: 'bg-chart-pink/20 text-chart-pink border-chart-pink/30',
  Research: 'bg-chart-purple/20 text-chart-purple border-chart-purple/30',
  Events: 'bg-chart-amber/20 text-chart-amber border-chart-amber/30',
  Infrastructure: 'bg-chart-cyan/20 text-chart-cyan border-chart-cyan/30',
};

const categoryGlows: Record<string, string> = {
  Policy: 'shadow-chart-blue/20',
  Partnerships: 'shadow-primary/20',
  Community: 'shadow-chart-pink/20',
  Research: 'shadow-chart-purple/20',
  Events: 'shadow-chart-amber/20',
  Infrastructure: 'shadow-chart-cyan/20',
};

export function TimelineCard({ item, index, isCleanMode }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const hasImage = item.image && item.image !== '/placeholder.svg';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCleanMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/timeline#${item.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month ? `${monthNames[parseInt(month) - 1]} ${year}` : year;
  };

  return (
    <motion.div
      id={item.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={isCleanMode ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 md:p-6',
          'transition-all duration-300',
          !isCleanMode && `hover:shadow-xl ${categoryGlows[item.category]}`,
          !isCleanMode && 'hover:border-primary/30'
        )}
      >
        {/* Tech overlay effect */}
        {!isCleanMode && (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          </div>
        )}

        {/* Date badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {formatDate(item.date)}
            </span>
          </div>
        </div>

        {/* Image removed - photos are in gallery, videos/media in News section */}

        {/* Title and description */}
        <h3 className="text-lg md:text-xl font-display font-semibold text-foreground mb-2 leading-tight">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* View Photos Link */}
        {item.galleryEventId && (
          <a
            href={`#photo-gallery`}
            onClick={(e) => {
              e.preventDefault();
              const gallery = document.getElementById('photo-gallery');
              if (gallery) {
                gallery.scrollIntoView({ behavior: 'smooth' });
                // Dispatch custom event to set the filter
                window.dispatchEvent(new CustomEvent('setGalleryFilter', { detail: item.galleryEventId }));
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <Camera className="h-4 w-4" />
            <span>View Photos ({galleryEvents.find(e => e.id === item.galleryEventId)?.label})</span>
          </a>
        )}

        {/* Expandable details */}
        {item.longDescription && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border/30 mt-4">
                <div className="prose prose-sm prose-invert max-w-none">
                  {item.longDescription.split('\n\n').map((paragraph, i) => (
                    <div key={i} className="mb-3">
                      {paragraph.startsWith('**') ? (
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {paragraph.replace(/\*\*/g, '')}
                        </h4>
                      ) : paragraph.startsWith('-') ? (
                        <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                          {paragraph.split('\n').map((line, j) => (
                            <li key={j}>{line.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm">{paragraph}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Media Links moved to In the News section */}

        {/* Links */}
        {item.links && item.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
            {item.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}

        {/* Photo credit */}
        {item.photoCredit && hasImage && (
          <p className="text-xs text-muted-foreground/60 mt-3">
            Photo: {item.photoCredit}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
