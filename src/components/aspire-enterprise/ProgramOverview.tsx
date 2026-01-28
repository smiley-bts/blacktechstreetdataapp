import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, Presentation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const formatItems = [
  { icon: Clock, label: '1-Day Immersive', desc: 'Experience' },
  { icon: Presentation, label: 'Instructor-Led', desc: 'Hands-On Learning' },
  { icon: Users, label: 'Open Cohorts or', desc: 'Private Engagements' },
];

export function ProgramOverview() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
          Program <span className="text-primary">Overview</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="text-primary font-semibold">ASPIRE</span> is a hands-on AI fluency training program 
                  developed by Black Tech Street through the <span className="text-primary font-semibold">Greenwood AI Center of Excellence (G-ACE)</span>. 
                  It is designed for corporations, small businesses, nonprofits, community members and public-sector organizations 
                  seeking to adopt AI responsibly and productively, without requiring technical expertise or major infrastructure changes.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  ASPIRE focuses on <span className="text-foreground font-medium">practical application, not theory</span>. 
                  Participants leave with immediately usable AI workflows, confidence using modern AI tools, 
                  and clear guardrails for responsible use across their organization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Program Format */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-display font-semibold text-foreground text-center mb-6">
          Program Format
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formatItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/50 
                              hover:bg-primary/5 transition-all duration-300 group h-full">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 
                                group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
