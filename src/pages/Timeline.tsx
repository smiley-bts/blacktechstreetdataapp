import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { timelineItems, TimelineCategory } from '@/data/timeline';
import { TimelineCard } from '@/components/timeline/TimelineCard';
import { TimelineProgress } from '@/components/timeline/TimelineProgress';
import { TechBackground } from '@/components/timeline/TechBackground';
import { MicrosoftLabSection } from '@/components/timeline/MicrosoftLabSection';
import { TimelineHero } from '@/components/timeline/TimelineHero';
import { TimelineAboutSection } from '@/components/timeline/TimelineAboutSection';
import { TimelineGallery } from '@/components/timeline/TimelineGallery';
import { ImpactSnapshot } from '@/components/timeline/ImpactSnapshot';
import { TeamSection } from '@/components/timeline/TeamSection';
import { TestimonialsSection } from '@/components/timeline/TestimonialsSection';
import { TableOfContents } from '@/components/timeline/TableOfContents';
import { InTheNewsSection } from '@/components/timeline/InTheNewsSection';
import { Button } from '@/components/ui/button';

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
    updateOrCreateMeta('og:url', 'https://blacktechstreetdataapp.lovable.app/timeline');
    updateOrCreateMeta('og:image', 'https://blacktechstreetdataapp.lovable.app/images/bts-logo-white.png');
    updateOrCreateMeta('og:type', 'website');
    
    updateOrCreateMeta('twitter:card', 'summary_large_image', true);
    updateOrCreateMeta('twitter:title', 'Black Tech Street | Timeline', true);
    updateOrCreateMeta('twitter:description', 'Explore Black Tech Street\'s journey rebirthing Historic Black Wall Street as a world-class innovation economy.', true);
    updateOrCreateMeta('twitter:image', 'https://blacktechstreetdataapp.lovable.app/images/bts-logo-white.png', true);
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

  // Group items by year with Microsoft Lab section insertion
  const groupedItems = useMemo(() => {
    const groups: { year: number; items: typeof timelineItems; showMicrosoftLab?: boolean }[] = [];
    let currentYear: number | null = null;
    
    [...timelineItems]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((item) => {
        if (item.year !== currentYear) {
          if (currentYear === 2023 && item.year >= 2024) {
            groups[groups.length - 1].showMicrosoftLab = true;
          }
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
      {/* Tech background effects - positioned absolute to cover full page */}
      <TechBackground isVisible={!isCleanMode} />

      {/* Progress bar */}
      <TimelineProgress />


      {/* Hero */}
      <TimelineHero />

      {/* Table of Contents */}
      <div className="relative z-10 px-5 max-w-2xl mx-auto">
        <TableOfContents />
      </div>

      {/* Main content */}
      <main className="relative z-10 px-5 pb-20 max-w-2xl mx-auto">
        {/* Team Section */}
        <div id="team-section">
          <TeamSection />
        </div>

        {/* About Section */}
        <div id="about-section">
          <TimelineAboutSection />
        </div>

        {/* Timeline section marker */}
        <div id="timeline-section" className="pt-8" />

        {/* Simplified Timeline - compact visual flow */}
        <div className="relative" ref={timelineStartRef}>
          {/* Year groups */}
          <div className="space-y-8">
            {groupedItems.map((group) => (
              <motion.div 
                key={group.year}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Year marker */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span className="text-lg font-display font-bold text-primary">
                    {group.year}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                </div>

                {/* Timeline items - compact list */}
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

                {/* Microsoft Lab section */}
                {group.showMicrosoftLab && (
                  <MicrosoftLabSection isCleanMode={isCleanMode} />
                )}
              </motion.div>
            ))}
          </div>
          
          <div ref={timelineEndRef} />
        </div>

        {/* Impact Snapshot */}
        <div id="impact-section">
          <ImpactSnapshot />
        </div>

        {/* Media */}
        <InTheNewsSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Gallery */}
        <TimelineGallery />

        {/* Footer */}
        <footer className="text-center pt-12 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
