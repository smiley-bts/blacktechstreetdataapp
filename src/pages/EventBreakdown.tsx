import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Users, UserCheck, Calendar, Rocket, GraduationCap, PartyPopper, Sparkles, ClipboardList, Wrench, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LTFDashboard } from "@/components/dashboard/LTFDashboard";
import { EventAttendanceTabs } from "@/components/crm/EventAttendanceTabs";
import { DemographicComparisonCharts } from "@/components/crm/DemographicComparisonCharts";
import { useEventAttendanceCSV } from "@/hooks/useEventAttendanceCSV";
import { EventKey } from "@/hooks/useSignupDemographics";

interface EventConfig {
  id: string;
  name: string;
  date: string;
  type: "workshop" | "build-day" | "social" | "training" | "survey";
  icon: React.ReactNode;
  color: string;
  multiDay?: boolean;
  isYouthEvent?: boolean;
  csvKey: string; // key into useEventAttendanceCSV return
  showEmail?: boolean;
}

const EVENTS: Record<string, EventConfig> = {
  "june2025Event": {
    id: "june-2025-aspire",
    name: "ASPIRE Workshop",
    date: "June 27-28, 2025",
    type: "workshop",
    icon: <Rocket className="h-6 w-6" />,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    multiDay: true,
    csvKey: "june",
  },
  "sept27BuildDay": {
    id: "sep-2025-aspire-build-day",
    name: "ASPIRE AI Fluency + Build Day",
    date: "September 27, 2025",
    type: "build-day",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    csvKey: "sept27",
    showEmail: true,
  },
  "dec6Workshop": {
    id: "dec-6-workshop",
    name: "ASPIRE Workshop",
    date: "December 6, 2025",
    type: "workshop",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    csvKey: "dec6",
    showEmail: true,
  },
  "dec13LTF": {
    id: "dec-13-ltf",
    name: "Lead The Future",
    date: "December 13, 2025",
    type: "training",
    icon: <Sparkles className="h-6 w-6" />,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    isYouthEvent: true,
    csvKey: "ltf",
  },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  "workshop": "Workshop",
  "build-day": "Build Day",
  "social": "Social",
  "training": "Training",
  "survey": "Survey",
};

export default function EventBreakdown() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const csvData = useEventAttendanceCSV();
  const listRef = useRef<HTMLDivElement>(null);

  // June: which day tab is active
  const [juneDayTab, setJuneDayTab] = useState<"day1" | "day2" | "combined">("day1");
  // Per-day list tab
  const [juneDay1Tab, setJuneDay1Tab] = useState<"actual" | "nodupe">("actual");
  const [juneDay2Tab, setJuneDay2Tab] = useState<"actual" | "nodupe">("actual");
  const [juneCombinedTab, setJuneCombinedTab] = useState<"actual" | "nodupe">("actual");
  // Single-day events list tab
  const [singleListTab, setSingleListTab] = useState<"actual" | "nodupe">("actual");

  function scrollToList() {
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function handleJuneKPI(day: "day1" | "day2" | "combined", tab: "actual" | "nodupe") {
    setJuneDayTab(day);
    if (day === "day1") setJuneDay1Tab(tab);
    else if (day === "day2") setJuneDay2Tab(tab);
    else setJuneCombinedTab(tab);
    scrollToList();
  }

  const event = eventId ? EVENTS[eventId] : null;

  if (!eventId || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (csvData.loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      </div>
    );
  }

  // For youth events (LTF), show simplified view
  if (event.isYouthEvent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${event.color}`}>
                  {event.icon}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{event.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{event.date}</span>
                    <Badge variant="outline">{EVENT_TYPE_LABELS[event.type]}</Badge>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Youth Program
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">{csvData.ltf.dedupeCount}</p>
                  <p className="text-sm text-muted-foreground">Student Participants</p>
                </div>
                <div className="ml-auto text-right">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    100% Feedback Completion
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Youth Privacy Protection:</span>{" "}
                Individual student contact information is not displayed. Only aggregated feedback data is shown below.
              </p>
            </CardContent>
          </Card>

          <LTFDashboard />
        </div>
      </div>
    );
  }

  // Multi-day event (June ASPIRE)
  if (event.multiDay && event.csvKey === "june") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${event.color}`}>
                  {event.icon}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{event.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{event.date}</span>
                    <Badge variant="outline">{EVENT_TYPE_LABELS[event.type]}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined KPIs — clickable to jump to relevant list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => handleJuneKPI("combined", "actual")}
              className={cn("text-left rounded-xl border p-4 transition-all duration-200 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20",
                juneDayTab === "combined" && juneCombinedTab === "actual" ? "ring-2 ring-amber-500 shadow-md" : "hover:ring-1 hover:ring-amber-500/50")}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-muted-foreground">Total Sign-ins</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{csvData.june.combined.rawCount}</p>
            </button>

            <button
              onClick={() => handleJuneKPI("combined", "nodupe")}
              className={cn("text-left rounded-xl border p-4 transition-all duration-200 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20",
                juneDayTab === "combined" && juneCombinedTab === "nodupe" ? "ring-2 ring-emerald-500 shadow-md" : "hover:ring-1 hover:ring-emerald-500/50")}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-muted-foreground">Unique (Both Days)</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{csvData.june.combined.dedupeCount}</p>
            </button>

            <button
              onClick={() => handleJuneKPI("day1", "nodupe")}
              className={cn("text-left rounded-xl border p-4 transition-all duration-200 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20",
                juneDayTab === "day1" ? "ring-2 ring-cyan-500 shadow-md" : "hover:ring-1 hover:ring-cyan-500/50")}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm text-muted-foreground">Day 1 Unique</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{csvData.june.day1.dedupeCount}</p>
            </button>

            <button
              onClick={() => handleJuneKPI("day2", "nodupe")}
              className={cn("text-left rounded-xl border p-4 transition-all duration-200 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20",
                juneDayTab === "day2" ? "ring-2 ring-cyan-500 shadow-md" : "hover:ring-1 hover:ring-cyan-500/50")}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm text-muted-foreground">Day 2 Unique</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{csvData.june.day2.dedupeCount}</p>
            </button>
          </div>

          {/* Demographic Comparison Charts */}
          <DemographicComparisonCharts eventKey="june2025Event" eventName={event.name} />

          {/* Day tabs — controlled by KPI cards above */}
          <div ref={listRef}>
            <Tabs value={juneDayTab} onValueChange={(v) => setJuneDayTab(v as "day1" | "day2" | "combined")} className="w-full">
              <TabsList>
                <TabsTrigger value="day1">Day 1</TabsTrigger>
                <TabsTrigger value="day2">Day 2</TabsTrigger>
                <TabsTrigger value="combined">Combined</TabsTrigger>
              </TabsList>
              <TabsContent value="day1">
                <EventAttendanceTabs data={csvData.june.day1} label="Day 1 — June 27, 2025"
                  activeTab={juneDay1Tab} onTabChange={setJuneDay1Tab} />
              </TabsContent>
              <TabsContent value="day2">
                <EventAttendanceTabs data={csvData.june.day2} label="Day 2 — June 28, 2025"
                  activeTab={juneDay2Tab} onTabChange={setJuneDay2Tab} />
              </TabsContent>
              <TabsContent value="combined">
                <EventAttendanceTabs data={csvData.june.combined} label="Combined (Both Days)"
                  activeTab={juneCombinedTab} onTabChange={setJuneCombinedTab} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Single-day events (Sept 27, Dec 6)
  const singleDayData = event.csvKey === "sept27" ? csvData.sept27 
    : event.csvKey === "dec6" ? csvData.dec6 
    : csvData.ltf;

  const rsvpInfo = event.csvKey === "sept27" ? csvData.sept27All 
    : event.csvKey === "dec6" ? csvData.dec6All 
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${event.color}`}>
                {event.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{event.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{event.date}</span>
                  <Badge variant="outline">{EVENT_TYPE_LABELS[event.type]}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP summary — clickable KPI cards */}
        {rsvpInfo && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setSingleListTab("actual"); scrollToList(); }}
              className={cn("text-left rounded-xl border p-4 sm:p-6 transition-all duration-200 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20",
                singleListTab === "actual" ? "ring-2 ring-amber-500 shadow-md" : "hover:ring-1 hover:ring-amber-500/50")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{rsvpInfo.rsvps}</p>
                  <p className="text-sm text-muted-foreground">RSVPs</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => { setSingleListTab("nodupe"); scrollToList(); }}
              className={cn("text-left rounded-xl border p-4 sm:p-6 transition-all duration-200 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20",
                singleListTab === "nodupe" ? "ring-2 ring-emerald-500 shadow-md" : "hover:ring-1 hover:ring-emerald-500/50")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{singleDayData.dedupeCount}</p>
                  <p className="text-sm text-muted-foreground">New Attendees</p>
                </div>
              </div>
            </button>
          </div>
        )}
        {/* Demographic Comparison Charts */}
        {(eventId === "sept27BuildDay" || eventId === "dec6Workshop") && (
          <DemographicComparisonCharts eventKey={eventId as EventKey} eventName={event.name} />
        )}

        {/* Attendee list — controlled by KPI cards above */}
        <div ref={listRef}>
          <EventAttendanceTabs data={singleDayData} showEmail={event.showEmail}
            activeTab={singleListTab} onTabChange={setSingleListTab} />
        </div>
      </div>
    </div>
  );
}
