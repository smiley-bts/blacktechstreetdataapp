import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categories, years, TimelineCategory } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYears: number[];
  selectedCategories: TimelineCategory[];
  onYearToggle: (year: number) => void;
  onCategoryToggle: (category: TimelineCategory) => void;
  onClearAll: () => void;
}

const categoryColors: Record<string, string> = {
  Policy: 'border-chart-blue/50 data-[selected=true]:bg-chart-blue/20 data-[selected=true]:border-chart-blue',
  Partnerships: 'border-primary/50 data-[selected=true]:bg-primary/20 data-[selected=true]:border-primary',
  Community: 'border-chart-pink/50 data-[selected=true]:bg-chart-pink/20 data-[selected=true]:border-chart-pink',
  Research: 'border-chart-purple/50 data-[selected=true]:bg-chart-purple/20 data-[selected=true]:border-chart-purple',
  Events: 'border-chart-amber/50 data-[selected=true]:bg-chart-amber/20 data-[selected=true]:border-chart-amber',
  Infrastructure: 'border-chart-cyan/50 data-[selected=true]:bg-chart-cyan/20 data-[selected=true]:border-chart-cyan',
};

export function FilterSheet({
  isOpen,
  onClose,
  selectedYears,
  selectedCategories,
  onYearToggle,
  onCategoryToggle,
  onClearAll,
}: FilterSheetProps) {
  const hasFilters = selectedYears.length > 0 || selectedCategories.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-display font-semibold">Explore Timeline</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Year filters */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Filter by Year</h4>
                <div className="flex flex-wrap gap-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => onYearToggle(year)}
                      data-selected={selectedYears.includes(year)}
                      className={cn(
                        'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                        'border-border/50 hover:border-primary/50',
                        'data-[selected=true]:bg-primary/20 data-[selected=true]:border-primary data-[selected=true]:text-primary'
                      )}
                    >
                      {selectedYears.includes(year) && (
                        <Check className="inline h-3.5 w-3.5 mr-1" />
                      )}
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filters */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Filter by Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => onCategoryToggle(category)}
                      data-selected={selectedCategories.includes(category)}
                      className={cn(
                        'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                        categoryColors[category]
                      )}
                    >
                      {selectedCategories.includes(category) && (
                        <Check className="inline h-3.5 w-3.5 mr-1" />
                      )}
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {hasFilters && (
                  <Button variant="outline" onClick={onClearAll} className="flex-1">
                    Clear All
                  </Button>
                )}
                <Button onClick={onClose} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
