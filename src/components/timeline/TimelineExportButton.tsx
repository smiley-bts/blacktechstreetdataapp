import { useState } from 'react';
import { Download, FileText, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timelineItems, aboutContent, microsoftLabSection } from '@/data/timeline';
import { toast } from 'sonner';

const teamMembers = [
  {
    name: "Tyrance Billingsley II",
    title: "Founder & CEO",
    bio: "Tulsa-born entrepreneur, technologist, and ecosystem builder. Under his leadership, Black Tech Street has brokered a citywide alliance with Microsoft to establish 21st-century Greenwood and secured federal Tech Hubs designation with an eight-figure award. Featured in Forbes, Blavity, CNN Business, Black Enterprise. Testified before the U.S. Senate HELP Committee on AI and the Future of Work.",
    linkedIn: "https://www.linkedin.com/in/tyrance-billingsley-ii-ab0683123/"
  },
  {
    name: "Josephine Nelms",
    title: "Chief Operating Officer",
    bio: "15+ years experience in operations, HR, and organizational leadership. Leads operational strategy, partnerships, and organizational systems. Former Director of Operations at Atento Capital; Director of Community Outreach at Girl Scouts of Eastern Oklahoma.",
    linkedIn: "https://www.linkedin.com/in/josephine-nelms-108b87173/"
  },
  {
    name: "Allen Collins",
    title: "Chief of Staff",
    bio: "Tulsa-born, community-centered leader. Oversees program execution, events, and community engagements. Previous roles at City Year Tulsa, Hunger Free Oklahoma, and inTulsa.",
    linkedIn: "https://www.linkedin.com/in/allen-collins/"
  },
  {
    name: "Smiley Elmore III",
    title: "Communications Manager",
    bio: "Leads all organizational communications, marketing, and brand execution. Manages communications for ASPIRE, NVIDIA collaboration, and Microsoft partnerships. Founded Eminent Media digital agency.",
    linkedIn: "https://www.linkedin.com/in/smiley-elmore-iii/"
  }
];

const testimonials = [
  { quote: "I get excited when I'm learning new and interesting things—especially when the experience stretches both my imagination and my intellect. Black Tech Street delivered just that.", author: "Angela A." },
  { quote: "Discovering what AI can do with the simplest of instructions given to it was mind-blowing for me.", author: "India M." },
  { quote: "Confidence, inspiration, and relief. That's how I feel as I'm now able to scale myself and create better outcomes.", author: "Michelle S." },
  { quote: "I learned not only about AI, but also about how I relate to it—and how I can integrate it into my life and work in a thoughtful, ethical way.", author: "Judie W." },
  { quote: "It was so inspiring and enlightening to be able to explore and learn about so many great tools!", author: "Michelle B." },
  { quote: "I feel that blinders have been removed.", author: "Nadette C." },
  { quote: "This experience taught me that there is community and help for people wanting to learn and grow businesses in the ai/tech world.", author: "Solei W." }
];

function generateMarkdown(): string {
  const sortedItems = [...timelineItems].sort((a, b) => a.date.localeCompare(b.date));
  const groupedByYear: Record<number, typeof timelineItems> = {};
  
  sortedItems.forEach(item => {
    if (!groupedByYear[item.year]) groupedByYear[item.year] = [];
    groupedByYear[item.year].push(item);
  });

  let md = `# Black Tech Street Timeline

*Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*

---

## About Black Tech Street

### Origin
Black Tech Street was founded on one question: **"${aboutContent.origin.question}"**

BTS was built on three core realities:
${aboutContent.origin.epiphanies.map(e => `- ${e}`).join('\n')}

### Mission
${aboutContent.mission}

### Vision
${aboutContent.vision}

### What We Do
${aboutContent.whatWeDo}

### Who We Serve
Local government, educational institutions, employers and business networks, entrepreneurs and startups, and community learners.

---

## Leadership Team

${teamMembers.map(member => `### ${member.name} — ${member.title}
${member.bio}
- LinkedIn: ${member.linkedIn}
`).join('\n')}

---

## Timeline Events

`;

  Object.keys(groupedByYear)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(year => {
      md += `### ${year}\n\n`;
      groupedByYear[Number(year)].forEach(item => {
        const month = new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'long' });
        md += `**${month} — ${item.title}**${item.isFeatured ? ' ⭐' : ''}\n`;
        md += `${item.longDescription || item.description}\n`;
        if (item.mediaLinks?.length) {
          md += `\nMedia Coverage:\n`;
          item.mediaLinks.forEach(link => {
            md += `- [${link.title}](${link.url}) — ${link.source}\n`;
          });
        }
        if (item.youtubeUrl) {
          md += `- Video: ${item.youtubeUrl}\n`;
        }
        md += '\n';
      });
    });

  md += `---

## Microsoft Cyber and AI Co-Innovation Lab

**Location:** ${microsoftLabSection.location}

**Features:**
${microsoftLabSection.features.map(f => `- ${f}`).join('\n')}

**Capabilities:**
${microsoftLabSection.capabilities.map(c => `- ${c}`).join('\n')}

---

## Impact Snapshot (June–December 2025)

| Metric | Value |
|--------|-------|
| Cohorts | 3 |
| Unique Participants | 300+ |
| Net Promoter Score | 91 |

---

## Community Voices

${testimonials.map(t => `> "${t.quote}"\n> — **${t.author}**\n`).join('\n')}

---

*© ${new Date().getFullYear()} Black Tech Street. All rights reserved.*
`;

  return md;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function TimelineExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleMarkdownExport = () => {
    setIsExporting(true);
    try {
      const markdown = generateMarkdown();
      const filename = `black-tech-street-timeline-${new Date().toISOString().split('T')[0]}.md`;
      downloadFile(markdown, filename, 'text/markdown');
      toast.success('Markdown file downloaded');
    } catch (error) {
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFExport = () => {
    toast.info('Opening print dialog for PDF export...');
    setTimeout(() => window.print(), 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-card/80 border-border/50 hover:border-primary/50 hover:bg-primary/10"
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleMarkdownExport} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Download Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDFExport} className="gap-2 cursor-pointer">
          <FileDown className="h-4 w-4" />
          Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
