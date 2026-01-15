import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  MapPin, 
  Building2, 
  Users, 
  Utensils, 
  Landmark, 
  BookOpen,
  Calendar,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import btsLogo from "@/assets/black-tech-street-logo.png";
import { VisitMap } from "@/components/microsoft-visit/VisitMap";

// Organization logos
import blackTechStreetLogo from "@/assets/logos/black-tech-street.png";
import gradientLogo from "@/assets/logos/gradient.png";
import tedcLogo from "@/assets/logos/tedc.png";
import griotsLogo from "@/assets/logos/griots.png";
import fixinsLogo from "@/assets/logos/fixins.png";
import tulsaInnovationLabsLogo from "@/assets/logos/tulsa-innovation-labs.png";
import tulsaLibraryLogo from "@/assets/logos/tulsa-library.png";
import tulsaRegionalChamberLogo from "@/assets/logos/tulsa-regional-chamber.png";
import cityOfTulsaLogo from "@/assets/logos/city-of-tulsa.png";

interface ScheduleItem {
  time: string;
  session: string;
  location: string;
  address: string;
  details: string;
  icon: React.ReactNode;
  type: 'meeting' | 'tour' | 'meal' | 'briefing';
  coordinates: [number, number];
}

interface Organization {
  name: string;
  description: string;
  logo: string;
  website: string;
}

const schedule: ScheduleItem[] = [
  {
    time: "8:00 – 8:45 AM",
    session: "Welcome & Black Tech Street Team",
    location: "TEDC Creative Capital",
    address: "125 W 3rd St, Tulsa, OK 74103",
    details: "Overview of Black Tech Street mission, programs, and strategic vision.",
    icon: <Building2 className="h-5 w-5" />,
    type: 'meeting',
    coordinates: [36.1540, -95.9934]
  },
  {
    time: "9:00 – 9:45 AM",
    session: "Mayor's Welcome & City Perspective",
    location: "City Hall",
    address: "175 E 2nd St S, Tulsa, OK 74103",
    details: "Opening remarks and discussion with Mayor Nichols on Tulsa's innovation and economic priorities.",
    icon: <Landmark className="h-5 w-5" />,
    type: 'meeting',
    coordinates: [36.1534, -95.9891]
  },
  {
    time: "10:00 – 11:00 AM",
    session: "Tulsa Higher Education Consortium Briefing",
    location: "Gradient",
    address: "12 N Cheyenne Ave, Tulsa, OK 74103",
    details: "Overview of regional higher education collaboration, talent pipelines, and potential Lab Synergies.",
    icon: <BookOpen className="h-5 w-5" />,
    type: 'briefing',
    coordinates: [36.1556, -95.9944]
  },
  {
    time: "11:05 AM – 12:05 PM",
    session: "Meet the Gradient Team",
    location: "Gradient",
    address: "12 N Cheyenne Ave, Tulsa, OK 74103",
    details: "Focused discussion on the vast network of startups housed and role as funnel for startup based Lab engagements.",
    icon: <Users className="h-5 w-5" />,
    type: 'meeting',
    coordinates: [36.1556, -95.9944]
  },
  {
    time: "12:10 – 1:15 PM",
    session: "Lunch",
    location: "Fixins Soul Kitchen",
    address: "222 N Detroit Ave, Tulsa, OK 74120",
    details: "Authentic Southern comfort food in Tulsa's historic Greenwood District.",
    icon: <Utensils className="h-5 w-5" />,
    type: 'meal',
    coordinates: [36.1582, -95.9912]
  },
  {
    time: "1:30 – 2:30 PM",
    session: "Tulsa Regional Chamber Briefing",
    location: "Tulsa Regional Chamber of Commerce",
    address: "1 W 3rd St, Tulsa, OK 74103",
    details: "Regional economic development strategy and business ecosystem overview. Emphasis on role as a channel partner for corporate Lab engagements.",
    icon: <Building2 className="h-5 w-5" />,
    type: 'briefing',
    coordinates: [36.1543, -95.9920]
  },
  {
    time: "2:45 – 3:45 PM",
    session: "Greenwood District Tour",
    location: "Liquid Lounge",
    address: "10 N Greenwood Ave Suite 101, Tulsa, OK 74120",
    details: "Historical and future-facing tour of Greenwood, critical importance of the project and significance of GEM.",
    icon: <MapPin className="h-5 w-5" />,
    type: 'tour',
    coordinates: [36.1568, -95.9863]
  },
  {
    time: "4:00 – 5:00 PM",
    session: "Community Roundtable",
    location: "Rudisill Library",
    address: "1520 N Hartford Ave, Tulsa, OK 74106",
    details: "Discussion with the Elders of Greenwood, dignitaries and local leaders who care deeply about GEM and feel a great sense of significance in the project.",
    icon: <Users className="h-5 w-5" />,
    type: 'meeting',
    coordinates: [36.1742, -95.9876]
  },
  {
    time: "5:15 – 6:15 PM",
    session: "GEM Building Tour",
    location: "GEM Building",
    address: "660 E. Pine St. Tulsa, OK 74106",
    details: "Tour of the GEM Building - the historic Moton Hospital transformed into a modern hub for Black-owned businesses and tech-enabled startups.",
    icon: <Building2 className="h-5 w-5" />,
    type: 'tour',
    coordinates: [36.1648, -95.9802]
  }
];

const organizations: Organization[] = [
  {
    name: "Black Tech Street",
    description: "Rebirthing Black Wall Street as the nation's premiere innovative economy with focus on responsible AI, cybersecurity and emerging technologies.",
    logo: blackTechStreetLogo,
    website: "https://blacktechstreet.com"
  },
  {
    name: "Gradient",
    description: "Tulsa's premier innovation hub serving as a central basecamp for entrepreneurs, startups, and remote workers.",
    logo: gradientLogo,
    website: "https://joingradient.com"
  },
  {
    name: "City of Tulsa",
    description: "Municipal government committed to driving innovation and economic development across the Tulsa region.",
    logo: cityOfTulsaLogo,
    website: "https://www.cityoftulsa.org"
  },
  {
    name: "Greenwood Griot Tours",
    description: "Storytelling collective preserving Black Wall Street's legacy through guided experiences and immersive tours.",
    logo: griotsLogo,
    website: "https://www.greenwoodgriot.com"
  },
  {
    name: "Tulsa Innovation Labs",
    description: "Nationally designated Tech Hub redefining innovation economy in America's heartland.",
    logo: tulsaInnovationLabsLogo,
    website: "https://tulsainnovationlabs.com"
  },
  {
    name: "Tulsa Regional Chamber",
    description: "Primary driver of regional prosperity representing 2,150+ organizations and 178,000+ workers.",
    logo: tulsaRegionalChamberLogo,
    website: "https://tulsachamber.com"
  },
  {
    name: "TEDC",
    description: "Certified CDFI providing lending and educational services to small businesses and entrepreneurs.",
    logo: tedcLogo,
    website: "https://tedcorp.org"
  },
  {
    name: "Rudisill Library",
    description: "Community hub and historical anchor for North Tulsa with new expanded facility opening in Greenwood.",
    logo: tulsaLibraryLogo,
    website: "https://www.tulsalibrary.org/locations/rudisill-regional-library"
  },
  {
    name: "Fixins Soul Kitchen",
    description: "Full-service restaurant combining authentic Southern comfort food with modern atmosphere.",
    logo: fixinsLogo,
    website: "https://fixinssoulkitchen.com"
  }
];

const typeStyles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  meeting: { bg: "bg-blue-500/5", border: "border-l-blue-500", text: "text-blue-500", dot: "bg-blue-500" },
  tour: { bg: "bg-emerald-500/5", border: "border-l-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500" },
  meal: { bg: "bg-orange-500/5", border: "border-l-orange-500", text: "text-orange-500", dot: "bg-orange-500" },
  briefing: { bg: "bg-purple-500/5", border: "border-l-purple-500", text: "text-purple-500", dot: "bg-purple-500" }
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
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

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  }
};

const scheduleItemVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
};

export default function MicrosoftVisit() {
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  useEffect(() => {
    document.title = "Microsoft AI & Security Team Visit | Black Tech Street - Tulsa Innovation Tour";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Join Microsoft's AI & Security Team for a curated day exploring Tulsa's thriving tech ecosystem. Tour historic Greenwood, meet local innovators, and discover cutting-edge innovation hubs. January 16, 2026.");
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", "Microsoft AI & Security Team Visit | Black Tech Street");
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", "A curated day exploring Tulsa's thriving tech ecosystem, from historic Greenwood to cutting-edge innovation hubs. January 16, 2026.");
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      const newOgUrl = document.createElement('meta');
      newOgUrl.setAttribute('property', 'og:url');
      newOgUrl.setAttribute('content', 'https://blacktechstreet.app/microsoftvisit');
      document.head.appendChild(newOgUrl);
    }
    
    return () => {
      document.title = "ASPIRE Workshop Analytics | Feedback Dashboard";
      if (metaDescription) {
        metaDescription.setAttribute("content", "Interactive analytics dashboard for ASPIRE Workshop feedback surveys. View NPS scores, mindset transformations, and participant insights.");
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#0078D4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.img 
              src={btsLogo} 
              alt="Black Tech Street" 
              className="h-10 w-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  Friday, January 16, 2026
                </Badge>
              </motion.div>
              <ThemeToggle />
            </div>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6"
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
              Microsoft AI & Security Team Visit
            </span>
          </motion.h1>

          {/* Animated line */}
          <motion.div 
            className="mt-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent max-w-md mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* Interactive Map */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2 
            className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <MapPin className="h-6 w-6 text-primary" />
            </motion.div>
            Tour Route
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <VisitMap />
          </motion.div>
          <motion.p 
            className="text-sm text-muted-foreground mt-4 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Click markers for location details • Dashed line shows tour route
          </motion.p>
        </motion.section>

        {/* Schedule Section */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="h-6 w-6 text-primary" />
            </motion.div>
            Day Schedule
          </motion.h2>
          
          <div className="relative">
            {/* Animated Timeline line */}
            <motion.div 
              className="absolute left-[140px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{ originY: 0 }}
            />
            
            <motion.div 
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {schedule.map((item, index) => {
                const styles = typeStyles[item.type];
                return (
                  <motion.div 
                    key={index}
                    variants={scheduleItemVariant}
                    whileHover={{ 
                      x: 4, 
                      transition: { type: "spring", stiffness: 300 } 
                    }}
                    className={`relative flex flex-col md:flex-row gap-4 p-5 rounded-xl ${styles.bg} border-l-4 ${styles.border} hover:shadow-lg transition-shadow cursor-default backdrop-blur-sm`}
                  >
                    {/* Time badge */}
                    <div className="md:w-32 flex-shrink-0">
                      <motion.div 
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border shadow-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div 
                          className={`w-2 h-2 rounded-full ${styles.dot}`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                          {item.time.split('–')[0].trim()}
                        </span>
                      </motion.div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <motion.div 
                            className={`p-1.5 rounded-lg ${styles.text} bg-background border border-border`}
                            whileHover={{ rotate: 10 }}
                          >
                            {item.icon}
                          </motion.div>
                          <h3 className="font-semibold text-foreground">{item.session}</h3>
                        </div>
                        <Badge variant="outline" className={`${styles.text} border-current/20 text-xs hidden sm:inline-flex`}>
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.details}</p>
                      <motion.a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.coordinates[0]},${item.coordinates[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group/link"
                        whileHover={{ x: 2 }}
                      >
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium group-hover/link:underline">{item.location}</span>
                        <span className="hidden sm:inline group-hover/link:underline">• {item.address}</span>
                      </motion.a>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Separator className="my-16" />
        </motion.div>

        {/* Featured Organizations */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Building2 className="h-6 w-6 text-primary" />
            </motion.div>
            Featured Organizations
          </motion.h2>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {organizations.map((org, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div variants={cardHover}>
                  <Card className="group overflow-hidden border border-border bg-card/80 backdrop-blur-sm flex flex-col h-full hover:shadow-xl transition-shadow">
                    <motion.div 
                      className="h-24 bg-black flex items-center justify-center p-4 overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.img 
                        src={org.logo} 
                        alt={org.name} 
                        className="h-full w-auto max-w-full object-contain"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                      />
                    </motion.div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base group-hover:text-primary transition-colors duration-300">
                        {org.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <CardDescription className="text-sm leading-relaxed flex-1">
                        {org.description}
                      </CardDescription>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4 w-full gap-2 group/btn"
                          asChild
                        >
                          <a href={org.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                            Visit Website
                          </a>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="mt-20 text-center text-sm text-muted-foreground border-t border-border pt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p 
            className="mb-2"
            whileHover={{ scale: 1.02 }}
          >
            Microsoft AI & Security Team Visit • January 16, 2026
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Hosted by <span className="text-primary font-medium">Black Tech Street</span>
          </motion.p>
        </motion.footer>
      </main>
    </div>
  );
}
