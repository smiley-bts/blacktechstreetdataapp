import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Users, 
  Building2, 
  Lightbulb, 
  Shield, 
  Target,
  AlertTriangle,
  Rocket,
  FileText,
  BookOpen,
  Landmark,
  GraduationCap,
  Heart
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import btsBLogo from "@/assets/logos/bts-b-logo.png";

interface TranscriptFile {
  name: string;
  filename: string;
  icon: React.ReactNode;
  description: string;
}

interface MeetingInsight {
  title: string;
  icon: React.ReactNode;
  focus: string;
  themes: string[];
  insights: string[];
  signal: string;
}

const transcripts: TranscriptFile[] = [
  {
    name: "Moton Community Meeting",
    filename: "moton-community-transcript.txt",
    icon: <Heart className="h-5 w-5" />,
    description: "Community roundtable with Greenwood elders and local leaders"
  },
  {
    name: "Tulsa Chamber Meeting",
    filename: "tulsa-chamber-transcript.txt",
    icon: <Building2 className="h-5 w-5" />,
    description: "Economic development discussion with Tulsa Regional Chamber"
  },
  {
    name: "Higher Education Consortium",
    filename: "higher-ed-consortium-transcript.txt",
    icon: <GraduationCap className="h-5 w-5" />,
    description: "Briefing with Tulsa Higher Education Consortium partners"
  },
  {
    name: "Gradient Team Meeting",
    filename: "gradient-team-transcript.txt",
    icon: <Rocket className="h-5 w-5" />,
    description: "Discussion with Gradient startup ecosystem team"
  }
];

const meetingInsights: MeetingInsight[] = [
  {
    title: "Moton Community Meeting",
    icon: <Heart className="h-6 w-6 text-rose-500" />,
    focus: "Community trust, ethics, history, and responsible deployment",
    themes: [
      "AI addiction, over-reliance, and loss of human creativity",
      "Safeguards, boundaries, and age-appropriate constraints",
      "Data privacy and community protection",
      "Deep respect for the Moton building's legacy and Greenwood history"
    ],
    insights: [
      "Community members explicitly compared AI to gambling or other addictive systems",
      "Strong support for \"guardrails + curiosity\" framing",
      "Clear expectation that AI must serve people, not replace judgment",
      "The Moton building was repeatedly framed as sacred ground for future-shaping work"
    ],
    signal: "Community buy-in hinges on visible responsibility, not just technical capability. Ethical framing is not optional here."
  },
  {
    title: "Tulsa Chamber Meeting",
    icon: <Building2 className="h-6 w-6 text-blue-500" />,
    focus: "Economic development, corporate engagement, alignment",
    themes: [
      "Chamber as the \"highway\" to corporate Tulsa",
      "BTS as the innovation and AI anchor",
      "Gradient as the startup pipeline",
      "Desire for ecosystem coordination and shared storytelling"
    ],
    insights: [
      "Chamber prioritizes recruiting and expanding established companies",
      "Strong interest in AI as a competitive differentiator for Tulsa",
      "Clear openness to structured, ongoing partnership with BTS and Microsoft",
      "Emphasis on talent pipelines and engagement, not one-off initiatives"
    ],
    signal: "There is real opportunity to formalize the Chamber as a distribution and amplification partner for enterprise-level AI pilots and adoption narratives."
  },
  {
    title: "Tulsa Higher Education Consortium",
    icon: <GraduationCap className="h-6 w-6 text-purple-500" />,
    focus: "Research, talent, internships, long-term pipeline",
    themes: [
      "Translating research into applied systems",
      "Student access to real AI infrastructure",
      "Internships, fellowships, and early exposure",
      "Aligning academic timelines with industry needs"
    ],
    insights: [
      "Microsoft researchers emphasized operationalizing models, not just studying them",
      "Interest in shared labs and early startup exposure for students",
      "Universities seen as force multipliers if aligned early"
    ],
    signal: "This group is primed for formal research-to-application pathways, especially tied to ASPIRE and lab pilots."
  },
  {
    title: "Gradient Team Meeting",
    icon: <Rocket className="h-6 w-6 text-emerald-500" />,
    focus: "Startups, market access, early validation",
    themes: [
      "Startups need earlier access to product teams and markets",
      "Labs can act as a bridge from idea to deployment",
      "Microsoft interest in engaging founders earlier in lifecycle",
      "Gradient positioned as an anchor for startup flow"
    ],
    insights: [
      "Microsoft wants startups \"close early\" to product and security teams",
      "Emphasis on incentives, access, and distribution",
      "Strong alignment with the lab as a scaling asset"
    ],
    signal: "The lab can become a preferred on-ramp for startups into Microsoft ecosystems if structured intentionally."
  }
];

const crossCuttingThemes = [
  {
    title: "Responsible AI Is the Entry Ticket",
    description: "Ethics, guardrails, privacy, and human judgment were raised in every room, not just community spaces.",
    icon: <Shield className="h-5 w-5" />
  },
  {
    title: "Ecosystem Over Silos",
    description: "Everyone emphasized alignment, coordination, and shared pipelines over fragmented efforts.",
    icon: <Users className="h-5 w-5" />
  },
  {
    title: "Tulsa as a National Model",
    description: "Repeated framing of Tulsa as a testbed for democratic, community-rooted AI integration.",
    icon: <Target className="h-5 w-5" />
  },
  {
    title: "From Education to Application",
    description: "Training matters, but real pilots, real tools, and real outcomes are what build credibility.",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    title: "Trust Is Historical, Not Abstract",
    description: "Especially at Moton, history and legacy are active factors in how technology is received.",
    icon: <Landmark className="h-5 w-5" />
  }
];

const risks = [
  "Risk of AI being perceived as extractive if community benefits are not visible",
  "Risk of duplication across institutions without clear coordination",
  "Risk of over-indexing on hype instead of deployable outcomes",
  "Need for clear ownership and follow-through structures"
];

const opportunities = [
  "Formalize a Microsoft x BTS x Chamber coordination loop",
  "Position ASPIRE as the ethical and fluency layer for all pilots",
  "Create a visible community guardrails framework tied to the lab",
  "Build a startup fast-track from Gradient into Microsoft engagement",
  "Establish higher-ed research pilots with real deployment targets"
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export default function MicrosoftVisitRecap() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.title = "Microsoft Visit Recap | Black Tech Street - Insights & Transcripts";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Recap and insights from Microsoft's AI & Security Team visit to Tulsa. Download meeting transcripts and explore key themes from community, business, and academic stakeholder discussions.");
    }

    return () => {
      document.title = "ASPIRE Workshop Analytics | Feedback Dashboard";
      if (metaDescription) {
        metaDescription.setAttribute("content", "Interactive analytics dashboard for ASPIRE Workshop feedback surveys.");
      }
    };
  }, []);

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/transcripts/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-100 overflow-x-hidden">
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Banner */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90 z-10" />
        <div 
          className="h-[300px] md:h-[400px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/tulsa-skyline-banner.png)' }}
        />
        
        <motion.div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            className="flex items-center gap-4 md:gap-6 mb-4"
            variants={fadeInUp}
          >
            <motion.img 
              src={btsBLogo} 
              alt="Black Tech Street" 
              className="h-16 md:h-24 lg:h-28 w-auto drop-shadow-2xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            />
            <div className="h-12 md:h-20 lg:h-24 w-px bg-white/60" />
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-2xl text-left">
              Microsoft Visit Recap
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-4"
          >
            <Badge className="bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 text-sm md:text-base px-4 py-1.5">
              <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Insights & Transcripts
            </Badge>
          </motion.div>
          
          <motion.div 
            className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-48 md:w-80 lg:w-96 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 relative">
        
        {/* Executive Summary */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            Executive Summary
          </h2>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                Across all meetings, the Microsoft visit reinforced a shared alignment around <strong>responsible AI</strong>, <strong>ecosystem building</strong>, and <strong>Tulsa as a national testbed</strong> for applied AI and cybersecurity. Stakeholders consistently framed Black Tech Street, ASPIRE, and the Greenwood AI Center of Excellence as connective tissue between community, startups, institutions, and enterprise.
              </p>
              
              <Separator className="my-6" />
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Microsoft Interest</Badge>
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Early access to startups
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Community-embedded pilots
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Responsible AI guardrails
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Talent and internship pipelines
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Translating research into deployable solutions
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Local Partner Priorities</Badge>
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Coordination, not duplication
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Trust, transparency, and historical responsibility
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      Long-term economic and social outcomes over hype
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Downloadable Transcripts */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Download className="h-6 w-6 text-emerald-600" />
            Meeting Transcripts
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {transcripts.map((transcript, index) => (
              <motion.div
                key={transcript.filename}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-emerald-300">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-emerald-600">{transcript.icon}</span>
                          <h3 className="font-semibold text-gray-900">{transcript.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{transcript.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleDownload(transcript.filename)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Meeting Breakdown */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Meeting-by-Meeting Breakdown
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {meetingInsights.map((meeting, index) => (
              <AccordionItem 
                key={index} 
                value={`meeting-${index}`}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    {meeting.icon}
                    <span className="font-semibold text-gray-900">{meeting.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    <div>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 mb-2">Focus</Badge>
                      <p className="text-gray-600">{meeting.focus}</p>
                    </div>
                    
                    <div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-2">Key Themes</Badge>
                      <ul className="space-y-1 text-gray-600">
                        {meeting.themes.map((theme, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {theme}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mb-2">Notable Insights</Badge>
                      <ul className="space-y-1 text-gray-600">
                        {meeting.insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-800 mb-1 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Strategic Signal
                      </h4>
                      <p className="text-emerald-700 text-sm">{meeting.signal}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* Cross-Cutting Themes */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-emerald-600" />
            Cross-Cutting Themes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crossCuttingThemes.map((theme, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200 h-full hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                      <span className="text-emerald-600">{theme.icon}</span>
                      {theme.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{theme.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Risks & Opportunities */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risks */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Gaps & Risks Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="text-amber-500 mt-1">⚠</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Rocket className="h-5 w-5 text-emerald-500" />
                  Strategic Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="text-emerald-500 mt-1">✓</span>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Back Link */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button 
            variant="outline" 
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => window.location.href = '/microsoftvisit'}
          >
            ← Back to Visit Schedule
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
