import { motion } from 'framer-motion';
import { ExternalLink, Newspaper } from 'lucide-react';
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

const sourceStyles: Record<string, { 
  gradient: string; 
  accent: string; 
  logo: string;
  thumbnail: string;
}> = {
  'Yahoo Finance': { 
    gradient: 'from-purple-600 to-purple-800',
    accent: 'text-purple-400 border-purple-500/30',
    logo: 'Yahoo Finance',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop&auto=format'
  },
  'FOX23': { 
    gradient: 'from-blue-600 to-blue-800',
    accent: 'text-blue-400 border-blue-500/30',
    logo: 'FOX 23 News',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&auto=format'
  },
  'Tulsa World': { 
    gradient: 'from-red-600 to-red-800',
    accent: 'text-red-400 border-red-500/30',
    logo: 'Tulsa World',
    thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=200&fit=crop&auto=format'
  },
  'LinkedIn': { 
    gradient: 'from-[#0A66C2] to-[#004182]',
    accent: 'text-[#70b5f9] border-[#0A66C2]/30',
    logo: 'LinkedIn',
    thumbnail: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=400&h=200&fit=crop&auto=format'
  },
};

export function MediaLinksSection({ links, isCleanMode = false }: MediaLinksSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Newspaper className="h-4 w-4" />
        <span>Media Coverage</span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link, index) => {
          const style = sourceStyles[link.source] || { 
            gradient: 'from-primary to-primary/80',
            accent: 'text-primary border-primary/30',
            logo: link.source,
            thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&auto=format'
          };
          
          return (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group block"
            >
              <div className={cn(
                'relative overflow-hidden rounded-xl border border-border/40',
                'bg-card/80 backdrop-blur-sm',
                'hover:border-primary/50 transition-all duration-300',
                'hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1'
              )}>
                {/* Thumbnail */}
                <div className="relative h-28 overflow-hidden">
                  <img 
                    src={style.thumbnail} 
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-t opacity-80',
                    style.gradient
                  )} />
                  {/* Source badge overlay */}
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md',
                      'bg-black/40 backdrop-blur-sm text-white border border-white/20'
                    )}>
                      {style.logo}
                    </span>
                  </div>
                  {/* External link icon */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ExternalLink className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                    {link.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground/60 mt-2 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {new URL(link.url).hostname.replace('www.', '')}
                  </p>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}