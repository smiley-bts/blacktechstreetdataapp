# Black Tech Street Timeline - Export Package (Part 2)

---

## 11. src/components/timeline/TimelineAboutSection.tsx

```tsx
import { motion } from 'framer-motion';
import { Target, Eye, Wrench, Lightbulb, Users } from 'lucide-react';
import { aboutContent } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface IconBoxProps {
  icon: React.ReactNode;
}

function IconBox({ icon }: IconBoxProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      <div className={cn(
        "relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        "bg-secondary border border-primary/30",
        "shadow-lg shadow-black/20"
      )}>
        {icon}
      </div>
    </div>
  );
}

export function TimelineAboutSection() {
  return (
    <section className="py-16 border-b border-border/30">
      <div className="grid gap-8 md:gap-10">
        {/* Origin */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Lightbulb className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Origin
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Black Tech Street was founded on one question:{' '}
              <motion.strong
                initial={{ opacity: 0.6, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="inline text-primary font-bold"
              >
                "What could Black Wall Street have been, had it been supported and not destroyed?"
              </motion.strong>{' '}
              BTS was built on three core realities:{' '}
              <strong className="text-primary">tech can create intergenerational wealth in 7–10 years</strong>, it is the{' '}
              <strong className="text-primary">engine behind global innovation</strong>, and by{' '}
              <strong className="text-primary">2030</strong> the U.S. is projected to face a shortage of up to{' '}
              <strong className="text-primary">4.3 million high-paying tech jobs</strong>.
            </p>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Target className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              {aboutContent.mission}
            </p>
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Eye className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Vision
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              {aboutContent.vision}
            </p>
          </div>
        </motion.div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Wrench className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              What We Do
            </h3>
            <div className="text-muted-foreground leading-relaxed text-base md:text-lg space-y-4">
              {aboutContent.whatWeDo.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Who We Serve */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Users className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Who We Serve
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Black Tech Street serves local government, educational institutions, employers and business networks, entrepreneurs and startups, and community learners, including residents and future-ready professionals.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 12. src/components/timeline/TimelineCard.tsx

```tsx
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
        {/* BTS brand dot */}
        <div className="relative mt-1.5 shrink-0">
          <motion.div 
            className={cn(
              "w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background",
              isExpanded && "ring-primary/30"
            )}
            animate={{ scale: isExpanded ? 1.3 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
          <motion.div 
            className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary/40 blur-md"
            animate={{ scale: isExpanded ? 2 : 1, opacity: isExpanded ? 0.8 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <div className={cn(
            "absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary/30",
            "opacity-0 group-hover:opacity-100 group-hover:animate-ping",
            isExpanded && "opacity-0 group-hover:opacity-0"
          )} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
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
        
        {/* Expand indicator */}
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
```

---

## 13. src/components/timeline/ImpactSnapshot.tsx

```tsx
import { motion } from 'framer-motion';
import { Users, ThumbsUp, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountUp } from '@/components/ui/count-up';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  sublabel?: string;
  delay: number;
}

function StatCard({ icon, value, suffix = '', label, sublabel, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
      
      <div className="relative bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-full hover:border-primary/40 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/20">
          {icon}
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring', stiffness: 200 }}
          className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2"
        >
          <CountUp end={value} duration={800} suffix={suffix} />
        </motion.div>
        
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}

export function ImpactSnapshot() {
  return (
    <section className="py-16 border-b border-border/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">June–December 2025</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          <span className="text-primary">Impact</span> Snapshot
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="h-6 w-6 text-primary" />}
          value={3}
          label="Cohorts"
          sublabel="Training program cohorts"
          delay={0}
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-primary" />}
          value={300}
          suffix="+"
          label="Unique Participants"
          sublabel="Community members engaged"
          delay={0.1}
        />
        <StatCard
          icon={<ThumbsUp className="h-6 w-6 text-primary" />}
          value={91}
          label="Net Promoter Score"
          sublabel="Would recommend to others"
          delay={0.2}
        />
      </div>
    </section>
  );
}
```

---

## 14. src/components/timeline/TestimonialsSection.tsx

```tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: "I get excited when I'm learning new and interesting things—especially when the experience stretches both my imagination and my intellect. Black Tech Street delivered just that: a challenging, fun, and thought-provoking event that deepened my understanding of AI and expanded my creative toolkit.",
    author: "Angela A."
  },
  {
    quote: "Discovering what AI can do with the simplest of instructions given to it was mind-blowing for me. One little sentence could create a beautiful presentation, an app, give answers to the most random questions. It's insane!",
    author: "India M."
  },
  {
    quote: "Confidence, inspiration, and relief. That's how I feel as I'm now able to scale myself and create better outcomes.",
    author: "Michelle S."
  },
  {
    quote: "I learned not only about AI, but also about how I relate to it—and how I can integrate it into my life and work in a thoughtful, ethical way.",
    author: "Judie W."
  },
  {
    quote: "It was so inspiring and enlightening to be able to explore and learn about so many great tools!",
    author: "Michelle B."
  },
  {
    quote: "I feel that blinders have been removed.",
    author: "Nadette C."
  },
  {
    quote: "This experience taught me that there is community and help for people wanting to learn and grow businesses in the ai/tech world.",
    author: "Solei W."
  }
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold">
          <span className="text-primary">Community</span>{' '}
          <span className="text-foreground">Voices</span>
        </h2>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-2xl" />
        
        <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <Quote className="h-12 w-12 md:h-16 md:w-16 text-primary/20" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
            </div>
          </motion.div>

          <div className="relative min-h-[200px] md:min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <p className="text-base md:text-lg lg:text-xl text-foreground/90 leading-relaxed mb-6 italic max-w-2xl mx-auto">
                  "{testimonials[activeIndex].quote}"
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-3"
                >
                  <div className="w-10 h-0.5 bg-gradient-to-r from-transparent to-primary/60" />
                  <span className="text-lg font-display font-semibold text-primary">
                    {testimonials[activeIndex].author}
                  </span>
                  <div className="w-10 h-0.5 bg-gradient-to-l from-transparent to-primary/60" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveIndex(index);
                  }}
                  className={cn(
                    "transition-all duration-300",
                    activeIndex === index
                      ? "w-8 h-2 bg-primary rounded-full"
                      : "w-2 h-2 bg-primary/30 rounded-full hover:bg-primary/50"
                  )}
                />
              ))}
            </div>
            
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8"
      >
        {testimonials.slice(0, 6).map((testimonial, index) => (
          <motion.button
            key={testimonial.author}
            onClick={() => {
              setIsAutoPlaying(false);
              setActiveIndex(index);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "p-4 rounded-xl border text-left transition-all duration-300",
              activeIndex === index
                ? "bg-primary/10 border-primary/40"
                : "bg-card/40 border-border/30 hover:border-primary/20"
            )}
          >
            <Quote className="h-4 w-4 text-primary/40 mb-2" />
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {testimonial.quote.slice(0, 60)}...
            </p>
            <span className="text-xs font-medium text-primary">{testimonial.author}</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
```

---

## 15. src/components/timeline/InTheNewsSection.tsx

```tsx
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
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

const sourceStyles: Record<string, { gradient: string; thumbnail: string }> = {
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

function getAllNewsItems(): NewsItem[] {
  const newsItems: NewsItem[] = [];
  
  timelineItems.forEach((item) => {
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
                <div className="relative h-28 overflow-hidden">
                  <img 
                    src={article.thumbnail} 
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-t opacity-80',
                    article.gradient
                  )} />
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md',
                      'bg-black/40 backdrop-blur-sm text-white border border-white/20'
                    )}>
                      {article.source}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ExternalLink className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </div>
                
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
```

---

## Continue to Part 3 for:
- TimelineGallery.tsx
- Timeline.tsx (main page)  
- tailwind.config.ts
- index.css
