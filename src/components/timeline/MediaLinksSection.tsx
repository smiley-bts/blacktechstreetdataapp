import { motion } from 'framer-motion';
import { ExternalLink, Newspaper, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaLink {
  title: string;
  source: string;
  url: string;
}

interface MediaLinksSectionProps {
  links: MediaLink[];
  isCleanMode?: boolean;
}

const sourceStyles: Record<string, { gradient: string; accent: string; logo: string }> = {
  'Yahoo Finance': { 
    gradient: 'from-purple-900/80 via-purple-800/60 to-purple-900/80',
    accent: 'text-purple-400 border-purple-500/30',
    logo: 'Yahoo Finance'
  },
  'FOX23': { 
    gradient: 'from-blue-900/80 via-blue-800/60 to-blue-900/80',
    accent: 'text-blue-400 border-blue-500/30',
    logo: 'FOX 23'
  },
  'Tulsa World': { 
    gradient: 'from-red-900/80 via-red-800/60 to-red-900/80',
    accent: 'text-red-400 border-red-500/30',
    logo: 'Tulsa World'
  },
  'LinkedIn': { 
    gradient: 'from-[#0A66C2]/80 via-[#004182]/60 to-[#0A66C2]/80',
    accent: 'text-[#0A66C2] border-[#0A66C2]/30',
    logo: 'LinkedIn'
  },
};

export function MediaLinksSection({ links, isCleanMode = false }: MediaLinksSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Newspaper className="h-4 w-4" />
        <span>Media Coverage</span>
      </div>
      
      <div className="grid gap-3">
        {links.map((link, index) => {
          const style = sourceStyles[link.source] || { 
            gradient: 'from-primary/80 via-primary/60 to-primary/80',
            accent: 'text-primary border-primary/30',
            logo: link.source
          };
          
          return (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group block"
            >
              <div className={cn(
                'relative overflow-hidden rounded-xl border border-border/40',
                'bg-card/60 backdrop-blur-sm',
                'hover:border-primary/40 transition-all duration-300',
                'hover:shadow-lg hover:shadow-black/20'
              )}>
                {/* Gradient header bar */}
                <div className={cn(
                  'h-2 w-full bg-gradient-to-r',
                  style.gradient
                )} />
                
                {/* Content */}
                <div className="p-4">
                  {/* Source badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md',
                      'bg-secondary/80 border',
                      style.accent
                    )}>
                      {style.logo}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                  
                  {/* Title */}
                  <h4 className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {link.title}
                  </h4>
                  
                  {/* URL preview */}
                  <p className="text-[10px] text-muted-foreground/60 mt-2 truncate">
                    {new URL(link.url).hostname.replace('www.', '')}
                  </p>
                </div>
                
                {/* Hover overlay */}
                {!isCleanMode && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}