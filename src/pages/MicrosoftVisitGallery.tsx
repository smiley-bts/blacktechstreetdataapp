import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ZoomIn,
  Code,
  Copy,
  Check
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import btsBLogo from "@/assets/logos/bts-b-logo.png";

interface GalleryImage {
  src: string;
  alt: string;
}

const galleryImages: GalleryImage[] = [
  { src: "/images/gallery/01-chamber-group.png", alt: "Chamber Meeting Group Photo" },
  { src: "/images/gallery/02-memorial-group.png", alt: "1921 Race Massacre Memorial" },
  { src: "/images/gallery/03-memorial-wide.png", alt: "Memorial Wide Shot" },
  { src: "/images/gallery/04-greenwood-walk.png", alt: "Greenwood District Walk" },
  { src: "/images/gallery/05-bodega.png", alt: "Black Wall Street Bodega" },
  { src: "/images/gallery/06-underpass-tour.png", alt: "Greenwood Underpass Tour" },
  { src: "/images/gallery/07-chamber-stairs.png", alt: "Chamber Building Interior" },
  { src: "/images/gallery/08-moton-building.png", alt: "Moton Building Exterior" },
  { src: "/images/gallery/09-moton-group.png", alt: "Moton Building Group Photo" },
  { src: "/images/gallery/10-black-wall-street-mural.png", alt: "Black Wall Street Mural" },
  { src: "/images/gallery/11-chamber-meeting.png", alt: "Chamber Meeting Discussion" },
  { src: "/images/gallery/12-roundtable-discussion.jpg", alt: "Roundtable Discussion" },
  { src: "/images/gallery/13-downtown-walk.jpg", alt: "Downtown Tulsa Walk" },
  { src: "/images/gallery/14-lobby-tour.jpg", alt: "Building Lobby Tour" }
];

const dashboardCode = `import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Building2, Users, Utensils, Landmark, BookOpen, Calendar, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisitMap } from "@/components/VisitMap";

// IMPORTANT: You'll need to upload these logos to src/assets/logos/ in your new project
// For now, using placeholder paths - replace with your actual uploaded images

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
  { time: "8:00 – 8:45 AM", session: "Welcome & Black Tech Street Team", location: "TEDC Creative Capital", address: "125 W 3rd St, Tulsa, OK 74103", details: "Overview of Black Tech Street mission, programs, and strategic vision.", icon: <Building2 className="h-5 w-5" />, type: 'meeting', coordinates: [36.1540, -95.9934] },
  { time: "9:00 – 9:45 AM", session: "Mayor's Welcome & City Perspective", location: "City Hall", address: "175 E 2nd St S, Tulsa, OK 74103", details: "Opening remarks and discussion with Mayor Nichols on Tulsa's innovation and economic priorities.", icon: <Landmark className="h-5 w-5" />, type: 'meeting', coordinates: [36.1534, -95.9891] },
  { time: "10:00 – 11:00 AM", session: "Tulsa Higher Education Consortium Briefing", location: "Gradient", address: "12 N Cheyenne Ave, Tulsa, OK 74103", details: "Overview of regional higher education collaboration, talent pipelines, and potential Lab Synergies.", icon: <BookOpen className="h-5 w-5" />, type: 'briefing', coordinates: [36.1556, -95.9944] },
  { time: "11:05 AM – 12:05 PM", session: "Meet the Gradient Team", location: "Gradient", address: "12 N Cheyenne Ave, Tulsa, OK 74103", details: "Focused discussion on the vast network of startups housed and role as funnel for startup based Lab engagements.", icon: <Users className="h-5 w-5" />, type: 'meeting', coordinates: [36.1556, -95.9944] },
  { time: "12:10 – 1:15 PM", session: "Lunch", location: "Fixins Soul Kitchen", address: "222 N Detroit Ave, Tulsa, OK 74120", details: "Authentic Southern comfort food in Tulsa's historic Greenwood District.", icon: <Utensils className="h-5 w-5" />, type: 'meal', coordinates: [36.1582, -95.9912] },
  { time: "1:30 – 2:30 PM", session: "Tulsa Regional Chamber Briefing", location: "Tulsa Regional Chamber of Commerce", address: "1 W 3rd St, Tulsa, OK 74103", details: "Regional economic development strategy and business ecosystem overview. Emphasis on role as a channel partner for corporate Lab engagements.", icon: <Building2 className="h-5 w-5" />, type: 'briefing', coordinates: [36.1543, -95.9920] },
  { time: "2:45 – 3:45 PM", session: "Greenwood District Tour", location: "Liquid Lounge", address: "10 N Greenwood Ave Suite 101, Tulsa, OK 74120", details: "Historical and future-facing tour of Greenwood, critical importance of the project and significance of GEM.", icon: <MapPin className="h-5 w-5" />, type: 'tour', coordinates: [36.1568, -95.9863] },
  { time: "4:00 – 5:00 PM", session: "Community Roundtable", location: "Rudisill Regional Library", address: "1520 N Hartford Ave, Tulsa, OK 74106", details: "Discussion with the Elders of Greenwood, dignitaries and local leaders who care deeply about GEM and feel a great sense of significance in the project.", icon: <Users className="h-5 w-5" />, type: 'meeting', coordinates: [36.1742, -95.9876] },
  { time: "5:15 – 6:15 PM", session: "Greenwood Entrepreneurship at Moton (GEM) Building Tour with Tulsa Innovation Labs (TIL)", location: "GEM Building", address: "660 E. Pine St. Tulsa, OK 74106", details: "Tour of the GEM Building - the historic Moton Hospital transformed into a modern hub for Black-owned businesses and tech-enabled startups.", icon: <Building2 className="h-5 w-5" />, type: 'tour', coordinates: [36.1648, -95.9802] }
];

const organizations: Organization[] = [
  { name: "Black Tech Street", description: "Black Tech Street is an organization dedicated to rebirthing Black Wall Street as the nation's premiere innovative economy, with a strategic focus on responsible AI, cybersecurity and emerging technologies.", logo: "/placeholder.svg", website: "https://blacktechstreet.com" },
  { name: "Tulsa Innovation Labs", description: "At Tulsa Innovation Labs, we're redefining what it means to build a thriving innovation economy in America's heartland.", logo: "/placeholder.svg", website: "https://tulsainnovationlabs.com" },
  { name: "City Of Tulsa Mayor's Office", description: "Mayor Monroe Nichols IV was sworn in as Tulsa's 41st Mayor on Monday, December 2, 2024.", logo: "/placeholder.svg", website: "https://www.cityoftulsa.org/mayor/" },
  { name: "Fixins Soul Kitchen", description: "Fixins Soul Kitchen is a full-service restaurant in downtown Tulsa's historic Greenwood District.", logo: "/placeholder.svg", website: "https://fixinssoulkitchen.com" },
  { name: "Gradient", description: "Gradient is Tulsa's premier innovation and technology hub.", logo: "/placeholder.svg", website: "https://joingradient.com" },
  { name: "Greenwood Entrepreneurship at Moton (GEM)", description: "GEM is a historic preservation and economic development project in North Tulsa.", logo: "/placeholder.svg", website: "https://www.tedcnet.com/greenwood-entrepreneurship-at-moton-design-approved/" },
  { name: "Greenwood Griot Tours", description: "Greenwood Griot Tours is a Tulsa-based storytelling collective rooted in the Historic Greenwood District.", logo: "/placeholder.svg", website: "https://www.greenwoodgriot.com" },
  { name: "Rudisill Regional Library", description: "The Rudisill Regional Library is a key branch of the Tulsa City-County Library system.", logo: "/placeholder.svg", website: "https://www.tulsalibrary.org/locations/rudisill" },
  { name: "TEDC Creative Capital", description: "Tulsa Economic Development Corporation (TEDC) Creative Capital is a non-profit organization and certified CDFI.", logo: "/placeholder.svg", website: "https://www.tedcnet.com" },
  { name: "Tulsa Higher Education Consortium", description: "The Tulsa Higher Education Consortium is a collaborative effort to meaningfully improve Tulsa-area students' journeys.", logo: "/placeholder.svg", website: "https://tulsahighered.com" },
  { name: "Tulsa Regional Chamber", description: "Representing more than 2,150 member organizations and more than 178,000 workers.", logo: "/placeholder.svg", website: "https://tulsachamber.com" }
];

const typeStyles: Record<string, { gradient: string; glow: string; dot: string; headingText: string; bodyText: string; accent: string }> = {
  meeting: { gradient: "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700", glow: "shadow-emerald-500/30", dot: "bg-white", headingText: "text-white", bodyText: "text-emerald-50", accent: "from-white/30 to-transparent" },
  tour: { gradient: "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900", glow: "shadow-gray-800/40", dot: "bg-emerald-400", headingText: "text-white", bodyText: "text-gray-200", accent: "from-emerald-400/20 to-transparent" },
  meal: { gradient: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700", glow: "shadow-emerald-600/30", dot: "bg-white", headingText: "text-white", bodyText: "text-emerald-50", accent: "from-white/25 to-transparent" },
  briefing: { gradient: "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700", glow: "shadow-slate-600/30", dot: "bg-emerald-300", headingText: "text-white", bodyText: "text-slate-100", accent: "from-emerald-300/20 to-transparent" }
};

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

export default function Index() {
  useEffect(() => {
    document.title = "Microsoft AI & Security Team Visit | Black Tech Street";
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Banner */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90 z-10" />
        <div className="h-[400px] md:h-[500px] bg-cover bg-center bg-no-repeat bg-gray-800" />
        
        <motion.div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl text-center mb-4" variants={fadeInUp}>
            Microsoft AI & Security Team Visit
          </motion.h1>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <Badge className="bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 text-sm md:text-base px-4 py-1.5">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Friday, January 16, 2026
            </Badge>
          </motion.div>
          <motion.div className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-48 md:w-80 lg:w-96 rounded-full mt-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }} />
        </motion.div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 relative">
        {/* Map Section */}
        <motion.section className="mb-16" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <motion.h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-600" /> Tour Route
          </motion.h2>
          <VisitMap />
          <p className="text-sm text-gray-500 mt-4 text-center">Click markers for location details</p>
        </motion.section>

        {/* Schedule Section */}
        <motion.section className="mb-16">
          <motion.h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Clock className="h-6 w-6 text-emerald-600" /> Schedule
          </motion.h2>
          
          <motion.div className="space-y-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {schedule.map((item, index) => {
              const styles = typeStyles[item.type];
              return (
                <motion.div key={index} variants={fadeInUp} className={\`relative flex flex-col md:flex-row gap-4 p-5 rounded-2xl \${styles.gradient} shadow-xl \${styles.glow} overflow-hidden\`}>
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  <div className="md:w-40 flex-shrink-0 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                      <div className={\`w-2.5 h-2.5 rounded-full \${styles.dot}\`} />
                      <span className="text-xs font-bold text-white whitespace-nowrap">{item.time}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-black/25 text-white">{item.icon}</div>
                      <h3 className="font-bold text-lg text-white">{item.session}</h3>
                    </div>
                    <p className="text-sm text-white/95 mb-4">{item.details}</p>
                    <a href={\`https://www.google.com/maps/dir/?api=1&destination=\${item.coordinates[0]},\${item.coordinates[1]}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs bg-white px-4 py-2.5 rounded-xl text-gray-800">
                      <Navigation className="h-3.5 w-3.5" />
                      <span className="font-semibold">{item.location}</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        <Separator className="my-16 bg-gray-200" />

        {/* Organizations */}
        <motion.section>
          <motion.h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600" /> Featured Organizations
          </motion.h2>
          
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {organizations.map((org, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="group overflow-hidden border border-gray-200 bg-white h-full hover:shadow-xl transition-shadow">
                  <div className="aspect-square flex items-center justify-center p-6 bg-black">
                    <img src={org.logo} alt={org.name} className="w-full h-full object-contain" />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-gray-900">{org.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{org.description}</CardDescription>
                    <Button size="sm" className="mt-4 w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
                      <a href={org.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" /> Visit Website
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <footer className="mt-20 text-center text-sm text-gray-500 border-t border-gray-200 pt-10">
          <p>Microsoft AI & Security Team Visit • January 16, 2026</p>
          <p>Hosted by <span className="text-emerald-600 font-medium">Black Tech Street</span></p>
        </footer>
      </main>
    </div>
  );
}`;

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

export default function MicrosoftVisitGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.title = "Microsoft Visit Gallery | Black Tech Street";
  }, []);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
    }
  };
  
  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  const handleDownload = useCallback(async (imageSrc: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageSrc.split('/').pop() || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(dashboardCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const getGridClass = (index: number) => {
    const pattern = index % 8;
    if (pattern === 0 || pattern === 5) return "col-span-2 row-span-2";
    if (pattern === 3) return "col-span-2";
    return "col-span-1";
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
          className="h-[250px] md:h-[300px] bg-cover bg-center bg-no-repeat"
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
              className="h-12 md:h-20 lg:h-24 w-auto drop-shadow-2xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            />
            <div className="h-10 md:h-16 lg:h-20 w-px bg-white/60" />
            <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-display font-bold text-white drop-shadow-2xl text-left">
              Photo Gallery & Resources
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Badge className="bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 text-sm px-4 py-1.5">
              <Camera className="h-3.5 w-3.5 mr-2" />
              Microsoft Visit • January 16, 2026
            </Badge>
          </motion.div>
        </motion.div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 relative">
        
        {/* Photo Gallery */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Camera className="h-8 w-8 text-emerald-600" />
              </motion.div>
              <span className="bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                Photo Gallery
              </span>
            </h2>
            <motion.div 
              className="text-sm text-gray-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {galleryImages.length} photos
            </motion.div>
          </div>
          
          {/* Masonry Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[150px] md:auto-rows-[180px]">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                className={`relative overflow-hidden rounded-xl cursor-pointer group ${getGridClass(index)}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.05, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => openLightbox(index)}
                whileHover={{ scale: 1.02, zIndex: 10 }}
              >
                {!imageLoaded[index] && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                )}
                
                <motion.img 
                  src={image.src} 
                  alt={image.alt}
                  onLoad={() => handleImageLoad(index)}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded[index] ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    filter: hoveredIndex !== null && hoveredIndex !== index ? 'brightness(0.7) saturate(0.8)' : 'brightness(1) saturate(1)'
                  }}
                />
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
                      >
                        <ZoomIn className="h-6 w-6 text-white" />
                      </motion.div>
                      
                      <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={(e) => handleDownload(image.src, e)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Dashboard Code Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Card className="bg-gray-900 border-gray-800 shadow-2xl">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3">
                  <Code className="h-6 w-6 text-emerald-500" />
                  Dashboard Code
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Use this code to create a standalone Microsoft Visit itinerary page.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <pre className="p-6 text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto">
                  <code>{dashboardCode}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 border-t border-gray-200 pt-10">
          <p>Microsoft AI & Security Team Visit • January 16, 2026</p>
          <p>Hosted by <span className="text-emerald-600 font-medium">Black Tech Street</span></p>
        </footer>
      </main>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black/98 border-none overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedIndex !== null && (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                  onClick={closeLightbox}
                >
                  <X className="h-6 w-6" />
                </Button>

                <div className="flex items-center justify-center min-h-[70vh] p-8 relative">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 text-white hover:bg-white/20 rounded-full h-12 w-12"
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                  </motion.div>

                  <motion.img
                    key={galleryImages[selectedIndex].src}
                    src={galleryImages[selectedIndex].src}
                    alt={galleryImages[selectedIndex].alt}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 text-white hover:bg-white/20 rounded-full h-12 w-12"
                      onClick={goToNext}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </motion.div>
                </div>

                <motion.div 
                  className="flex items-center justify-between px-8 pb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex gap-2 overflow-x-auto max-w-[50%] py-2">
                    {galleryImages.map((img, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                          idx === selectedIndex 
                            ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-black' 
                            : 'opacity-50 hover:opacity-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm font-medium">
                      {selectedIndex + 1} / {galleryImages.length}
                    </span>
                    <motion.button
                      onClick={() => handleDownload(galleryImages[selectedIndex].src)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
