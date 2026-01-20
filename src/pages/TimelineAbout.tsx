import { motion } from 'framer-motion';
import { ArrowLeft, Target, Eye, Wrench, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aboutContent } from '@/data/timeline';
import btsLogo from '@/assets/logos/bts-square-logo.png';

export default function TimelineAbout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 pt-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/timeline"
            className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-md border border-border/50 rounded-full text-muted-foreground hover:text-foreground transition-colors shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Timeline</span>
          </Link>
        </div>
      </header>

      <main className="px-5 pt-24 pb-20 max-w-2xl mx-auto">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden border border-border/30 shadow-lg shadow-primary/10">
            <img src={btsLogo} alt="Black Tech Street" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Black Tech Street
          </h1>
          <p className="text-muted-foreground">Greenwood, Tulsa</p>
        </motion.div>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-semibold">Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-[52px]">
            {aboutContent.mission}
          </p>
        </motion.section>

        {/* Vision */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-chart-purple/20 flex items-center justify-center">
              <Eye className="h-5 w-5 text-chart-purple" />
            </div>
            <h2 className="text-xl font-display font-semibold">Vision</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-[52px]">
            {aboutContent.vision}
          </p>
        </motion.section>

        {/* What We Do */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-chart-amber/20 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-chart-amber" />
            </div>
            <h2 className="text-xl font-display font-semibold">What We Do</h2>
          </div>
          <div className="text-muted-foreground leading-relaxed pl-[52px] space-y-4">
            {aboutContent.whatWeDo.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </motion.section>

        {/* Origin */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-chart-pink/20 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-chart-pink" />
            </div>
            <h2 className="text-xl font-display font-semibold">Origin</h2>
          </div>
          <div className="pl-[52px]">
            <p className="text-foreground font-medium mb-4 italic">
              "{aboutContent.origin.question}"
            </p>
            <p className="text-sm text-muted-foreground mb-4">
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
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-8 border-t border-border/30"
        >
          <Link
            to="/timeline"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Explore the Timeline
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
