import { useEffect } from "react";
import { motion } from "framer-motion";
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
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisitMap } from "@/components/microsoft-visit/VisitMap";

// Organization logos
import blackTechStreetLogo from "@/assets/logos/bts-square-logo.png";
import gradientLogo from "@/assets/logos/gradient.png";
import tedcLogo from "@/assets/logos/tedc.png";
// griotsLogo moved to public folder
import fixinsLogo from "@/assets/logos/fixins.png";
import tulsaInnovationLabsLogo from "@/assets/logos/tulsa-innovation-labs-new.png";
import tulsaLibraryLogo from "@/assets/logos/tulsa-library.png";
import tulsaRegionalChamberLogo from "@/assets/logos/tulsa-regional-chamber.png";
import cityOfTulsaLogo from "@/assets/logos/city-of-tulsa.png";
import btsBLogo from "@/assets/logos/bts-b-logo.png";

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
    location: "Rudisill Regional Library",
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
    description: "Black Tech Street is an organization dedicated to rebirthing Black Wall Street as the nation's premiere innovative economy, with a strategic focus on responsible AI, cybersecurity and emerging technologies.",
    logo: blackTechStreetLogo,
    website: "https://blacktechstreet.com"
  },
  {
    name: "Fixins Soul Kitchen",
    description: "Fixins Soul Kitchen is a full-service restaurant in downtown Tulsa's historic Greenwood District that combines authentic Southern comfort food with a high-energy, modern atmosphere.",
    logo: fixinsLogo,
    website: "https://fixinssoulkitchen.com"
  },
  {
    name: "Gradient",
    description: "Gradient is Tulsa's premier innovation and technology hub, serving as a central \"basecamp\" for entrepreneurs, startups, and remote workers.",
    logo: gradientLogo,
    website: "https://joingradient.com"
  },
  {
    name: "Greenwood Griot Tours",
    description: "Greenwood Griot Tours is a Tulsa-based storytelling collective rooted in the Historic Greenwood District, committed to preserving and sharing the legacy of Black Wall Street through guided experiences, workshops, and immersive tours.",
    logo: "/images/greenwood-griots-logo.png",
    website: "https://www.greenwoodgriot.com"
  },
  {
    name: "Rudisill Regional Library",
    description: "The Rudisill Regional Library is a key branch of the Tulsa City-County Library system that serves as a vital community hub and historical anchor for North Tulsa.",
    logo: tulsaLibraryLogo,
    website: "https://www.tulsalibrary.org/locations/rudisill-regional-library"
  },
  {
    name: "TEDC Creative Capital",
    description: "Tulsa Economic Development Corporation is a non-profit organization and certified Community Development Financial Institution that provides lending and educational services to small businesses and entrepreneurs in the Tulsa region and throughout Oklahoma.",
    logo: tedcLogo,
    website: "https://tedcorp.org"
  },
  {
    name: "Tulsa City Hall",
    description: "Tulsa City Hall serves as the central hub for the City of Tulsa's municipal government, housing the executive and legislative offices that manage the city's infrastructure, public safety, and community services.",
    logo: cityOfTulsaLogo,
    website: "https://www.cityoftulsa.org"
  },
  {
    name: "Tulsa Innovation Labs",
    description: "At Tulsa Innovation Labs, we're redefining what it means to build a thriving innovation economy in America's heartland. As a nationally designated Tech Hub, the Tulsa region boasts high-growth sectors like aerospace and defense, energy and manufacturing.",
    logo: tulsaInnovationLabsLogo,
    website: "https://tulsainnovationlabs.com"
  },
  {
    name: "Tulsa Regional Chamber",
    description: "Representing more than 2,150 member organizations and more than 178,000 workers, the Tulsa Regional Chamber is the primary driver of regional and individual prosperity in northeast Oklahoma.",
    logo: tulsaRegionalChamberLogo,
    website: "https://tulsachamber.com"
  }
];

// Updated type styles with gradients and enhanced visuals
const typeStyles: Record<string, { gradient: string; glow: string; dot: string; headingText: string; bodyText: string; accent: string }> = {
  meeting: { 
    gradient: "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700", 
    glow: "shadow-emerald-500/30",
    dot: "bg-white", 
    headingText: "text-white", 
    bodyText: "text-emerald-50",
    accent: "from-white/30 to-transparent"
  },
  tour: { 
    gradient: "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900", 
    glow: "shadow-gray-800/40",
    dot: "bg-emerald-400", 
    headingText: "text-white", 
    bodyText: "text-gray-200",
    accent: "from-emerald-400/20 to-transparent"
  },
  meal: { 
    gradient: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700", 
    glow: "shadow-emerald-600/30",
    dot: "bg-white", 
    headingText: "text-white", 
    bodyText: "text-emerald-50",
    accent: "from-white/25 to-transparent"
  },
  briefing: { 
    gradient: "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700", 
    glow: "shadow-slate-600/30",
    dot: "bg-emerald-300", 
    headingText: "text-white", 
    bodyText: "text-slate-100",
    accent: "from-emerald-300/20 to-transparent"
  }
};

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
  // Removed unused scroll hooks since header is now part of the banner

  useEffect(() => {
    // Force light mode for this page
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    document.title = "Microsoft AI & Security Team Visit | Black Tech Street - Tulsa Innovation Tour";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Join Microsoft's AI & Security Team for a curated day exploring Tulsa's thriving tech ecosystem hosted by Black Tech Street. Tour historic Greenwood, meet local innovators, and discover cutting-edge innovation hubs. January 16, 2026.");
    }
    
    // Update or create OG tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateMeta('og:title', 'Microsoft AI & Security Team Visit | Black Tech Street - Tulsa');
    updateOrCreateMeta('og:description', 'A curated day exploring Tulsa\'s thriving tech ecosystem, from historic Greenwood to cutting-edge innovation hubs. Hosted by Black Tech Street. January 16, 2026.');
    updateOrCreateMeta('og:url', 'https://blacktechstreetdataapp.lovable.app/microsoftvisit');
    updateOrCreateMeta('og:image', 'https://blacktechstreetdataapp.lovable.app/images/microsoft-visit-og.jpg');
    updateOrCreateMeta('og:type', 'website');
    
    // Twitter card tags
    const updateOrCreateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateTwitterMeta('twitter:card', 'summary_large_image');
    updateOrCreateTwitterMeta('twitter:title', 'Microsoft AI & Security Team Visit | Black Tech Street');
    updateOrCreateTwitterMeta('twitter:description', 'A curated day exploring Tulsa\'s thriving tech ecosystem. January 16, 2026.');
    updateOrCreateTwitterMeta('twitter:image', 'https://blacktechstreetdataapp.lovable.app/images/microsoft-visit-og.jpg');
    
    return () => {
      document.title = "ASPIRE Workshop Analytics | Feedback Dashboard";
      if (metaDescription) {
        metaDescription.setAttribute("content", "Interactive analytics dashboard for ASPIRE Workshop feedback surveys. View NPS scores, mindset transformations, and participant insights.");
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 overflow-x-hidden">
      {/* Subtle Background Texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Banner with City Image */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90 z-10" />
        <div 
          className="h-[400px] md:h-[500px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/tulsa-skyline-banner.png)' }}
        />
        
        {/* Hero Content */}
        <motion.div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Logo + Title Row */}
          <motion.div 
            className="flex items-center gap-4 md:gap-6 mb-4"
            variants={fadeInUp}
          >
            {/* B Logo */}
            <motion.img 
              src={btsBLogo} 
              alt="Black Tech Street" 
              className="h-16 md:h-24 lg:h-28 w-auto drop-shadow-2xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15,
                delay: 0.2 
              }}
            />
            
            {/* Vertical Separator */}
            <div className="h-12 md:h-20 lg:h-24 w-px bg-white/60" />
            
            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white drop-shadow-2xl text-left">
              Microsoft AI & Security Team Visit
            </h1>
          </motion.div>
          
          {/* Date Badge - Below H1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-4"
          >
            <Badge className="bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 text-sm md:text-base px-4 py-1.5">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Friday, January 16, 2026
            </Badge>
          </motion.div>
          
          {/* Animated line */}
          <motion.div 
            className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-48 md:w-80 lg:w-96 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 relative">

        {/* Interactive Map */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <MapPin className="h-6 w-6 text-emerald-600" />
            </motion.div>
            Tour Route
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl overflow-hidden shadow-xl border border-gray-200"
          >
            <VisitMap />
          </motion.div>
          <motion.p 
            className="text-sm text-gray-500 mt-4 text-center"
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
            className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="h-6 w-6 text-emerald-600" />
            </motion.div>
            Schedule
          </motion.h2>
          
          <div className="relative">
            {/* Animated Timeline line */}
            <motion.div 
              className="absolute left-[140px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-300 to-transparent hidden md:block"
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
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 } 
                    }}
                    className={`relative flex flex-col md:flex-row gap-4 p-5 rounded-2xl ${styles.gradient} hover:shadow-2xl transition-all cursor-default shadow-xl ${styles.glow} overflow-hidden group`}
                  >
                    {/* Dark overlay for better text contrast */}
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    {/* Decorative accent overlay */}
                    <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${styles.accent} pointer-events-none`} />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                    
                    {/* Time badge */}
                    <div className="md:w-40 flex-shrink-0 relative z-10">
                      <motion.div 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div 
                          className={`w-2.5 h-2.5 rounded-full ${styles.dot} shadow-lg`}
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xs font-bold text-white whitespace-nowrap tracking-wide drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          {item.time}
                        </span>
                      </motion.div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="p-2 rounded-xl bg-black/25 backdrop-blur-sm text-white shadow-lg border border-white/20"
                            whileHover={{ rotate: 10, scale: 1.1 }}
                          >
                            {item.icon}
                          </motion.div>
                          <h3 className="font-bold text-lg text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>{item.session}</h3>
                        </div>
                        <Badge className="bg-black/30 text-white border-white/30 text-xs hidden sm:inline-flex hover:bg-black/40 backdrop-blur-sm font-semibold uppercase tracking-wider shadow-sm">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/95 mb-4 leading-relaxed font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{item.details}</p>
                      <motion.a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.coordinates[0]},${item.coordinates[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs transition-all group/link bg-white hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 shadow-lg hover:shadow-xl"
                        whileHover={{ x: 4, scale: 1.02 }}
                      >
                        <Navigation className="h-3.5 w-3.5 text-gray-700" />
                        <span className="font-semibold group-hover/link:underline">{item.location}</span>
                        <span className="hidden sm:inline opacity-60">•</span>
                        <span className="hidden sm:inline group-hover/link:underline opacity-75">{item.address}</span>
                        <span className="font-bold ml-1 group-hover/link:translate-x-1 transition-transform">→</span>
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
          <Separator className="my-16 bg-gray-200" />
        </motion.div>

        {/* Featured Organizations */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Building2 className="h-6 w-6 text-emerald-600" />
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
                className="h-full"
              >
                <motion.div variants={cardHover} className="h-full">
                  <Card className="group overflow-hidden border border-gray-200 bg-white flex flex-col h-full hover:shadow-xl transition-shadow">
                    <motion.div 
                      className="aspect-square flex items-center justify-center p-6 overflow-hidden bg-black"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.img 
                        src={org.logo} 
                        alt={org.name} 
                        className="w-full h-full object-contain"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                      />
                    </motion.div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                        {org.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <CardDescription className="text-sm leading-relaxed flex-1 text-gray-600">
                        {org.description}
                      </CardDescription>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          size="sm" 
                          className="mt-4 w-full gap-2 group/btn bg-emerald-500 hover:bg-emerald-600 text-white"
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
          className="mt-20 text-center text-sm text-gray-500 border-t border-gray-200 pt-10"
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
            Hosted by <span className="text-emerald-600 font-medium">Black Tech Street</span>
          </motion.p>
        </motion.footer>
      </main>
    </div>
  );
}
