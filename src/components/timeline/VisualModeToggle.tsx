import { motion } from 'framer-motion';
import { Sparkles, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualModeToggleProps {
  isCleanMode: boolean;
  onToggle: () => void;
}

export function VisualModeToggle({ isCleanMode, onToggle }: VisualModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        'border border-border/50 bg-card/80 backdrop-blur-sm',
        isCleanMode
          ? 'text-muted-foreground hover:text-foreground'
          : 'text-primary border-primary/30 shadow-sm shadow-primary/20'
      )}
    >
      <motion.div
        animate={{ rotate: isCleanMode ? 0 : 360 }}
        transition={{ duration: 0.5 }}
      >
        {isCleanMode ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
      </motion.div>
      {isCleanMode ? 'Clean' : 'Tech'}
    </button>
  );
}
