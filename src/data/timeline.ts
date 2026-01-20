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
    description: 'Partnership launched to scale training, compute access, and innovation in Greenwood.',
    longDescription: 'NVIDIA partnered with Black Tech Street to: train up to 10,000 learners in AI through collaborations with universities and community organizations; provide advanced computing resources (NVIDIA GPUs and cloud platforms) to power local AI projects, startups, and applied research; partner on local, state, and federal grant pursuits; expand access to NVIDIA\'s startup ecosystem including the NVIDIA Inception program; and host hackathons, tech fairs, and innovation challenges to ignite grassroots innovation.',
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
    longDescription: 'The ASPIRE (AI Fluency, Innovation & Research Engine) program hosted a GenAI Fluency & Responsibility Lab at Langston University. ASPIRE\'s goals include engaging 500+ community members, hosting 2-4 large marquee events per year and 4-8+ educational events per year, with outcomes of 25-50 individuals AI fluent/certified per quarter by Year 3.',
    category: 'Events',
    tags: ['ASPIRE', 'Langston University', 'AI Workshop'],
    galleryEventId: 'aspire-dec-2025',
  },
  {
    id: 'aspire-lead-dec-2025',
    date: '2025-12-20',
    year: 2025,
    title: 'ASPIRE: Lead',
    description: 'Youth-focused AI leadership program with certificate recipients from the LEAD organization.',
    longDescription: 'ASPIRE: Lead brought together young leaders from the LEAD organization for an intensive AI fluency workshop. Students earned certificates demonstrating their GenAI competencies and understanding of responsible AI practices, preparing the next generation of tech leaders in Greenwood.',
    category: 'Events',
    tags: ['ASPIRE', 'LEAD', 'Youth', 'AI Workshop'],
    galleryEventId: 'aspire-lead-dec-2025',
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
