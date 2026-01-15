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
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import btsLogo from "@/assets/black-tech-street-logo.png";

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
    description: "An organization dedicated to rebirthing Black Wall Street as the nation's premiere innovative economy, with a strategic focus on responsible AI, cybersecurity and emerging technologies."
  },
  {
    name: "Gradient",
    description: "Tulsa's premier innovation and technology hub, serving as a central \"basecamp\" for entrepreneurs, startups, and remote workers."
  },
  {
    name: "Greenwood Entrepreneurship at Moton (GEM)",
    description: "A historic preservation and economic development project in North Tulsa that transforms the former Moton Hospital into a modern hub for Black-owned businesses and tech-enabled startups."
  },
  {
    name: "Greenwood Griot Tours",
    description: "A Tulsa-based storytelling collective rooted in the Historic Greenwood District, committed to preserving and sharing the legacy of Black Wall Street through guided experiences, workshops, and immersive tours."
  },
  {
    name: "Tulsa Innovation Labs",
    description: "Redefining what it means to build a thriving innovation economy in America's heartland. As a nationally designated Tech Hub, the Tulsa region boasts high-growth sectors like aerospace and defense, energy and manufacturing."
  },
  {
    name: "Tulsa Regional Chamber",
    description: "Representing more than 2,150 member organizations and more than 178,000 workers, the Chamber is the primary driver of regional and individual prosperity in northeast Oklahoma."
  },
  {
    name: "Tulsa Economic Development Corporation (TEDC)",
    description: "A non-profit organization and certified Community Development Financial Institution that provides lending and educational services to small businesses and entrepreneurs in the Tulsa region."
  },
  {
    name: "Rudisill Regional Library",
    description: "A key branch of the Tulsa City-County Library system that serves as a vital community hub and historical anchor for North Tulsa."
  },
  {
    name: "Fixins Soul Kitchen",
    description: "A full-service restaurant in downtown Tulsa's historic Greenwood District that combines authentic Southern comfort food with a high-energy, modern atmosphere."
  }
];

const typeColors: Record<string, string> = {
  meeting: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  tour: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  meal: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  briefing: "bg-purple-500/10 text-purple-500 border-purple-500/20"
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-1">9</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-500 mb-1">6</div>
              <div className="text-sm text-muted-foreground">Locations</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-500 mb-1">10+</div>
              <div className="text-sm text-muted-foreground">Organizations</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-500 mb-1">10 hrs</div>
              <div className="text-sm text-muted-foreground">Full Day</div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Day Schedule
          </h2>
          
          <div className="space-y-4">
            {schedule.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Time Column */}
                  <div className="bg-muted/50 px-6 py-4 md:w-48 flex-shrink-0 flex items-center justify-center md:justify-start border-b md:border-b-0 md:border-r border-border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeColors[item.type]}`}>
                        {item.icon}
                      </div>
                      <span className="font-mono text-sm font-medium text-foreground">{item.time}</span>
                    </div>
                  </div>
                  
                  {/* Content Column */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{item.session}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{item.details}</p>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-foreground">{item.location}</span>
                            <span className="text-muted-foreground"> — {item.address}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={typeColors[item.type]}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Featured Organizations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Featured Organizations
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{org.name}</CardTitle>
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
