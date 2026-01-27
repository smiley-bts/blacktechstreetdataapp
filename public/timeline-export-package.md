# Black Tech Street Timeline - Export Package

This document contains all the code needed to recreate the `/timeline` page in a new project.

---

## Required Dependencies

Add these to your new project:

```bash
npm install framer-motion lucide-react @radix-ui/react-dialog next-themes react-router-dom clsx tailwind-merge tailwindcss-animate
```

---

## File Structure

```
new-project/
├── public/
│   └── images/
│       ├── gallery/     (copy all gallery photos)
│       ├── team/        (4 headshots)
│       ├── bts-logo-white.png
│       └── tulsa-skyline-banner.png
├── src/
│   ├── assets/logos/
│   │   └── bts-b-logo.png
│   ├── components/
│   │   ├── timeline/
│   │   │   ├── BackToTopButton.tsx
│   │   │   ├── ImpactSnapshot.tsx
│   │   │   ├── InTheNewsSection.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── TeamSection.tsx
│   │   │   ├── TechBackground.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── TimelineAboutSection.tsx
│   │   │   ├── TimelineCard.tsx
│   │   │   ├── TimelineGallery.tsx
│   │   │   ├── TimelineHero.tsx
│   │   │   └── TimelineProgress.tsx
│   │   └── ui/
│   │       ├── count-up.tsx
│   │       └── dialog.tsx
│   ├── data/
│   │   └── timeline.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   └── Timeline.tsx
│   └── index.css
└── tailwind.config.ts
```

---

## 1. src/lib/utils.ts

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 2. src/components/ui/count-up.tsx

```tsx
import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function CountUp({ 
  end, 
  duration = 800, 
  prefix = "", 
  suffix = "",
  className,
  decimals = 0
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    countRef.current = 0;
    startTimeRef.current = null;
    
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentCount = easeOutQuart * end;
      countRef.current = currentCount;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.round(count).toLocaleString();

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
```

---

## 3. src/components/ui/dialog.tsx

```tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-xl duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:bg-muted hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

---

## 4. src/data/timeline.ts

```tsx
export type TimelineCategory = 
  | 'Policy' 
  | 'Partnerships' 
  | 'Community' 
  | 'Research' 
  | 'Events' 
  | 'Infrastructure';

export interface MediaLink {
  title: string;
  source: string;
  url: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  year: number;
  title: string;
  description: string;
  category: TimelineCategory;
  tags: string[];
  image?: string;
  longDescription?: string;
  links?: { label: string; url: string }[];
  mediaLinks?: MediaLink[];
  youtubeUrl?: string;
  photoCredit?: string;
  isFeatured?: boolean;
  galleryEventId?: 'nvidia-sep-2025' | 'aspire-sep-2025' | 'aspire-june-2025' | 'aspire-dec-2025' | 'aspire-lead-dec-2025' | 'microsoft-visit' | 'white-house-cyber' | 'hack-the-future' | 'senate-testimony' | 'ai-executive-order' | 'defcon-seed-ai' | 'microsoft-announce';
}

export const timelineItems: TimelineItem[] = [
  {
    id: 'white-house-cyber-2023',
    date: '2023-02',
    year: 2023,
    title: 'White House Cyber Roundtable',
    description: 'Tyrance spoke as a panelist at the White House Office of the National Cyber Director convening.',
    longDescription: 'Tyrance was a Panelist Speaker at a convening of leaders in the Cyber Industry, hosted by the White House Office of the National Cyber Director. This marked Black Tech Street\'s first White House touchpoint, establishing critical relationships at the highest levels of federal cybersecurity policy.',
    category: 'Policy',
    tags: ['White House', 'Cybersecurity'],
    galleryEventId: 'white-house-cyber',
  },
  {
    id: 'microsoft-partnership-2023',
    date: '2023-07',
    year: 2023,
    title: 'Microsoft Partnership Established',
    description: 'BTS established a foundational relationship with Microsoft for long-term AI and cybersecurity collaboration.',
    longDescription: 'Black Tech Street established a foundational relationship with Microsoft for long-term AI and cybersecurity collaboration. Robert F. Smith highlighted the Microsoft announcement in August 2023. This partnership would later lead to the Microsoft Cyber and AI Co-Innovation Lab in historic Greenwood.',
    category: 'Partnerships',
    tags: ['Microsoft', 'Greenwood'],
    galleryEventId: 'microsoft-announce',
  },
  {
    id: 'defcon-seedai-2023',
    date: '2023-08',
    year: 2023,
    title: 'Responsible AI: DEF-CON 31 & SeedAI',
    description: 'Public red team of AI models with 75 participants, partnered with White House Office of Science and Technology Policy.',
    longDescription: 'BTS, in partnership with SeedAI and the White House Office of Science and Technology Policy, took 75 people to participate in the largest public red team of AI models in history at that time. This event demonstrated BTS\'s commitment to responsible AI development and community engagement in emerging technology governance.',
    category: 'Research',
    tags: ['DEF CON', 'SeedAI', 'Red Team'],
    galleryEventId: 'defcon-seed-ai',
  },
  {
    id: 'ai-executive-order-2023',
    date: '2023-10',
    year: 2023,
    title: 'AI Executive Order Signing under the Biden Administration',
    description: 'Biden Administration signs executive order on responsible AI development.',
    longDescription: 'The Biden Administration signed a landmark executive order on responsible AI development. Black Tech Street\'s advocacy and engagement at the federal level contributed to shaping policies that prioritize safety, security, and civil rights in AI systems.',
    category: 'Policy',
    tags: ['Executive Order', 'Biden Administration'],
    galleryEventId: 'ai-executive-order',
  },
  {
    id: 'democratic-caucus-2023',
    date: '2023-12',
    year: 2023,
    title: 'Democratic Caucus Interview on AI & Civil Rights',
    description: 'Tyrance interviewed on the Democratic Caucus on AI and civil rights.',
    longDescription: 'Tyrance was interviewed by the Democratic Caucus on the intersection of AI and civil rights, discussing how emerging technologies can either reinforce or help dismantle systemic inequities, and the importance of inclusive AI policy development.',
    category: 'Policy',
    tags: ['Democratic Caucus', 'Civil Rights', 'AI'],
    image: '/images/gallery/democratic-caucus-interview-dec2023.png',
  },
  {
    id: 'senate-civil-rights-2023',
    date: '2023-12',
    year: 2023,
    title: 'AI and the Future of Work: Moving Forward Together',
    description: 'AI & Civil Rights interview; testified before Senate HELP Committee on AI and the future of work.',
    longDescription: 'Tyrance testified in front of the Senate HELP Committee about AI and the future of work, addressing how AI will transform employment, the need for workforce development, and ensuring that the benefits of AI-driven productivity are shared across all communities.',
    category: 'Policy',
    tags: ['Senate', 'Civil Rights', 'C-SPAN'],
    galleryEventId: 'senate-testimony',
  },
  {
    id: 'hack-the-future-2024',
    date: '2024-02',
    year: 2024,
    title: 'Hack the Future Greenwood',
    description: 'Community-based AI challenge areas across entrepreneurship, economic development, justice, and education.',
    longDescription: 'Co-hosted with SeedAI and the White House Office of Science and Technology Policy, Hack the Future Greenwood used case-based challenges across 6 focus areas: Entrepreneurship, Community & Economic Development, Spirituality & Religion, Social & Criminal Justice, Creative Expression, and Education & Learning.',
    category: 'Events',
    tags: ['Hackathon', 'Community'],
    galleryEventId: 'hack-the-future',
  },
  {
    id: 'cyber-director-visit-2024',
    date: '2024-06',
    year: 2024,
    title: 'White House National Cyber Director Visit',
    description: 'Hosted the White House National Cyber Director during Juneteenth.',
    longDescription: 'BTS hosted the White House National Cyber Director during Juneteenth to discuss cybersecurity workforce development, community engagement, and the unique opportunity to build cyber capacity in historically underserved communities.',
    category: 'Policy',
    tags: ['Juneteenth', 'Cybersecurity'],
    galleryEventId: 'white-house-cyber',
  },
  {
    id: 'tech-hubs-2024',
    date: '2024-01',
    year: 2024,
    title: 'Tech Hubs Designation',
    description: 'Steering committee wins federal Tech Hubs designation with $51M grant.',
    longDescription: 'Black Tech Street served on the steering committee that won both the federal Tech Hubs designation and a $51M grant for autonomous systems. Tulsa was one of only two cities that were awarded both the designation and implementation funding, as part of the CHIPS and Science Act initiative.',
    category: 'Infrastructure',
    tags: ['Tech Hubs', '$51M'],
  },
  {
    id: 'gace-2024',
    date: '2024-06',
    year: 2024,
    title: 'G-ACE Established',
    description: 'Greenwood AI Center of Excellence established with $10.6M BTS sub-award.',
    longDescription: 'The Greenwood AI Center of Excellence (G-ACE) is Black Tech Street\'s national model for AI integration, governance, and adaptation at scale. Core thesis: "The winner of the AI Race will determine the outcome of human civilization, and the country that wins will be the one that successfully integrates AI across society, not just who develops the most powerful models. G-ACE serves as America\'s testbed for democratic AI scaling that secures national interests while ensuring widespread public benefit."',
    category: 'Infrastructure',
    tags: ['G-ACE', '$10.6M'],
    galleryEventId: 'aspire-june-2025',
  },
  {
    id: 'aspire-launch-2025',
    date: '2025-06',
    year: 2025,
    title: 'Launch: ASPIRE AI Workshops',
    description: 'First ASPIRE GenAI Fluency & Responsibility Lab launched in Greenwood.',
    longDescription: 'ASPIRE (AI Fluency, Innovation & Research Engine) launched its first workshop series. Program goals include engaging 500+ community members, hosting 2-4 large marquee events per year and 4-8+ educational events per year, with outcomes of 25-50 individuals AI fluent/certified per quarter by Year 3. This marked the beginning of mass AI fluency initiatives across all demographics in Greenwood.',
    category: 'Events',
    tags: ['ASPIRE', 'AI Workshop', 'Launch'],
    galleryEventId: 'aspire-june-2025',
  },
  {
    id: 'nvidia-partnership-2025',
    date: '2025-09-03',
    year: 2025,
    title: 'NVIDIA Partnership Established',
    description: 'MOU signed to scale training, compute access, and innovation in Greenwood.',
    longDescription: 'Black Tech Street signed an MOU with NVIDIA establishing shared goals and aspirations to: train up to 10,000 learners in AI through collaborations with universities and community organizations; provide advanced computing resources (NVIDIA GPUs and cloud platforms) to power local AI projects, startups, and applied research; partner on local, state, and federal grant pursuits; expand access to NVIDIA\'s startup ecosystem including the NVIDIA Inception program; and host hackathons, tech fairs, and innovation challenges to ignite grassroots innovation.',
    category: 'Partnerships',
    tags: ['NVIDIA', 'Training', 'Compute'],
    isFeatured: true,
    galleryEventId: 'nvidia-sep-2025',
    youtubeUrl: 'https://www.youtube.com/watch?v=Xks2RYWa6Gg&t=30s',
    mediaLinks: [
      {
        title: 'NVIDIA Announces Collaboration with Black Tech Street',
        source: 'LinkedIn',
        url: 'https://www.linkedin.com/posts/nvidia_today-we-announced-a-new-collaboration-with-activity-7369136064881414145-quKD',
      },
      {
        title: 'Black Tech Street Collaborates with NVIDIA to Launch AI Partnership',
        source: 'Yahoo Finance',
        url: 'https://finance.yahoo.com/news/black-tech-street-collaborates-nvidia-180000254.html',
      },
      {
        title: 'Black Tech Street and NVIDIA Launch AI Partnership',
        source: 'FOX23',
        url: 'https://www.fox23.com/news/black-tech-street-and-nvidia-launch-ai-partnership-focused-on-tulsas-greenwood-district/article_461995ff-0392-477a-9ad0-8b7e17308674.html',
      },
      {
        title: 'NVIDIA Partnership to Bring AI Training to Greenwood',
        source: 'Tulsa World',
        url: 'https://tulsaworld.com/news/local/business/article_e886152c-e0d9-4732-ad15-99c79c48a617.html',
      },
      {
        title: 'A Game-Changing Win for Black Wall Street',
        source: 'LinkedIn',
        url: 'https://www.linkedin.com/posts/experience-tulsa_a-game-changing-win-for-black-wall-street-activity-7369112114319323139-trVi',
      },
    ],
  },
];

export const microsoftLabSection = {
  title: 'Microsoft Cyber and AI Co-Innovation Lab in Greenwood',
  description: 'A cutting-edge facility enabling AI and cybersecurity solution development.',
  features: [
    'Runs parallel to ASPIRE',
    'Enables AI and cybersecurity solution development free of cost',
    'Full IP ownership by the client for products created',
  ],
  capabilities: [
    'Startup and enterprise support with responsible AI design',
    'Public sector and infrastructure solutions',
    'AI governance frameworks',
    'Community-embedded innovation with transparency and inclusion',
  ],
  location: 'Moton building, co-located with BTS in historic Greenwood',
};

export const aboutContent = {
  mission: 'Rebirthing Historic Black Wall Street as a world class innovation economy rooted in AI, Cybersecurity, and Other Emerging Technologies.',
  vision: 'Transforming Greenwood and the Greater Tulsa Region (GTR) into the model for AI powered societies and economies of the future. Helping the United States win the AI Race and thrive in the AI Age.',
  whatWeDo: 'We design and deliver programs at the intersection of education, innovation, and research to ensure communities can participate in, and shape, the AI economy.',
  origin: {
    question: 'What could Black Wall Street have been, had it been supported and not destroyed?',
    epiphanies: [
      'Tech is one of the only industries within which one can build intergenerational wealth in just 7 to 10 years.',
      'Tech is the core medium for all global innovation.',
      'By the year 2030, there are projected to be as many as 4.3 million high paying tech jobs due to a tech talent shortage.',
    ],
  },
};

export const categories: TimelineCategory[] = [
  'Policy',
  'Partnerships', 
  'Community',
  'Research',
  'Events',
  'Infrastructure',
];

export const years = [...new Set(timelineItems.map(item => item.year))].sort();
```

---

## 5. src/components/timeline/BackToTopButton.tsx

```tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-110 transition-all duration-300 group"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10 group-hover:blur-lg group-hover:bg-primary/30 transition-all duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
```

---

## 6. src/components/timeline/TimelineProgress.tsx

```tsx
import { motion, useScroll, useSpring } from 'framer-motion';

export function TimelineProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50 origin-left"
      style={{ scaleX }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-primary"
        style={{ scaleX }}
      />
      <motion.div
        className="absolute inset-0 blur-sm bg-primary/50"
        style={{ scaleX }}
      />
    </motion.div>
  );
}
```

---

## 7. src/components/timeline/TimelineHero.tsx

```tsx
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import btsLogoB from '@/assets/logos/bts-b-logo.png';

const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';

function MatrixRain() {
  const columns = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      chars: [...Array(8)].map(() => matrixChars[Math.floor(Math.random() * matrixChars.length)]),
      left: `${i * 5 + Math.random() * 2}%`,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {columns.map((col) => (
        <motion.div
          key={col.id}
          className="absolute top-0 text-primary font-mono text-xs leading-tight"
          style={{ left: col.left }}
          initial={{ y: '-100%' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: col.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: col.delay,
          }}
        >
          {col.chars.map((char, i) => (
            <motion.div
              key={i}
              className="opacity-70"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              {char}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export function TimelineHero() {
  const scrollToTimeline = () => {
    document.getElementById('timeline-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[50vh] flex flex-col items-center justify-center px-5 pb-6 pt-16 overflow-hidden">
      <MatrixRain />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        <motion.div
          className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
          }}
        />
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 7}%`,
              top: `${15 + (i % 4) * 20}%`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 8px hsl(var(--primary) / 0.6)',
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/20"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.1,
            type: 'spring',
            stiffness: 200,
          }}
          className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0"
        >
          <motion.div
            className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <img 
            src={btsLogoB} 
            alt="Black Tech Street" 
            className="relative w-full h-full object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center md:text-left"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight relative"
            whileHover={{ 
              textShadow: '2px 2px 0 hsl(var(--primary) / 0.3), -2px -2px 0 hsl(var(--primary) / 0.2)',
            }}
          >
            <motion.span
              animate={{
                textShadow: [
                  '0 0 0 transparent',
                  '0 0 10px hsl(var(--primary) / 0.3)',
                  '0 0 0 transparent',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Black Tech Street
            </motion.span>
          </motion.h1>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        onClick={scrollToTimeline}
        className="relative z-10 group flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.button>

      <div id="timeline-start" className="absolute bottom-0" />
    </section>
  );
}
```

---

## 8. src/components/timeline/TechBackground.tsx

```tsx
import { useEffect, useState, useMemo } from 'react';

interface TechBackgroundProps {
  isVisible: boolean;
}

const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

function MatrixColumn({ index, totalColumns }: { index: number; totalColumns: number }) {
  const chars = useMemo(() => {
    const length = 15 + Math.floor(Math.random() * 20);
    return Array.from({ length }, () => 
      matrixChars[Math.floor(Math.random() * matrixChars.length)]
    );
  }, []);

  const duration = 8 + Math.random() * 12;
  const delay = Math.random() * 10;
  const left = (index / totalColumns) * 100;

  return (
    <div
      className="absolute flex flex-col items-center text-primary/40 font-mono text-xs select-none animate-matrix-fall"
      style={{ 
        left: `${left}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {chars.map((char, i) => (
        <span 
          key={i} 
          className={i === 0 ? 'text-primary brightness-150' : ''}
          style={{ 
            opacity: 1 - (i / chars.length) * 0.7,
            textShadow: i === 0 ? '0 0 10px hsl(var(--primary))' : 'none'
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

export function TechBackground({ isVisible }: TechBackgroundProps) {
  const [pageHeight, setPageHeight] = useState(0);
  const columnCount = 40;
  
  useEffect(() => {
    const updateHeight = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    const observer = new MutationObserver(updateHeight);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);
  
  if (!isVisible) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={{ height: pageHeight || '100%', minHeight: '100vh' }}
    >
      <div className="absolute inset-0 opacity-30">
        {[...Array(columnCount)].map((_, i) => (
          <MatrixColumn key={`a-${i}`} index={i} totalColumns={columnCount} />
        ))}
      </div>
      
      <div className="absolute inset-0 opacity-20">
        {[...Array(Math.floor(columnCount / 2))].map((_, i) => (
          <MatrixColumn key={`b-${i}`} index={i * 2 + 0.5} totalColumns={columnCount} />
        ))}
      </div>

      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="absolute top-[10%] left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-[30%] right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute top-[50%] left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-[70%] right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute top-[90%] left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      <svg className="absolute top-0 left-0 w-40 h-40 text-primary/10" viewBox="0 0 100 100">
        <path d="M0 50 L30 50 L40 40 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M50 0 L50 30 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="60" cy="40" r="2" fill="currentColor" />
      </svg>
      
      <svg className="absolute bottom-0 right-0 w-40 h-40 text-primary/10 rotate-180" viewBox="0 0 100 100">
        <path d="M0 50 L30 50 L40 40 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M50 0 L50 30 L60 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="60" cy="40" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
```

---

## 9. src/components/timeline/TableOfContents.tsx

```tsx
import { motion } from 'framer-motion';
import { Users, Scroll, Calendar, MessageSquareQuote, Image, Building, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'team-section', label: 'Team', icon: Users },
  { id: 'about-section', label: 'Story', icon: Scroll },
  { id: 'timeline-section', label: 'Timeline', icon: Calendar },
  { id: 'impact-section', label: 'Impact', icon: Building },
  { id: 'testimonials', label: 'Voices', icon: MessageSquareQuote },
  { id: 'news-section', label: 'Media', icon: Play },
  { id: 'photo-gallery', label: 'Gallery', icon: Image },
];

export function TableOfContents() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap md:flex-nowrap justify-center gap-1.5 md:gap-2 py-6"
    >
      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.button
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            onClick={() => scrollToSection(section.id)}
            whileHover={{ 
              scale: 1.08, 
              y: -2,
              transition: { type: 'spring', stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "group relative flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full",
              "bg-card/60 backdrop-blur-sm border border-border/40",
              "text-muted-foreground",
              "hover:text-primary hover:border-primary/50 hover:bg-primary/10",
              "hover:shadow-lg hover:shadow-primary/20",
              "transition-all duration-300"
            )}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <Icon className="relative h-3.5 w-3.5 md:h-4 md:w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative text-xs md:text-sm font-medium">{section.label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
```

---

## 10. src/components/timeline/TeamSection.tsx

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, User, ChevronDown } from 'lucide-react';

interface TeamMember {
  name: string;
  title: string;
  shortBio: string;
  expandedBio: string;
  image?: string;
  linkedIn?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Tyrance Billingsley II",
    title: "Founder & CEO",
    shortBio: "Tyrance Billingsley II is a Tulsa-born entrepreneur, technologist, and ecosystem builder. Under his leadership, Black Tech Street has brokered a citywide alliance with Microsoft to establish 21st-century Greenwood and secured federal Tech Hubs designation with an eight-figure award.",
    expandedBio: `Tyrance Billingsley II is a Tulsa-born and raised entrepreneur, technologist and ecosystem builder. Tyrance is the founder and executive director of Black Tech Street, an organization dedicated to rebirthing historic Black Wall Street as the nation's premiere black innovation economy rooted in the critical technology areas of cybersecurity, data analytics and responsible artificial intelligence.

Under his leadership, Black Tech Street has, in just three years, brokered a citywide alliance with Microsoft to establish 21st-century Greenwood and, as a leader in cyber and AI, served on the Tulsa Tech Hub steering committee that secured both a federal Tech Hubs designation and funding from the Economic Development Administration, with an eight-figure award being allocated to Black Tech Street's work, and generated widespread community support for the vision of rebirthing Black Wall Street through technology.

Tyrance has given a TEDx talk and been featured in publications like Forbes, Blavity, CNN Business and Black Enterprise. His thought leadership on AI and emerging technologies has led to him testifying before the United States Senate HELP committee on AI and the Future of Work, attending the historic signing of the AI Executive Order at the White House, addressing a caucus meeting on AI and civil rights, and hosting the White House National Cyber Director Harry Coker Jr. and his team in historic Greenwood.`,
    image: "/images/team/tyrance-billingsley.png",
    linkedIn: "https://www.linkedin.com/in/tyrance-billingsley-ii-ab0683123/"
  },
  {
    name: "Josephine Nelms",
    title: "Chief Operating Officer",
    shortBio: "Josephine Nelms leads the operational strategy, partnerships and organizational systems that power Black Tech Street's mission. With more than 15 years of experience in operations, HR and organizational leadership.",
    expandedBio: `Josephine Nelms is the Chief Operating Officer of Black Tech Street, an organization committed to rebirthing Black Wall Street as the nation's premiere innovative economy, with a strategic focus on responsible AI, cybersecurity and emerging technologies. As COO, Josephine leads the operational strategy, partnerships and organizational systems that power Black Tech Street's mission.`,
    image: "/images/team/josephine-nelms.png",
    linkedIn: "https://www.linkedin.com/in/josephine-nelms-108b87173/"
  },
  {
    name: "Allen Collins",
    title: "Chief of Staff",
    shortBio: "Allen Collins transforms BTS initiatives into high-impact experiences that strengthen Tulsa's innovation ecosystem. He oversees program execution, community engagements, and manages logistics.",
    expandedBio: `Allen Collins is a Tulsa-born and community-centered leader who serves as the Chief of Staff for Black Tech Street (BTS). In this role, Allen is responsible for transforming BTS initiatives into high-impact experiences that strengthen Tulsa's innovation ecosystem.`,
    image: "/images/team/allen-collins.png",
    linkedIn: "https://www.linkedin.com/in/allen-collins/"
  },
  {
    name: "Smiley Elmore III",
    title: "Communications Manager",
    shortBio: "Smiley Elmore III leads all organizational communications, marketing, and brand execution across digital, email, and public platforms.",
    expandedBio: `Smiley Elmore III is a Tulsa-based communications strategist and creative technologist who serves as the Communications Manager for Black Tech Street (BTS). In this role, Smiley leads all organizational communications, marketing, and brand execution across digital, email, and public platforms.`,
    image: "/images/team/smiley-elmore.png",
    linkedIn: "https://www.linkedin.com/in/smiley-elmore-iii/"
  }
];

function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      key={member.name + index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <div 
        className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <div className="relative w-[80%] aspect-square max-w-[280px] md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-xl overflow-hidden bg-secondary border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h3 className="text-xl font-display font-bold text-foreground">
                {member.name}
              </h3>
              {member.linkedIn && (
                <a
                  href={member.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center md:justify-start gap-1.5 text-primary hover:text-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-xs font-medium">LinkedIn</span>
                </a>
              )}
            </div>
            <p className="text-sm text-primary font-medium mb-3">
              {member.title}
            </p>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {member.shortBio}
            </p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-border/30 mt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {member.expandedBio}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <ChevronDown className="w-4 h-4 text-primary" />
            </motion.div>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-center pb-4 gap-2 text-xs text-muted-foreground">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
          <span>{isExpanded ? 'Tap to collapse' : 'Tap to read more'}</span>
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

export function TeamSection() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold">
          <span className="text-primary">Our</span>{' '}
          <span className="text-foreground">Team</span>
        </h2>
      </motion.div>

      <div className="grid gap-8">
        {teamMembers.map((member, index) => (
          <TeamMemberCard key={member.name + index} member={member} index={index} />
        ))}
      </div>
    </section>
  );
}
```

---

## Continue to Part 2...

Due to the size of this export, continue to the second file for the remaining components.

**Files included in Part 2:**
- TimelineAboutSection.tsx
- TimelineCard.tsx
- ImpactSnapshot.tsx
- TestimonialsSection.tsx
- InTheNewsSection.tsx
- TimelineGallery.tsx
- Timeline.tsx (main page)
- tailwind.config.ts
- index.css
