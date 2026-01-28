import { motion } from 'framer-motion';
import { Building2, Store, Heart, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const tiers = [
  {
    icon: Building2,
    name: 'Corporate Tier',
    bestFor: 'Corporations, enterprise teams, large institutions',
    gradient: 'from-blue-500/10 via-blue-400/5 to-primary/10',
    accentColor: 'blue-500',
    iconBg: 'bg-blue-500/20',
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
    gradient: 'from-amber-500/10 via-amber-400/5 to-primary/10',
    accentColor: 'amber-500',
    iconBg: 'bg-amber-500/20',
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
    gradient: 'from-rose-500/10 via-rose-400/5 to-primary/10',
    accentColor: 'rose-500',
    iconBg: 'bg-rose-500/20',
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
            <Card className={`relative bg-gradient-to-br ${tier.gradient} backdrop-blur-md 
                            border border-white/[0.08] hover:border-white/[0.15]
                            shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/40
                            transition-all duration-300 ease-out overflow-hidden group
                            hover:scale-[1.02] hover:-translate-y-1`}>
              {/* Subtle inner glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} blur-xl`} />
              </div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${tier.iconBg} backdrop-blur-sm border border-white/10`}>
                    <tier.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-display">{tier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Best for: {tier.bestFor}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {/* Pricing table */}
                <div className="bg-background/20 rounded-xl overflow-hidden border border-white/[0.05]">
                  <div className="divide-y divide-white/[0.05]">
                    {tier.pricing.map((item, index) => (
                      <div key={index} className="flex justify-between items-center px-4 py-3.5 
                                                  hover:bg-white/[0.03] transition-colors">
                        <span className="text-sm text-foreground/70">{item.format}</span>
                        <Badge variant="secondary" className="bg-primary/15 text-primary font-semibold 
                                                             border border-primary/20 shadow-sm shadow-primary/10">
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
