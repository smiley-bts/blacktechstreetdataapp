import { motion } from 'framer-motion';
import { Users, Brain, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  colorClass: string;
  delay: number;
}

function StatCard({ icon, value, label, sublabel, colorClass, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500",
        colorClass
      )} />
      
      {/* Card */}
      <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-full hover:border-primary/30 transition-colors">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
          "bg-gradient-to-br",
          colorClass.replace('bg-', 'from-').replace('/30', '/20'),
          "to-transparent"
        )}>
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
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground/60 mt-1">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}

function ProgressRing({ percentage, color }: { percentage: number; color: string }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
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
          className="text-border/30"
        />
        {/* Progress ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
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
          className="text-2xl md:text-3xl font-display font-bold text-foreground"
        >
          {percentage}%
        </motion.span>
        <span className="text-xs text-muted-foreground">Fluency Rate</span>
      </div>
    </div>
  );
}

export function ImpactSnapshot() {
  // Calculate fluency rate: 159/241 = ~66%
  const fluencyRate = Math.round((159 / 241) * 100);
  
  return (
    <section className="py-16 border-b border-border/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-chart-amber/10 border border-chart-amber/20 mb-4">
          <TrendingUp className="h-4 w-4 text-chart-amber" />
          <span className="text-xs font-medium text-chart-amber uppercase tracking-wider">June–Sep 2025</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          Impact Snapshot
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Measurable outcomes from ASPIRE programming
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Users className="h-6 w-6 text-primary" />}
          value="241"
          label="Unique Participants"
          sublabel="Community members engaged"
          colorClass="bg-primary/30"
          delay={0}
        />
        <StatCard
          icon={<Brain className="h-6 w-6 text-chart-purple" />}
          value="159"
          label="Achieved AI Fluency"
          sublabel="Certified in GenAI skills"
          colorClass="bg-chart-purple/30"
          delay={0.1}
        />
        <StatCard
          icon={<Calendar className="h-6 w-6 text-chart-cyan" />}
          value="3"
          label="Cohorts"
          sublabel="Training program cohorts"
          colorClass="bg-chart-cyan/30"
          delay={0.2}
        />
      </div>

      {/* Fluency Rate Ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ProgressRing percentage={fluencyRate} color="hsl(160, 84%, 45%)" />
          <div className="text-center md:text-left max-w-sm">
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              AI Fluency Achievement
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">{fluencyRate}%</span> of participants who engaged with our programs achieved certified AI fluency, demonstrating practical skills in generative AI tools.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}