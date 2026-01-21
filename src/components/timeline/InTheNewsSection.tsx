import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Play } from 'lucide-react';
import { timelineItems, MediaLink } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface NewsItem {
  type: 'video' | 'article';
  title: string;
  source: string;
  url: string;
  thumbnail: string;
  gradient: string;
  eventTitle?: string;
  videoId?: string;
  startTime?: string;
}

const sourceStyles: Record<string, { 
  gradient: string; 
  thumbnail: string;
}> = {
  'Yahoo Finance': { 
    gradient: 'from-purple-600 to-purple-800',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop&auto=format'
  },
  'FOX23': { 
    gradient: 'from-blue-600 to-blue-800',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&auto=format'
  },
  'Tulsa World': { 
    gradient: 'from-red-600 to-red-800',
    thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=200&fit=crop&auto=format'
  },
  'LinkedIn': { 
    gradient: 'from-[#0A66C2] to-[#004182]',
    thumbnail: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=400&h=200&fit=crop&auto=format'
  },
  'YouTube': {
    gradient: 'from-red-600 to-red-700',
    thumbnail: ''
  },
};

// Extract all news items from timeline
function getAllNewsItems(): NewsItem[] {
  const newsItems: NewsItem[] = [];
  
  timelineItems.forEach((item) => {
    // Add YouTube videos
    if (item.youtubeUrl) {
      const videoMatch = item.youtubeUrl.match(/(?:v=|\/)([\w-]{11})/);
      const startMatch = item.youtubeUrl.match(/t=(\d+)/);
      
      if (videoMatch) {
        newsItems.push({
          type: 'video',
          title: item.title,
          source: 'YouTube',
          url: item.youtubeUrl,
          thumbnail: `https://img.youtube.com/vi/${videoMatch[1]}/maxresdefault.jpg`,
          gradient: sourceStyles['YouTube'].gradient,
          eventTitle: item.title,
          videoId: videoMatch[1],
          startTime: startMatch?.[1],
        });
      }
    }
    
    // Add media links
    if (item.mediaLinks) {
      item.mediaLinks.forEach((link) => {
        const style = sourceStyles[link.source] || {
          gradient: 'from-primary to-primary/80',
          thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&auto=format'
        };
        
        newsItems.push({
          type: 'article',
          title: link.title,
          source: link.source,
          url: link.url,
          thumbnail: style.thumbnail,
          gradient: style.gradient,
          eventTitle: item.title,
        });
      });
    }
  });
  
  return newsItems;
}

export function InTheNewsSection() {
  const newsItems = getAllNewsItems();
  
  if (newsItems.length === 0) return null;
  
  // Separate video and articles
  const videos = newsItems.filter(item => item.type === 'video');
  const articles = newsItems.filter(item => item.type === 'article');
  
  return (
    <section id="news-section" className="py-16 border-b border-border/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Media
        </h2>
      </motion.div>
      
      {/* Featured Videos */}
      {videos.length > 0 && (
        <div className="mb-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.url}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="mb-6"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary/50 border border-border/30 shadow-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${video.videoId}${video.startTime ? `?start=${video.startTime}` : ''}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                {video.eventTitle}
              </p>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Articles Grid */}
      {articles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {articles.map((article, index) => (
            <motion.a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
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
                    src={article.thumbnail} 
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Gradient overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-t opacity-80',
                    article.gradient
                  )} />
                  {/* Source badge overlay */}
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md',
                      'bg-black/40 backdrop-blur-sm text-white border border-white/20'
                    )}>
                      {article.source}
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
                    {article.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground/60 mt-2 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {new URL(article.url).hostname.replace('www.', '')}
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  );
}
