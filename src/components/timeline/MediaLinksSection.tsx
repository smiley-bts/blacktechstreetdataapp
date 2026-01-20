import { motion } from 'framer-motion';
import { ExternalLink, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaLink {
  title: string;
  source: string;
  url: string;
  logo?: string;
}

interface MediaLinksSectionProps {
  links: MediaLink[];
  isCleanMode?: boolean;
}

const sourceLogos: Record<string, { bg: string; icon: string }> = {
  'Yahoo Finance': { bg: 'bg-purple-600', icon: 'Y!' },
  'FOX23': { bg: 'bg-blue-600', icon: 'FOX' },
  'Tulsa World': { bg: 'bg-red-600', icon: 'TW' },
};

export function MediaLinksSection({ links, isCleanMode = false }: MediaLinksSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
        <Newspaper className="h-4 w-4" />
        <span>Media Coverage</span>
      </div>
      <div className="grid gap-3">
        {links.map((link, index) => {
          const sourceStyle = sourceLogos[link.source] || { bg: 'bg-primary', icon: link.source.charAt(0) };
          
          return (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'group relative flex items-center gap-4 p-4 rounded-xl',
                'bg-secondary/50 border border-border/50',
                'hover:bg-secondary/80 hover:border-primary/30 hover:shadow-lg',
                'transition-all duration-300',
                !isCleanMode && 'hover:shadow-primary/10'
              )}
            >
              {/* Source Logo */}
              <div className={cn(
                'shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
                'text-white font-bold text-xs',
                sourceStyle.bg
              )}>
                {sourceStyle.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {link.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {link.source}
                </p>
              </div>

              {/* External Link Icon */}
              <ExternalLink className="shrink-0 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />

              {/* Hover gradient overlay */}
              {!isCleanMode && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
