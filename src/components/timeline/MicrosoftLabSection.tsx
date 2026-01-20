import { motion } from 'framer-motion';
import { Building2, Shield, Lightbulb, Users, MapPin } from 'lucide-react';
import { microsoftLabSection } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface MicrosoftLabSectionProps {
  isCleanMode: boolean;
}

const icons = [Shield, Lightbulb, Users, Building2];

export function MicrosoftLabSection({ isCleanMode }: MicrosoftLabSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="relative my-12"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8',
          !isCleanMode && 'shadow-xl shadow-primary/10'
        )}
      >
        {/* Background pattern */}
        {!isCleanMode && (
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
          </div>
        )}

        {/* Featured badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
            Featured Initiative
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3">
          {microsoftLabSection.title}
        </h3>
        
        <p className="text-muted-foreground mb-6">
          {microsoftLabSection.description}
        </p>

        {/* Features */}
        <div className="grid gap-3 mb-6">
          {microsoftLabSection.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* Capabilities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {microsoftLabSection.capabilities.map((capability, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
              >
                <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">{capability}</span>
              </div>
            );
          })}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border/30">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{microsoftLabSection.location}</span>
        </div>

        {/* Decorative corner */}
        {!isCleanMode && (
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/20 to-transparent" />
            <svg
              className="absolute top-2 right-2 w-16 h-16 text-primary/20"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}
