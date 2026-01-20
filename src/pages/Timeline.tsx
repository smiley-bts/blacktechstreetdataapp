import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { timelineItems, TimelineCategory } from '@/data/timeline';
import { TimelineCard } from '@/components/timeline/TimelineCard';
import { TimelineScrubber } from '@/components/timeline/TimelineScrubber';
import { TimelineProgress } from '@/components/timeline/TimelineProgress';
import { FilterSheet } from '@/components/timeline/FilterSheet';
import { VisualModeToggle } from '@/components/timeline/VisualModeToggle';
import { TechBackground } from '@/components/timeline/TechBackground';
import { MicrosoftLabSection } from '@/components/timeline/MicrosoftLabSection';
import { TimelineHero } from '@/components/timeline/TimelineHero';
import { TimelineAboutSection } from '@/components/timeline/TimelineAboutSection';
import { TimelineGallery } from '@/components/timeline/TimelineGallery';
import { TimelineVerticalLine } from '@/components/timeline/TimelineVerticalLine';
import { ImpactSnapshot } from '@/components/timeline/ImpactSnapshot';
import { TeamSection } from '@/components/timeline/TeamSection';
import { TestimonialsSection } from '@/components/timeline/TestimonialsSection';
import { Button } from '@/components/ui/button';

export default function Timeline() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { setTheme, theme } = useTheme();
  
  const [isCleanMode, setIsCleanMode] = useState(prefersReducedMotion || false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<TimelineCategory[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [previousTheme, setPreviousTheme] = useState<string | undefined>(undefined);
  const timelineStartRef = useRef<HTMLDivElement>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);

  // Force dark theme on this page
  useEffect(() => {
    setPreviousTheme(theme);
    setTheme('dark');
    
    return () => {
      // Restore previous theme when leaving the page
      if (previousTheme && previousTheme !== 'dark') {
        setTheme(previousTheme);
      }
    };
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

  // Track active item on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveItemId(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );

    timelineItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return timelineItems.filter((item) => {
      const yearMatch = selectedYears.length === 0 || selectedYears.includes(item.year);
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(item.category);
      return yearMatch && categoryMatch;
    });
  }, [selectedYears, selectedCategories]);

  // Group items by year with Microsoft Lab section insertion
  const groupedItems = useMemo(() => {
    const groups: { year: number; items: typeof filteredItems; showMicrosoftLab?: boolean }[] = [];
    let currentYear: number | null = null;
    
    filteredItems
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((item) => {
        if (item.year !== currentYear) {
          // Insert Microsoft Lab section between 2023 and 2024
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
  }, [filteredItems]);

  const handleNavigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleYearToggle = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleCategoryToggle = (category: TimelineCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const hasFilters = selectedYears.length > 0 || selectedCategories.length > 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground dark overflow-x-hidden">
      {/* Tech background effects - positioned absolute to cover full page */}
      <TechBackground isVisible={!isCleanMode} />

      {/* Progress bar */}
      <TimelineProgress />

      {/* Fixed header */}
      <header className="fixed top-2 left-0 right-0 z-40 px-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto bg-card/90 backdrop-blur-xl border border-border/40 rounded-2xl px-5 py-2.5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-display font-bold text-foreground tracking-wide">BTS</span>
          </div>
          
          <VisualModeToggle isCleanMode={isCleanMode} onToggle={() => setIsCleanMode(!isCleanMode)} />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 hover:bg-primary/10"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Explore</span>
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {selectedYears.length + selectedCategories.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <TimelineHero />

      {/* Main content */}
      <main className="relative z-10 px-5 pb-20 max-w-2xl mx-auto">
        {/* Team Section */}
        <TeamSection />

        {/* About Section */}
        <TimelineAboutSection />

        {/* Timeline heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Timeline</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Our Journey
          </h2>
        </motion.div>

        {/* Timeline section with vertical line */}
        <div className="relative" ref={timelineStartRef}>
          {/* Vertical progress line with dots */}
          <TimelineVerticalLine 
            items={filteredItems} 
            timelineStartRef={timelineStartRef}
            timelineEndRef={timelineEndRef}
          />

          {/* Year groups - offset for line */}
          <div className="md:pl-12">
            {groupedItems.map((group) => (
              <div key={group.year} className="mb-12">
                {/* Year header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="sticky top-20 z-20 mb-6"
                >
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl shadow-black/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-primary/60 animate-pulse shadow-lg shadow-primary/30" />
                    <span className="text-xl font-display font-bold text-foreground tracking-wide">{group.year}</span>
                  </div>
                </motion.div>

                {/* Timeline items */}
                <div className="space-y-6">
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
              </div>
            ))}
          </div>
          
          <div ref={timelineEndRef} />
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No milestones match your filters.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedYears([]);
                setSelectedCategories([]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Impact Snapshot */}
        <ImpactSnapshot />

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

      {/* Scrubber */}
      <TimelineScrubber
        items={filteredItems}
        activeId={activeItemId}
        onNavigate={handleNavigate}
        isVisible={!isCleanMode}
      />

      {/* Filter sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedYears={selectedYears}
        selectedCategories={selectedCategories}
        onYearToggle={handleYearToggle}
        onCategoryToggle={handleCategoryToggle}
        onClearAll={() => {
          setSelectedYears([]);
          setSelectedCategories([]);
        }}
      />
    </div>
  );
}
