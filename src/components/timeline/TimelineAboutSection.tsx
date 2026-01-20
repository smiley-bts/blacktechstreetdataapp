import { motion } from 'framer-motion';
import { Target, Eye, Wrench, Lightbulb, Users } from 'lucide-react';
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
        {/* Origin - First */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Lightbulb className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Origin
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Black Tech Street was founded on one question:{' '}
              <motion.strong
                initial={{ opacity: 0.6, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="inline text-foreground relative"
              >
                "What could Black Wall Street have been, had it been supported and not destroyed?"
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-primary/50 origin-left"
                />
              </motion.strong>{' '}
              BTS was built on three core realities:{' '}
              <strong className="text-foreground">tech can create intergenerational wealth in 7–10 years</strong>, it is the{' '}
              <strong className="text-foreground">engine behind global innovation</strong>, and by{' '}
              <strong className="text-foreground">2030</strong> the U.S. is projected to face a shortage of up to{' '}
              <strong className="text-foreground">4.3 million high-paying tech jobs</strong>.
            </p>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.4 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Wrench className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              What We Do
            </h3>
            <div className="text-muted-foreground leading-relaxed text-base md:text-lg space-y-4">
              {aboutContent.whatWeDo.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Who We Serve */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-5"
        >
          <IconBox icon={<Users className="h-5 w-5 text-primary" strokeWidth={1.5} />} />
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
              Who We Serve
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Black Tech Street serves local government, Educational Institutions, employers and business networks, entrepreneurs and startups, and community learners, including residents and future-ready professionals.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}