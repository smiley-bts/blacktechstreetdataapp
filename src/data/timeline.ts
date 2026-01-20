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
}

export const timelineItems: TimelineItem[] = [
  {
    id: 'white-house-cyber-2023',
    date: '2023-02',
    year: 2023,
    title: 'First White House Touchpoint, Cyber Roundtable',
    description: 'Tyrance was a panelist speaker at a convening of leaders in the cyber industry hosted by the White House Office of the National Cyber Director.',
    category: 'Policy',
    tags: ['White House', 'Cybersecurity', 'National'],
    image: '/placeholder.svg',
  },
  {
    id: 'microsoft-partnership-2023',
    date: '2023-07',
    year: 2023,
    title: 'Microsoft Partnership',
    description: 'BTS established a foundational relationship with Microsoft to anchor long-term AI and cybersecurity collaboration.',
    category: 'Partnerships',
    tags: ['Microsoft', 'Greenwood', 'Innovation'],
    image: '/placeholder.svg',
  },
  {
    id: 'defcon-seedai-2023',
    date: '2023-08',
    year: 2023,
    title: 'DEF CON 31, SeedAI Red Team',
    description: 'BTS partnered with SeedAI and the White House Office of Science and Technology Policy to bring 75 people to participate in the largest public red team of AI models at the time.',
    category: 'Research',
    tags: ['DEF CON', 'SeedAI', 'Red Team', 'Responsible AI'],
    image: '/placeholder.svg',
  },
  {
    id: 'ai-executive-order-2023',
    date: '2023-10',
    year: 2023,
    title: 'AI Executive Order Era',
    description: 'BTS aligned with national momentum around responsible AI following the signing of the AI Executive Order.',
    category: 'Policy',
    tags: ['Responsible AI', 'National Policy'],
    image: '/placeholder.svg',
  },
  {
    id: 'senate-civil-rights-2023',
    date: '2023-12',
    year: 2023,
    title: 'Senate and Civil Rights Engagement',
    description: 'Tyrance testified in front of the Senate HELP Committee about AI and the future of work, and interviewed with the Democratic caucus on AI and civil rights.',
    category: 'Policy',
    tags: ['Senate', 'Civil Rights', 'AI'],
    image: '/placeholder.svg',
  },
  {
    id: 'hack-the-future-2024',
    date: '2024-02',
    year: 2024,
    title: 'Hack the Future, Greenwood',
    description: 'Co-hosted with SeedAI and the White House Science and Technology Policy, featuring use-case challenges across six focus areas including entrepreneurship, community and economic development, spirituality and religion, social and criminal justice, creative expression, and education.',
    category: 'Events',
    tags: ['Hackathon', 'Greenwood', 'Community'],
    image: '/placeholder.svg',
  },
  {
    id: 'cyber-director-visit-2024',
    date: '2024-06',
    year: 2024,
    title: 'Hosted White House National Cyber Director',
    description: 'BTS hosted the White House National Cyber Director during Juneteenth to discuss cybersecurity and community-centered innovation.',
    category: 'Policy',
    tags: ['Juneteenth', 'Cybersecurity', 'National'],
    image: '/placeholder.svg',
  },
  {
    id: 'tech-hubs-2024',
    date: '2024-01',
    year: 2024,
    title: 'Tech Hubs Designation and Federal Funding',
    description: 'Served on the steering committee that won both the federal tech hubs designation and a 51 million dollar grant, as one of only two cities awarded both.',
    category: 'Infrastructure',
    tags: ['Tech Hubs', 'Federal', 'Funding'],
    image: '/placeholder.svg',
  },
  {
    id: 'gace-aspire-2025',
    date: '2025-01',
    year: 2025,
    title: 'G-ACE and ASPIRE, Scaling Society-Based AI',
    description: 'Greenwood AI Center of Excellence (G-ACE) became the national model for AI integration, governance, and adaptation at scale, powered by ASPIRE\'s Education, Innovation with Community, and Research pillars.',
    category: 'Infrastructure',
    tags: ['G-ACE', 'ASPIRE', 'Tulsa', 'AI Governance'],
    image: '/placeholder.svg',
    longDescription: `**Federal Recognition and Funding**
- $51M Federal Tech Hub designation
- $10.6M BTS sub-award for G-ACE establishment
- Part of CHIPS and Science Act initiative

**Core Thesis**
The winner of the AI race will be the country that successfully integrates AI across society, not just builds the most powerful models.

**ASPIRE Program Goals**
- 500+ community members engaged

**ASPIRE Education Program**
- 2 to 4 marquee events per year
- 4 to 8+ educational events per year
- 25 to 50 individuals AI fluent or certified per quarter by Year 3

**Microsoft Co-Innovation Lab**
- 40+ lab engagements per year
- Multiple pilot cohorts
- High utilization of GPU access and AI development environments

**ASPIRE Pillars**
- **E**: Education and AI Fluency
- **I**: Innovation with Community
- **R**: Research and Societal Strategy (MIT, NYU, OU, TU)`,
  },
  {
    id: 'nvidia-partnership-2025',
    date: '2025-09-03',
    year: 2025,
    title: 'NVIDIA Partnership Announcement',
    description: 'Black Tech Street and NVIDIA announce a groundbreaking partnership to train up to 10,000 learners in AI, expand advanced compute access, support grants, open doors to NVIDIA Inception, and host hackathons and innovation challenges in the Greenwood District.',
    category: 'Partnerships',
    tags: ['NVIDIA', 'GPUs', 'Inception', 'Education', 'Greenwood'],
    image: '/images/gallery/nvidia-sept3-01.jpg',
    isFeatured: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=Xks2RYWa6Gg&t=30s',
    mediaLinks: [
      {
        title: 'Black Tech Street Collaborates with NVIDIA to Launch AI Partnership',
        source: 'Yahoo Finance',
        url: 'https://finance.yahoo.com/news/black-tech-street-collaborates-nvidia-180000254.html',
      },
      {
        title: 'Black Tech Street and NVIDIA Launch AI Partnership Focused on Tulsa\'s Greenwood District',
        source: 'FOX23',
        url: 'https://www.fox23.com/news/black-tech-street-and-nvidia-launch-ai-partnership-focused-on-tulsas-greenwood-district/article_461995ff-0392-477a-9ad0-8b7e17308674.html',
      },
      {
        title: 'Black Tech Street, NVIDIA Partnership to Bring AI Training to Greenwood',
        source: 'Tulsa World',
        url: 'https://tulsaworld.com/news/local/business/article_e886152c-e0d9-4732-ad15-99c79c48a617.html',
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
  mission: 'Rebirthing Historic Black Wall Street as a world class innovation economy rooted in AI and Cybersecurity (Emerging Technologies).',
  vision: 'Transforming Greenwood and Tulsa into the model for AI powered societies and economies of the future. Helping the United States win the AI Race and thrive in the AI Age.',
  whatWeDo: `We architect and secure emerging technology focused talent, economic and industry development opportunities for Greenwood and the Greater Tulsa Region.

We create strategies to make 21st century Greenwood a global leader in our defined technology areas, and we partner with companies, organizations, or institutions to create and secure investment, talent, and programming to bring that vision to fruition.`,
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
