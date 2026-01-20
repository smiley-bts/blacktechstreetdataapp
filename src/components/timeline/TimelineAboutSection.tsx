import { motion } from 'framer-motion';
import { Target, Eye, Wrench, Lightbulb } from 'lucide-react';
import { aboutContent } from '@/data/timeline';

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
          className="flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold mb-2">Mission</h3>
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
          className="flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-chart-purple/20 flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5 text-chart-purple" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold mb-2">Vision</h3>
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
          className="flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-chart-amber/20 flex items-center justify-center shrink-0">
            <Wrench className="h-5 w-5 text-chart-amber" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold mb-2">What We Do</h3>
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
          className="flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-chart-pink/20 flex items-center justify-center shrink-0">
            <Lightbulb className="h-5 w-5 text-chart-pink" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold mb-3">Origin</h3>
            <p className="text-foreground font-medium mb-4 italic text-sm md:text-base">
              "{aboutContent.origin.question}"
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Black Tech Street was founded on this question, and a three-pronged epiphany:
            </p>
            <ol className="space-y-3">
              {aboutContent.origin.epiphanies.map((epiphany, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
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
