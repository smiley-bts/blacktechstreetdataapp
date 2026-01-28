import { motion } from 'framer-motion';
import { Building2, Store, Heart, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const tiers = [
  {
    icon: Building2,
    name: 'Corporate Tier',
    bestFor: 'Corporations, enterprise teams, large institutions',
    color: 'from-blue-500/20 to-primary/20',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    pricing: [
      { format: 'Open Enrollment (per participant)', price: '$750' },
      { format: 'Private Cohort (up to 25 participants)', price: '$15,000 flat' },
      { format: 'Enterprise Package (up to 50 participants)', price: '$25,000 flat' },
      { format: 'Executive Half-Day Briefing (up to 15 leaders)', price: '$5,000' },
    ],
    includes: [
      'Industry-specific customization',
      'Dedicated facilitator',
      'Post-training consultation',
      'Certificates of completion',
      'Priority scheduling',
    ],
  },
  {
    icon: Store,
    name: 'Small Business Tier',
    bestFor: 'Small businesses, startups, local enterprises',
    color: 'from-amber-500/20 to-primary/20',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
    pricing: [
      { format: 'Open Enrollment (per participant)', price: '$400' },
      { format: 'Team Package (5–10 participants)', price: '$3,000 flat' },
      { format: 'Private Small Business Cohort (up to 15)', price: '$5,500 flat' },
      { format: 'Owner / Leadership Intensive (1-day, up to 5 leaders)', price: '$1,500' },
    ],
    includes: [
      'Practical workflow templates',
      'ASPIRE Pocket Guide',
      '30-day follow-up support',
    ],
  },
  {
    icon: Heart,
    name: 'Nonprofit & Public Sector Tier',
    bestFor: 'Nonprofits, educational institutions, government agencies',
    color: 'from-rose-500/20 to-primary/20',
    borderColor: 'border-rose-500/30 hover:border-rose-500/60',
    pricing: [
      { format: 'Open Enrollment (per participant)', price: '$200' },
      { format: 'Team Package (5–15 participants)', price: '$2,000 flat' },
      { format: 'Private Nonprofit Cohort (up to 20)', price: '$3,500 flat' },
      { format: 'Board / Leadership Session (half-day, up to 12 leaders)', price: '$2,000' },
      { format: 'Community Scholarship Cohort*', price: '$50 per participant' },
    ],
    includes: [
      'Mission-aligned use cases',
      'Grant and program applications',
      'ASPIRE Pocket Guide',
      'Community impact certification',
    ],
    note: '*Community Scholarship Cohorts are offered on a limited basis and subsidized by corporate sponsors and grants',
  },
];

export function PricingTiers() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
          Pricing & <span className="text-primary">Engagement Options</span>
        </h2>
      </motion.div>

      <div className="space-y-6">
        {tiers.map((tier, tierIndex) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: tierIndex * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${tier.color} backdrop-blur-sm border ${tier.borderColor} 
                            transition-all duration-300 overflow-hidden`}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-background/50">
                    <tier.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-display">{tier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Best for: {tier.bestFor}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing table */}
                <div className="bg-background/30 rounded-lg overflow-hidden">
                  <div className="divide-y divide-border/30">
                    {tier.pricing.map((item, index) => (
                      <div key={index} className="flex justify-between items-center px-4 py-3 hover:bg-background/20 transition-colors">
                        <span className="text-sm text-foreground/80">{item.format}</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                          {item.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Includes */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-2">
                    {tier.includes.map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note if any */}
                {tier.note && (
                  <p className="text-xs text-muted-foreground/70 italic pt-2 border-t border-border/30">
                    {tier.note}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
