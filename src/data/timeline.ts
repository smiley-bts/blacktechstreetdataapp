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
  galleryEventId?: 'nvidia-sep-2025' | 'aspire-sep-2025' | 'aspire-june-2025' | 'aspire-dec-2025' | 'microsoft-visit';
}

export const timelineItems: TimelineItem[] = [
  {
    id: 'white-house-cyber-2023',
    date: '2023-02',
    year: 2023,
    title: 'White House Cyber Roundtable',
    description: 'Tyrance spoke as a panelist at the White House Office of the National Cyber Director convening.',
    category: 'Policy',
    tags: ['White House', 'Cybersecurity'],
  },
  {
    id: 'microsoft-partnership-2023',
    date: '2023-07',
    year: 2023,
    title: 'Microsoft Partnership Established',
    description: 'BTS established a foundational relationship with Microsoft for long-term AI and cybersecurity collaboration.',
    category: 'Partnerships',
    tags: ['Microsoft', 'Greenwood'],
    galleryEventId: 'microsoft-visit',
  },
  {
    id: 'defcon-seedai-2023',
    date: '2023-08',
    year: 2023,
    title: 'DEF CON 31 SeedAI "Red Team"',
    description: 'Public red team of AI models with 75 participants, partnered with White House Office of Science and Technology Policy.',
    category: 'Research',
    tags: ['DEF CON', 'SeedAI', 'Red Team'],
  },
  {
    id: 'ai-executive-order-2023',
    date: '2023-10',
    year: 2023,
    title: 'AI Executive Order Signing Under the Biden Administration',
    description: 'Biden Administration signs executive order on responsible AI development.',
    category: 'Policy',
    tags: ['Executive Order', 'Biden Administration'],
  },
  {
    id: 'senate-civil-rights-2023',
    date: '2023-12',
    year: 2023,
    title: 'C-SPAN + Senate Testimony',
    description: 'AI & Civil Rights interview; testified before Senate HELP Committee on AI and the future of work.',
    category: 'Policy',
    tags: ['Senate', 'Civil Rights', 'C-SPAN'],
  },
  {
    id: 'hack-the-future-2024',
    date: '2024-02',
    year: 2024,
    title: 'Hack the Future Greenwood',
    description: 'Community-based AI challenge areas across entrepreneurship, economic development, justice, and education.',
    category: 'Events',
    tags: ['Hackathon', 'Community'],
  },
  {
    id: 'cyber-director-visit-2024',
    date: '2024-06',
    year: 2024,
    title: 'White House National Cyber Director Visit',
    description: 'Hosted the White House National Cyber Director during Juneteenth.',
    category: 'Policy',
    tags: ['Juneteenth', 'Cybersecurity'],
  },
  {
    id: 'tech-hubs-2024',
    date: '2024-01',
    year: 2024,
    title: 'Tech Hubs Designation',
    description: 'Steering committee wins federal Tech Hubs designation with $51M grant.',
    category: 'Infrastructure',
    tags: ['Tech Hubs', '$51M'],
  },
  {
    id: 'gace-2024',
    date: '2024-06',
    year: 2024,
    title: 'G-ACE Established',
    description: 'Greenwood AI Center of Excellence established with $10.6M BTS sub-award.',
    category: 'Infrastructure',
    tags: ['G-ACE', '$10.6M'],
    galleryEventId: 'aspire-june-2025',
  },
  {
    id: 'nvidia-partnership-2025',
    date: '2025-09-03',
    year: 2025,
    title: 'NVIDIA Partnership',
    description: 'Partnership launched to scale training, compute access, and innovation in Greenwood.',
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
  {
    id: 'aspire-langston-dec-2025',
    date: '2025-12-06',
    year: 2025,
    title: 'ASPIRE AI Workshop at Langston University',
    description: 'GenAI Fluency & Responsibility Lab hosted at Langston University with 40+ participants earning certificates.',
    category: 'Events',
    tags: ['ASPIRE', 'Langston University', 'AI Workshop'],
    galleryEventId: 'aspire-dec-2025',
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
