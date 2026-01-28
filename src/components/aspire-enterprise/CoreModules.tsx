import { motion } from 'framer-motion';
import { Brain, Shield, MessageSquare, Keyboard, Briefcase, LayoutGrid, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const modules = [
  {
    number: 1,
    icon: Brain,
    title: 'AI Mindset & Orientation',
    description: 'Understanding what AI is (and is not) and how it fits into daily work.',
  },
  {
    number: 2,
    icon: Shield,
    title: 'Foundations of Responsible AI',
    description: 'Practical frameworks for fact-checking, bias awareness, data sensitivity, and value-aligned use.',
  },
  {
    number: 3,
    icon: MessageSquare,
    title: 'Generative AI & Prompting Fundamentals',
    description: 'How to communicate effectively with AI to get reliable, useful outputs.',
  },
  {
    number: 4,
    icon: Keyboard,
    title: 'Hands-On Prompt Lab',
    description: 'Guided, real-time exercises applying AI to actual work tasks.',
  },
  {
    number: 5,
    icon: LayoutGrid,
    title: 'Daily AI Applications & Personal Workflows',
    description: 'Reusable prompts for writing, planning, research, and problem-solving.',
  },
  {
    number: 6,
    icon: Briefcase,
    title: 'AI at Work: Productivity & Strategy',
    description: 'Applying AI at the team and organizational level for better decisions and outcomes.',
  },
  {
    number: 7,
    icon: Bot,
    title: 'Copilots & AI Agents',
    description: 'Moving from single-use prompting to embedded, repeatable AI workflows.',
  },
];

export function CoreModules() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
          Core <span className="text-primary">Modules</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          ASPIRE consists of 7 progressive modules, designed to build confidence and capability step by step.
        </p>
      </motion.div>

      <div className="space-y-3">
        {modules.map((module, index) => (
          <motion.div
            key={module.number}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/50 
                            hover:bg-primary/5 transition-all duration-300 group overflow-hidden">
              <CardContent className="p-4 flex items-start gap-4">
                {/* Module number */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/30
                               flex items-center justify-center text-primary font-bold text-lg
                               group-hover:bg-primary/20 transition-colors">
                  {module.number}
                </div>
                
                {/* Icon */}
                <div className="flex-shrink-0 p-2 rounded-lg bg-muted/30 text-muted-foreground
                               group-hover:text-primary transition-colors">
                  <module.icon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
