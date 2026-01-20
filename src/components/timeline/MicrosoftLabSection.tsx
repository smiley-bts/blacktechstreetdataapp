import { motion } from 'framer-motion';
import { Building2, MapPin } from 'lucide-react';
import { microsoftLabSection } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface MicrosoftLabSectionProps {
  isCleanMode: boolean;
}

export function MicrosoftLabSection({ isCleanMode }: MicrosoftLabSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="my-8"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-5',
          !isCleanMode && 'hover:border-primary/50 transition-colors'
        )}
      >
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mb-1 block">
              Featured Initiative
            </span>
            <h3 className="text-base font-semibold text-foreground leading-snug">
              {microsoftLabSection.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {microsoftLabSection.description}
            </p>
            
            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-3">
              <MapPin className="h-3 w-3" />
              <span>{microsoftLabSection.location}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
