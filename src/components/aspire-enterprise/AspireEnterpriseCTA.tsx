import { motion } from 'framer-motion';
import { Mail, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function AspireEnterpriseCTA() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-primary/5 
                        border-primary/30 backdrop-blur-sm">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <CardContent className="relative p-8 md:p-12 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="inline-flex p-4 rounded-2xl bg-primary/20 text-primary mb-6"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Ready to bring <span className="text-primary">ASPIRE</span> to your organization?
            </h2>

            {/* Subtitle */}
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              ASPIRE equips organizations with the confidence, capability, and structure needed to adopt AI responsibly—today and at scale.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gap-2 px-8"
                onClick={() => window.location.href = 'mailto:info@blacktechstreet.com'}
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => window.open('https://blacktechstreet.com/aspire', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Learn More
              </Button>
            </div>

            {/* Contact info */}
            <div className="mt-8 pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                <a 
                  href="mailto:info@blacktechstreet.com" 
                  className="text-primary hover:underline"
                >
                  info@blacktechstreet.com
                </a>
                {' '}&bull;{' '}
                <a 
                  href="https://blacktechstreet.com/aspire" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  blacktechstreet.com/aspire
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
