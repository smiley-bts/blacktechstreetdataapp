import { motion } from 'framer-motion';
import { Users, Zap, Shield, Settings, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const reasons = [
  {
    icon: Users,
    title: 'Built for non-technical teams',
    description: 'No coding or technical background required',
  },
  {
    icon: Zap,
    title: 'Immediate, real-world use',
    description: 'Leave with workflows you can use tomorrow',
  },
  {
    icon: Shield,
    title: 'Responsibility & ethics embedded',
    description: 'Guardrails and best practices throughout',
  },
  {
    icon: Settings,
    title: 'Flexible delivery formats',
    description: 'Open cohorts, private teams, or executive sessions',
  },
  {
    icon: TrendingUp,
    title: 'Clear ROI',
    description: 'Productivity gains and strategic clarity',
  },
  {
    icon: MapPin,
    title: 'Community-rooted, enterprise-ready',
    description: 'Silicon Valley quality, Greenwood values',
  },
];

export function WhyAspire() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
          Why Organizations Choose <span className="text-primary">ASPIRE</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reasons.map((reason, index) => (
          <motion.div
            key={reason.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full bg-card/30 backdrop-blur-sm border-border/50 
                            hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 p-2.5 rounded-xl bg-primary/10 text-primary
                               group-hover:bg-primary/20 transition-colors">
                  <reason.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reason.description}
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
