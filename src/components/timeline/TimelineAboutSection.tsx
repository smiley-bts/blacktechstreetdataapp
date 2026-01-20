import { motion } from 'framer-motion';
import { Target, Eye, Wrench, Lightbulb } from 'lucide-react';
import { aboutContent } from '@/data/timeline';
import { cn } from '@/lib/utils';

interface IconBoxProps {
  icon: React.ReactNode;
}

function IconBox({ icon }: IconBoxProps) {
  return (
    <div className="relative group">
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      {/* Icon container - dark themed with emerald accent */}
      <div className={cn(
        "relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        "bg-secondary border border-primary/30",
        "shadow-lg shadow-black/20"
      )}>
        {icon}
      </div>
    </div>
  );
}

export function TimelineAboutSection() {
  return (
    <section className="py-16 border-b border-border/30">
      <div className="grid gap-8 md:gap-10">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Target className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
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
          <IconBox icon={<Eye className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Vision
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
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
          <IconBox icon={<Wrench className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Approach
            </h3>
            <div className="text-muted-foreground leading-relaxed text-base md:text-lg space-y-4">
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
          <IconBox icon={<Lightbulb className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Origin
            </h3>
            <p className="text-foreground font-medium mb-4 italic text-base md:text-lg border-l-2 border-primary pl-4">
              "{aboutContent.origin.question}"
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Black Tech Street was founded on this question, and a three-pronged epiphany:
            </p>
            <ol className="space-y-4">
              {aboutContent.origin.epiphanies.map((epiphany, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-secondary text-primary text-base font-bold flex items-center justify-center shrink-0 border border-primary/30">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground text-base md:text-lg leading-relaxed">
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