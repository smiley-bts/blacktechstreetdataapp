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
  ArrowLeft,
  Calendar,
  Briefcase,
  GraduationCap,
  Store,
  Library,
  Building,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import btsLogo from "@/assets/black-tech-street-logo.png";
import { VisitMap } from "@/components/microsoft-visit/VisitMap";

interface ScheduleItem {
  time: string;
  session: string;
  location: string;
  address: string;
  details: string;
  icon: React.ReactNode;
  type: 'meeting' | 'tour' | 'meal' | 'briefing';
}

interface Organization {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const schedule: ScheduleItem[] = [
  {
    time: "8:00 – 8:45 AM",
    session: "Welcome & Black Tech Street Team",
    location: "TEDC Creative Capital",
    address: "125 W 3rd St, Tulsa, OK 74103",
    details: "Overview of Black Tech Street mission, programs, and strategic vision.",
    icon: <Building2 className="h-5 w-5" />,
    type: 'meeting'
  },
  {
    time: "9:00 – 9:45 AM",
    session: "Mayor's Welcome & City Perspective",
    location: "City Hall",
    address: "175 E 2nd St S, Tulsa, OK 74103",
    details: "Opening remarks and discussion with Mayor Nichols on Tulsa's innovation and economic priorities.",
    icon: <Landmark className="h-5 w-5" />,
    type: 'meeting'
  },
  {
    time: "10:00 – 11:00 AM",
    session: "Tulsa Higher Education Consortium Briefing",
    location: "Gradient",
    address: "12 N Cheyenne Ave, Tulsa, OK 74103",
    details: "Overview of regional higher education collaboration, talent pipelines, and potential Lab Synergies.",
    icon: <BookOpen className="h-5 w-5" />,
    type: 'briefing'
  },
  {
    time: "11:05 AM – 12:05 PM",
    session: "Meet the Gradient Team",
    location: "Gradient",
    address: "12 N Cheyenne Ave, Tulsa, OK 74103",
    details: "Focused discussion on the vast network of startups housed and role as funnel for startup based Lab engagements.",
    icon: <Users className="h-5 w-5" />,
    type: 'meeting'
  },
  {
    time: "12:10 – 1:15 PM",
    session: "Lunch",
    location: "Fixins Soul Kitchen",
    address: "222 N Detroit Ave, Tulsa, OK 74120",
    details: "Authentic Southern comfort food in Tulsa's historic Greenwood District.",
    icon: <Utensils className="h-5 w-5" />,
    type: 'meal'
  },
  {
    time: "1:30 – 2:30 PM",
    session: "Tulsa Regional Chamber Briefing",
    location: "Tulsa Regional Chamber of Commerce",
    address: "1 W 3rd St, Tulsa, OK 74103",
    details: "Regional economic development strategy and business ecosystem overview. Emphasis on role as a channel partner for corporate Lab engagements.",
    icon: <Building2 className="h-5 w-5" />,
    type: 'briefing'
  },
  {
    time: "2:45 – 3:45 PM",
    session: "Greenwood District Tour",
    location: "Liquid Lounge",
    address: "10 N Greenwood Ave Suite 101, Tulsa, OK 74120",
    details: "Historical and future-facing tour of Greenwood, critical importance of the project and significance of GEM.",
    icon: <MapPin className="h-5 w-5" />,
    type: 'tour'
  },
  {
    time: "4:00 – 5:00 PM",
    session: "Community Roundtable",
    location: "Rudisill Library",
    address: "1520 N Hartford Ave, Tulsa, OK 74106",
    details: "Discussion with the Elders of Greenwood, dignitaries and local leaders who care deeply about GEM and feel a great sense of significance in the project.",
    icon: <Users className="h-5 w-5" />,
    type: 'meeting'
  },
  {
    time: "5:15 – 6:15 PM",
    session: "GEM Building Tour",
    location: "GEM Building",
    address: "660 E. Pine St. Tulsa, OK 74106",
    details: "Tour of the GEM Building - the historic Moton Hospital transformed into a modern hub for Black-owned businesses and tech-enabled startups.",
    icon: <Building2 className="h-5 w-5" />,
    type: 'tour'
  }
];

const organizations: Organization[] = [
  {
    name: "Black Tech Street",
    description: "Rebirthing Black Wall Street as the nation's premiere innovative economy with focus on responsible AI, cybersecurity and emerging technologies.",
    icon: <Rocket className="h-6 w-6" />,
    color: "from-violet-500 to-purple-600"
  },
  {
    name: "Gradient",
    description: "Tulsa's premier innovation hub serving as a central basecamp for entrepreneurs, startups, and remote workers.",
    icon: <Building className="h-6 w-6" />,
    color: "from-cyan-500 to-blue-600"
  },
  {
    name: "GEM Building",
    description: "Historic Moton Hospital transformed into a modern hub for Black-owned businesses and tech-enabled startups.",
    icon: <Building2 className="h-6 w-6" />,
    color: "from-amber-500 to-orange-600"
  },
  {
    name: "Greenwood Griot Tours",
    description: "Storytelling collective preserving Black Wall Street's legacy through guided experiences and immersive tours.",
    icon: <Users className="h-6 w-6" />,
    color: "from-emerald-500 to-green-600"
  },
  {
    name: "Tulsa Innovation Labs",
    description: "Nationally designated Tech Hub redefining innovation economy in America's heartland.",
    icon: <Briefcase className="h-6 w-6" />,
    color: "from-rose-500 to-pink-600"
  },
  {
    name: "Tulsa Regional Chamber",
    description: "Primary driver of regional prosperity representing 2,150+ organizations and 178,000+ workers.",
    icon: <Landmark className="h-6 w-6" />,
    color: "from-blue-500 to-indigo-600"
  },
  {
    name: "TEDC",
    description: "Certified CDFI providing lending and educational services to small businesses and entrepreneurs.",
    icon: <Store className="h-6 w-6" />,
    color: "from-teal-500 to-cyan-600"
  },
  {
    name: "Rudisill Library",
    description: "Community hub and historical anchor for North Tulsa with new expanded facility opening in Greenwood.",
    icon: <Library className="h-6 w-6" />,
    color: "from-purple-500 to-violet-600"
  },
  {
    name: "Fixins Soul Kitchen",
    description: "Full-service restaurant combining authentic Southern comfort food with modern atmosphere.",
    icon: <Utensils className="h-6 w-6" />,
    color: "from-orange-500 to-red-600"
  }
];

const typeStyles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  meeting: { bg: "bg-blue-500/5", border: "border-l-blue-500", text: "text-blue-500", dot: "bg-blue-500" },
  tour: { bg: "bg-emerald-500/5", border: "border-l-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500" },
  meal: { bg: "bg-orange-500/5", border: "border-l-orange-500", text: "text-orange-500", dot: "bg-orange-500" },
  briefing: { bg: "bg-purple-500/5", border: "border-l-purple-500", text: "text-purple-500", dot: "bg-purple-500" }
};

export default function MicrosoftVisit() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <img src={btsLogo} alt="Black Tech Street" className="h-10 w-auto" />
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" />
              Friday, January 16, 2026
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0078D4]/10 text-[#0078D4] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            Microsoft AI & Security Team
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Tulsa Innovation Tour
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A curated day exploring Tulsa's thriving tech ecosystem, from historic Greenwood to cutting-edge innovation hubs.
          </p>
        </div>

        {/* Interactive Map */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Tour Route
          </h2>
          <VisitMap />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Click markers for location details • Dashed line shows tour route
          </p>
        </section>

        {/* Schedule Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Day Schedule
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[140px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />
            
            <div className="space-y-3">
              {schedule.map((item, index) => {
                const styles = typeStyles[item.type];
                return (
                  <div 
                    key={index} 
                    className={`relative flex flex-col md:flex-row gap-4 p-4 rounded-xl ${styles.bg} border-l-4 ${styles.border} hover:shadow-md transition-all`}
                  >
                    {/* Time badge */}
                    <div className="md:w-32 flex-shrink-0">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border shadow-sm`}>
                        <div className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`} />
                        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                          {item.time.split('–')[0].trim()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${styles.text} bg-background border border-border`}>
                            {item.icon}
                          </div>
                          <h3 className="font-semibold text-foreground">{item.session}</h3>
                        </div>
                        <Badge variant="outline" className={`${styles.text} border-current/20 text-xs hidden sm:inline-flex`}>
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.details}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">{item.location}</span>
                        <span className="hidden sm:inline">• {item.address}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Featured Organizations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Featured Organizations
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all overflow-hidden border-0 bg-card/50">
                <div className={`h-2 bg-gradient-to-r ${org.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${org.color} text-white shadow-lg`}>
                      {org.icon}
                    </div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">{org.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {org.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground border-t border-border pt-8">
          <p className="mb-2">Microsoft AI & Security Team Visit • January 16, 2026</p>
          <p>Hosted by Black Tech Street</p>
        </footer>
      </main>
    </div>
  );
}
