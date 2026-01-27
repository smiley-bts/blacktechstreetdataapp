# Black Tech Street Timeline - Export Package (Part 3)

---

## 16. src/components/timeline/TimelineGallery.tsx

```tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export const galleryEvents = [
  { id: 'all', label: 'All Photos', date: null },
  { id: 'aspire-lead-dec-2025', label: 'ASPIRE: Lead (Dec 2025)', date: '2025-12-20' },
  { id: 'aspire-dec-2025', label: 'ASPIRE Dec 2025', date: '2025-12-06' },
  { id: 'nvidia-sep-2025', label: 'NVIDIA Sep 2025', date: '2025-09-03' },
  { id: 'aspire-sep-2025', label: 'ASPIRE Sep 2025', date: '2025-09-27' },
  { id: 'aspire-june-2025', label: 'ASPIRE June 2025', date: '2025-06-01' },
  { id: 'microsoft-visit', label: 'Microsoft Visit', date: '2025-01-15' },
  { id: 'white-house-cyber', label: 'White House Cyber (June 2024)', date: '2024-06-19' },
  { id: 'hack-the-future', label: 'Hack The Future (Feb 2024)', date: '2024-02-15' },
  { id: 'senate-testimony', label: 'Senate HELP Committee', date: '2024-02-01' },
  { id: 'ai-executive-order', label: 'AI Executive Order (Oct 2023)', date: '2023-10-30' },
  { id: 'defcon-seed-ai', label: 'DEF-CON 31 & SEED AI (Aug 2023)', date: '2023-08-01' },
  { id: 'microsoft-announce', label: 'Microsoft Partnership (July 2023)', date: '2023-07-01' },
] as const;

export type GalleryEventId = typeof galleryEvents[number]['id'];

const eventDateMap: Record<string, string> = {};
galleryEvents.forEach(event => {
  if (event.date) {
    eventDateMap[event.id] = event.date;
  }
});

const featuredImages = [
  {
    id: 0,
    src: '/images/gallery/microsoft-bts-retreat-mockup.png',
    alt: 'Microsoft & Black Tech Street Retreat Center Mockup',
    eventId: 'microsoft-visit' as const,
  },
  {
    id: 8,
    src: '/images/gallery/08-moton-building.png',
    alt: 'Moton Building',
    eventId: 'microsoft-visit' as const,
  },
];

// Add your gallery images here - this is a simplified version
const galleryImagesUnsorted = [
  { id: 901, src: '/images/gallery/aspire-lead-01.jpg', alt: 'ASPIRE: Lead Certificate Recipients', eventId: 'aspire-lead-dec-2025' },
  { id: 902, src: '/images/gallery/aspire-lead-02.jpg', alt: 'ASPIRE: Lead Students Working', eventId: 'aspire-lead-dec-2025' },
  // Add more images as needed
];

const galleryImages = [...galleryImagesUnsorted].sort((a, b) => {
  const dateA = eventDateMap[a.eventId] || '1900-01-01';
  const dateB = eventDateMap[b.eventId] || '1900-01-01';
  return dateB.localeCompare(dateA);
});

interface TimelineGalleryProps {
  initialEventFilter?: GalleryEventId;
}

export function TimelineGallery({ initialEventFilter }: TimelineGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [activeEvent, setActiveEvent] = useState<GalleryEventId>(initialEventFilter || 'all');

  useEffect(() => {
    const handleSetFilter = (e: CustomEvent<GalleryEventId>) => {
      setActiveEvent(e.detail);
    };
    
    window.addEventListener('setGalleryFilter', handleSetFilter as EventListener);
    return () => window.removeEventListener('setGalleryFilter', handleSetFilter as EventListener);
  }, []);

  const filteredImages = activeEvent === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.eventId === activeEvent);

  const handleDownload = async (src: string, alt: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${alt.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <section id="photo-gallery" className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          <span className="text-primary">Photo</span> Gallery
        </h2>

        <div className="flex flex-wrap justify-center gap-2">
          {galleryEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => setActiveEvent(event.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeEvent === event.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {event.label}
            </button>
          ))}
        </div>
      </motion.div>

      {(activeEvent === 'all' || activeEvent === 'microsoft-visit') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {featuredImages.map((image, idx) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="cursor-pointer group"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative overflow-hidden rounded-xl border border-border/30 bg-muted/20">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-white/90 font-medium truncate mr-2">
                    {image.alt}
                  </span>
                  <ZoomIn className="h-4 w-4 text-white/80 shrink-0" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeEvent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
        >
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="break-inside-avoid group relative cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative overflow-hidden rounded-xl border border-border/30 bg-muted/20">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  style={{ minHeight: '150px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-white/90 font-medium truncate mr-2">
                    {image.alt}
                  </span>
                  <ZoomIn className="h-4 w-4 text-white/80 shrink-0" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl h-[100dvh] md:h-auto md:max-h-[90vh] p-0 bg-black/95 border-border/30">
          <AnimatePresence mode="wait">
            {selectedImage && (
              <motion.div
                key={selectedImage.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative flex flex-col h-full"
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    decoding="async"
                  />
                </div>

                <div className="flex items-center justify-between px-4 md:px-8 pb-4 md:pb-6">
                  <span className="text-sm text-white/70">{selectedImage.alt}</span>
                  <button
                    onClick={() => handleDownload(selectedImage.src, selectedImage.alt)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
}
```

---

## 17. src/pages/Timeline.tsx (Main Page)

```tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { timelineItems, TimelineCategory } from '@/data/timeline';
import { TimelineCard } from '@/components/timeline/TimelineCard';
import { TimelineProgress } from '@/components/timeline/TimelineProgress';
import { TechBackground } from '@/components/timeline/TechBackground';
import { TimelineHero } from '@/components/timeline/TimelineHero';
import { TimelineAboutSection } from '@/components/timeline/TimelineAboutSection';
import { TimelineGallery } from '@/components/timeline/TimelineGallery';
import { ImpactSnapshot } from '@/components/timeline/ImpactSnapshot';
import { TeamSection } from '@/components/timeline/TeamSection';
import { TestimonialsSection } from '@/components/timeline/TestimonialsSection';
import { TableOfContents } from '@/components/timeline/TableOfContents';
import { InTheNewsSection } from '@/components/timeline/InTheNewsSection';
import { BackToTopButton } from '@/components/timeline/BackToTopButton';

export default function Timeline() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { setTheme, theme } = useTheme();
  
  const isCleanMode = prefersReducedMotion || false;
  const [previousTheme, setPreviousTheme] = useState<string | undefined>(undefined);
  const timelineStartRef = useRef<HTMLDivElement>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);

  // Force dark theme on this page
  useEffect(() => {
    setPreviousTheme(theme);
    setTheme('dark');
    
    return () => {
      if (previousTheme && previousTheme !== 'dark') {
        setTheme(previousTheme);
      }
    };
  }, []);

  // Set SEO meta tags
  useEffect(() => {
    document.title = 'Black Tech Street | Timeline';
    
    const updateOrCreateMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateMeta('description', 'Explore Black Tech Street\'s journey rebirthing Historic Black Wall Street as a world-class AI innovation economy in Greenwood, Tulsa.', true);
    updateOrCreateMeta('og:title', 'Black Tech Street | Timeline');
    updateOrCreateMeta('og:description', 'Explore Black Tech Street\'s journey rebirthing Historic Black Wall Street as a world-class AI innovation economy.');
    updateOrCreateMeta('og:url', 'https://yourdomain.com/timeline');
    updateOrCreateMeta('og:image', 'https://yourdomain.com/images/bts-logo-white.png');
    updateOrCreateMeta('og:type', 'website');
    
    updateOrCreateMeta('twitter:card', 'summary_large_image', true);
    updateOrCreateMeta('twitter:title', 'Black Tech Street | Timeline', true);
    updateOrCreateMeta('twitter:description', 'Explore Black Tech Street\'s journey rebirthing Historic Black Wall Street as a world-class innovation economy.', true);
    updateOrCreateMeta('twitter:image', 'https://yourdomain.com/images/bts-logo-white.png', true);
  }, []);

  // Handle hash navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [location.hash]);

  // Group items by year
  const groupedItems = useMemo(() => {
    const groups: { year: number; items: typeof timelineItems }[] = [];
    let currentYear: number | null = null;
    
    [...timelineItems]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((item) => {
        if (item.year !== currentYear) {
          currentYear = item.year;
          groups.push({ year: item.year, items: [item] });
        } else {
          groups[groups.length - 1].items.push(item);
        }
      });
    
    return groups;
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground dark overflow-x-hidden">
      <TechBackground isVisible={!isCleanMode} />
      <TimelineProgress />

      <TimelineHero />

      <div className="relative z-10 px-5 max-w-2xl mx-auto">
        <TableOfContents />
      </div>

      <main className="relative z-10 px-5 pb-20 max-w-2xl mx-auto">
        <div id="team-section">
          <TeamSection />
        </div>

        <div id="about-section">
          <TimelineAboutSection />
        </div>

        <div id="timeline-section" className="pt-12 pb-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-bold text-foreground"
          >
            Timeline
          </motion.h2>
        </div>

        <div className="relative" ref={timelineStartRef}>
          <div className="space-y-8">
            {groupedItems.map((group) => (
              <motion.div 
                key={group.year}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span className="text-lg font-display font-bold text-primary">
                    {group.year}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                </div>

                <div className="space-y-1">
                  {group.items.map((item, index) => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      index={index}
                      isCleanMode={isCleanMode}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div ref={timelineEndRef} />
        </div>

        <div id="impact-section">
          <ImpactSnapshot />
        </div>

        <TestimonialsSection />
        <InTheNewsSection />
        <TimelineGallery />

        <footer className="text-center pt-12 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </main>

      <BackToTopButton />
    </div>
  );
}
```

---

## 18. tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        chart: {
          blue: "hsl(var(--chart-blue))",
          purple: "hsl(var(--chart-purple))",
          amber: "hsl(var(--chart-amber))",
          pink: "hsl(var(--chart-pink))",
          emerald: "hsl(var(--chart-emerald))",
          cyan: "hsl(var(--chart-cyan))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 19. src/index.css (Critical Sections)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

@layer base {
  :root {
    /* Dark mode as default - Premium dark theme */
    --background: 220 25% 6%;
    --foreground: 210 40% 98%;

    --card: 220 20% 10%;
    --card-foreground: 210 40% 98%;

    --popover: 220 20% 10%;
    --popover-foreground: 210 40% 98%;

    --primary: 160 84% 45%;
    --primary-foreground: 0 0% 5%;
    --primary-glow: 160 90% 60%;

    --secondary: 220 15% 16%;
    --secondary-foreground: 210 40% 98%;

    --muted: 220 15% 20%;
    --muted-foreground: 215 20% 55%;

    --accent: 280 80% 60%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 63% 45%;
    --destructive-foreground: 0 0% 95%;

    --border: 220 15% 18%;
    --input: 220 15% 16%;
    --ring: 160 84% 45%;

    --radius: 0.75rem;

    --chart-blue: 217 91% 65%;
    --chart-purple: 280 80% 60%;
    --chart-amber: 38 92% 55%;
    --chart-pink: 330 81% 65%;
    --chart-emerald: 160 84% 45%;
    --chart-cyan: 187 92% 60%;

    --gold: 45 93% 55%;
    --gold-foreground: 0 0% 5%;
  }

  /* Light mode override */
  .light {
    --background: 220 20% 97%;
    --foreground: 220 20% 12%;

    --card: 0 0% 100%;
    --card-foreground: 220 20% 12%;

    --primary: 160 84% 32%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 160 70% 40%;

    --secondary: 220 14% 96%;
    --secondary-foreground: 220 20% 20%;

    --muted: 220 14% 92%;
    --muted-foreground: 220 10% 45%;

    --border: 220 13% 82%;
    --input: 220 13% 88%;
    --ring: 160 84% 32%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-display;
  }

  button, a, input, select, textarea {
    @apply transition-all duration-200 ease-out;
  }
}

@layer utilities {
  .glass-card {
    @apply bg-card/70 backdrop-blur-xl border border-border/50 shadow-lg dark:shadow-2xl;
  }
  
  .glow-primary {
    box-shadow: 0 0 20px hsla(var(--primary) / 0.3),
                0 0 40px hsla(var(--primary) / 0.2),
                0 0 60px hsla(var(--primary) / 0.1);
  }

  .text-gradient-primary {
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

@keyframes matrix-fall {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  5% {
    opacity: 0.6;
  }
  95% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

.animate-matrix-fall {
  animation: matrix-fall linear infinite;
}

@keyframes shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px hsla(var(--primary) / 0.3);
  }
  50% {
    box-shadow: 0 0 40px hsla(var(--primary) / 0.5);
  }
}
```

---

## Image Assets to Copy

### Team Photos (public/images/team/)
- tyrance-billingsley.png
- josephine-nelms.png  
- allen-collins.png
- smiley-elmore.png

### Gallery Photos (public/images/gallery/)
Copy all ~54 photos from the original project's gallery folder.

### Logos
- public/images/bts-logo-white.png
- src/assets/logos/bts-b-logo.png

---

## Quick Start Steps

1. **Create new Lovable project**
2. **Install dependencies:**
   ```bash
   npm install framer-motion lucide-react @radix-ui/react-dialog next-themes react-router-dom clsx tailwind-merge tailwindcss-animate
   ```
3. **Copy all files from this export package**
4. **Copy all image assets**
5. **Update SEO meta tags** in Timeline.tsx with your domain
6. **Run the project!**

---

## Download Images

Access images from the live preview:
- https://blacktechstreetdataapp.lovable.app/images/team/
- https://blacktechstreetdataapp.lovable.app/images/gallery/
