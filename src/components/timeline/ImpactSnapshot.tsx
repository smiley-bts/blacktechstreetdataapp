import { motion } from 'framer-motion';
import { Users, ThumbsUp, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  delay: number;
}

function StatCard({ icon, value, label, sublabel, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
      
      {/* Card */}
      <div className="relative bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-full hover:border-primary/40 transition-all duration-300">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/20">
          {icon}
        </div>
        
        {/* Value */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring', stiffness: 200 }}
          className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2"
        >
          {value}
        </motion.div>
        
        {/* Label */}
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}

function NPSGauge({ score }: { score: number }) {
  // NPS ranges from -100 to 100, normalize to 0-100 for display
  const normalizedScore = (score + 100) / 2;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        {/* Progress ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(160, 84%, 45%)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-3xl md:text-4xl font-display font-bold text-primary"
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-1">NPS Score</span>
      </div>
    </div>
  );
}

export function ImpactSnapshot() {
  // NPS score from ASPIRE feedback
  const npsScore = 91;
  
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
          Impact Snapshot
        </h2>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="h-6 w-6 text-primary" />}
          value="3"
          label="Cohorts"
          sublabel="Training program cohorts"
          delay={0}
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-primary" />}
          value="300+"
          label="Unique Participants"
          sublabel="Community members engaged"
          delay={0.1}
        />
        <StatCard
          icon={<ThumbsUp className="h-6 w-6 text-primary" />}
          value="91"
          label="Net Promoter Score"
          sublabel="Would recommend to others"
          delay={0.2}
        />
      </div>
    </section>
  );
}