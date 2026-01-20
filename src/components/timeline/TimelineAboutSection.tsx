import { motion } from 'framer-motion';
import { Cpu, Zap, Code2, Rocket } from 'lucide-react';
import { aboutContent } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface IconBoxProps {
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
}

function IconBox({ icon, colorClass, glowClass }: IconBoxProps) {
  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300",
        glowClass
      )} />
      {/* Icon container */}
      <div className={cn(
        "relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        "bg-gradient-to-br border border-white/10",
        "shadow-lg backdrop-blur-sm",
        colorClass
      )}>
        {icon}
      </div>
    </div>
  );
}

export function TimelineAboutSection() {
  return (
    <section className="py-16 border-b border-border/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          About Black Tech Street
        </h2>
        <p className="text-muted-foreground">Greenwood, Tulsa</p>
      </motion.div>

      <div className="grid gap-8 md:gap-10">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-5"
        >
          <IconBox 
            icon={<Cpu className="h-6 w-6 text-primary" strokeWidth={1.5} />}
            colorClass="from-primary/20 to-primary/10"
            glowClass="bg-primary/30"
          />
          <div>
            <h3 className="text-lg font-display font-semibold mb-2 text-foreground">Mission</h3>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {aboutContent.mission}
            </p>
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-5"
        >
          <IconBox 
            icon={<Zap className="h-6 w-6 text-chart-purple" strokeWidth={1.5} />}
            colorClass="from-chart-purple/20 to-chart-purple/10"
            glowClass="bg-chart-purple/30"
          />
          <div>
            <h3 className="text-lg font-display font-semibold mb-2 text-foreground">Vision</h3>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {aboutContent.vision}
            </p>
          </div>
        </motion.div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-5"
        >
          <IconBox 
            icon={<Code2 className="h-6 w-6 text-chart-cyan" strokeWidth={1.5} />}
            colorClass="from-chart-cyan/20 to-chart-cyan/10"
            glowClass="bg-chart-cyan/30"
          />
          <div>
            <h3 className="text-lg font-display font-semibold mb-2 text-foreground">What We Do</h3>
            <div className="text-muted-foreground leading-relaxed text-sm md:text-base space-y-3">
              {aboutContent.whatWeDo.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Origin */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-5"
        >
          <IconBox 
            icon={<Rocket className="h-6 w-6 text-chart-amber" strokeWidth={1.5} />}
            colorClass="from-chart-amber/20 to-chart-amber/10"
            glowClass="bg-chart-amber/30"
          />
          <div>
            <h3 className="text-lg font-display font-semibold mb-3 text-foreground">Origin</h3>
            <p className="text-foreground font-medium mb-4 italic text-sm md:text-base border-l-2 border-primary/50 pl-4">
              "{aboutContent.origin.question}"
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Black Tech Street was founded on this question, and a three-pronged epiphany:
            </p>
            <ol className="space-y-3">
              {aboutContent.origin.epiphanies.map((epiphany, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0 border border-primary/20">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {epiphany}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
