import { useState, useCallback, useEffect } from "react";
import { CSVDashboardHero } from "./CSVDashboardHero";
import { AttendanceFunnelChart } from "./AttendanceFunnelChart";
import { EventsDashboard } from "./EventsDashboard";
import { PeopleDashboard } from "./PeopleDashboard";
import { SavedReports } from "./SavedReports";
import { AIChatPanel } from "./AIChatPanel";
import { PresentationMode } from "@/components/presentation/PresentationMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, CalendarDays, FileText, Bot, Presentation, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { ContactFilter } from "@/types/contact";
import btsLogo from "@/assets/black-tech-street-logo.png";

const TAGLINES = [
  "Manage your community contacts",
  "When In Doubt Email Smiley! 😉",
  "Warning: May cause excessive organization 📋",
  "Your people. Your data. 🚀"
];

const defaultFilters: ContactFilter = {
  search: "",
  lifecycleStage: [],
  aiExperienceLevel: [],
  ageRange: [],
  incomeRange: [],
  cohort: [],
  tags: [],
  eventAttendeesOnly: false,
  buildDayOnly: false,
  dec6Workshop: false,
  dec13LTF: false,
  sept27BuildDay: false,
  june2025Event: false,
  happyHourAug2025: false,
  hasFeedback: false,
  hasProject: false,
};

export default function CRMDashboard() {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineFading, setTaglineFading] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [filters] = useState<ContactFilter>(defaultFilters);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 2,
    onTimeout: handleLogout,
    enabled: !!user,
  });

  // Rotate tagline
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFading(true);
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
        setTaglineFading(false);
      }, 300);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="animate-fade-in">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/50 to-accent/10 border border-border shadow-sm dark:shadow-none p-4 sm:p-6">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
              {profile && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Welcome back, <span className="text-primary">{profile.display_name}</span>!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You're logged in as {profile.role === 'owner' ? 'Owner' : 'Admin'} • Last login tracked
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 border border-border shadow-sm">
                      <img src={btsLogo} alt="Black Tech Street" className="h-7 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                      ASPIRE CRM
                    </h1>
                    <p className={`text-xs sm:text-sm text-muted-foreground hidden sm:flex items-center gap-1.5 mt-0.5 transition-opacity duration-300 ${taglineFading ? 'opacity-0' : 'opacity-100'}`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {TAGLINES[taglineIndex]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ThemeToggle />
                  <div className="hidden sm:flex items-center gap-2">
                    {profile && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-foreground">{profile.display_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">({profile.role})</span>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowPresentationMode(true)}
                      className="gap-2 bg-primary/10 backdrop-blur-sm hover:bg-primary/20 border-primary/30 text-primary transition-all duration-200"
                    >
                      <Presentation className="h-4 w-4" />
                      <span className="hidden md:inline">Present</span>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200">
                      <Link to="/auth">
                        <Settings className="h-4 w-4" />
                        <span className="hidden md:inline">Admin</span>
                      </Link>
                    </Button>
                    {user && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className="gap-2 bg-destructive/10 backdrop-blur-sm hover:bg-destructive/20 border-destructive/30 text-destructive transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden md:inline">Logout</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Tabs - 5 tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full grid-cols-5 bg-secondary/50 h-auto p-1">
            <TabsTrigger value="dashboard" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <CSVDashboardHero
              onViewEvents={() => setActiveTab("events")}
              onViewPeople={() => setActiveTab("people")}
              onViewAI={() => setActiveTab("ai-assistant")}
            />
            <AttendanceFunnelChart />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4 sm:mt-6">
            <EventsDashboard />
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="mt-4 sm:mt-6">
            <PeopleDashboard />
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="mt-6">
            <AIChatPanel />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <SavedReports 
              contacts={[]} 
              currentFilters={filters} 
              onLoadReport={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showPresentationMode && (
        <PresentationMode 
          contacts={[]} 
          onExit={() => setShowPresentationMode(false)} 
        />
      )}
    </div>
  );
}
