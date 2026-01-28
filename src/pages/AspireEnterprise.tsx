import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { TechBackground } from '@/components/timeline/TechBackground';
import { TimelineProgress } from '@/components/timeline/TimelineProgress';
import { BackToTopButton } from '@/components/timeline/BackToTopButton';
import { AspireEnterpriseHero } from '@/components/aspire-enterprise/AspireEnterpriseHero';
import { AspireEnterpriseTOC } from '@/components/aspire-enterprise/AspireEnterpriseTOC';
import { ProgramOverview } from '@/components/aspire-enterprise/ProgramOverview';
import { CoreModules } from '@/components/aspire-enterprise/CoreModules';
import { PricingTiers } from '@/components/aspire-enterprise/PricingTiers';
import { WhyAspire } from '@/components/aspire-enterprise/WhyAspire';
import { AspireEnterpriseCTA } from '@/components/aspire-enterprise/AspireEnterpriseCTA';

export default function AspireEnterprise() {
  const { setTheme, theme } = useTheme();

  // Force dark theme on this page
  useEffect(() => {
    const previousTheme = theme;
    setTheme('dark');
    
    return () => {
      if (previousTheme && previousTheme !== 'dark') {
        setTheme(previousTheme);
      }
    };
  }, []);

  // Set SEO meta tags
  useEffect(() => {
    document.title = 'ASPIRE Enterprise | Black Tech Street';
    
    const updateOrCreateMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateMeta('description', 'ASPIRE Enterprise - AI Fluency & Responsibility training for corporations, small businesses, and nonprofits. A G-ACE Training Program by Black Tech Street.', true);
    updateOrCreateMeta('og:title', 'ASPIRE Enterprise | Black Tech Street');
    updateOrCreateMeta('og:description', 'Hands-on AI fluency training for organizations seeking to adopt AI responsibly and productively.');
    updateOrCreateMeta('og:url', 'https://blacktechstreetdataapp.lovable.app/aspireenterprise');
    updateOrCreateMeta('og:image', 'https://blacktechstreetdataapp.lovable.app/images/bts-logo-white.png');
    updateOrCreateMeta('og:type', 'website');
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground dark overflow-x-hidden">
      {/* Tech background effects */}
      <TechBackground isVisible={true} />

      {/* Progress bar */}
      <TimelineProgress />

      {/* Hero */}
      <AspireEnterpriseHero />

      {/* Table of Contents */}
      <div className="relative z-10 px-5 max-w-3xl mx-auto">
        <AspireEnterpriseTOC />
      </div>

      {/* Main content */}
      <main className="relative z-10 px-5 pb-20 max-w-3xl mx-auto">
        {/* Program Overview */}
        <div id="overview-section">
          <ProgramOverview />
        </div>

        {/* Core Modules */}
        <div id="modules-section">
          <CoreModules />
        </div>

        {/* Pricing Tiers */}
        <div id="pricing-section">
          <PricingTiers />
        </div>

        {/* Why ASPIRE */}
        <div id="why-section">
          <WhyAspire />
        </div>

        {/* CTA */}
        <div id="contact-section">
          <AspireEnterpriseCTA />
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </main>

      {/* Floating back to top button */}
      <BackToTopButton />
    </div>
  );
}
