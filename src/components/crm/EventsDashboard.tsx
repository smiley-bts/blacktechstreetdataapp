import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, PartyPopper, GraduationCap, Sparkles, Rocket, UserCheck, ClipboardList, Wrench, ExternalLink } from "lucide-react";
import { useEventAttendanceCSV } from "@/hooks/useEventAttendanceCSV";
import { useCSVDashboardMetrics } from "@/hooks/useCSVDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface EventsDashboardProps {
  contacts?: any[];
  onEventClick?: (eventFilter: string) => void;
}

interface EventDisplayInfo {
  name: string;
  date: string;
  type: string;
  icon: React.ReactNode;
  filterKey: string;
  color: string;
  uniqueAttendees: number;
  isYouthEvent?: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  "workshop": "Workshop",
  "build-day": "Build Day",
  "social": "Social",
  "training": "Training",
  "survey": "Survey",
};

export function EventsDashboard({ contacts, onEventClick }: EventsDashboardProps) {
  const navigate = useNavigate();
  const csvData = useEventAttendanceCSV();
  const dashboardMetrics = useCSVDashboardMetrics();

  const events: EventDisplayInfo[] = useMemo(() => {
    if (csvData.loading) return [];
    return [
      {
        name: "ASPIRE Workshop",
        date: "June 27-28, 2025",
        type: "workshop",
        icon: <Rocket className="h-5 w-5" />,
        filterKey: "june2025Event",
        color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
        uniqueAttendees: csvData.june.combined.dedupeCount,
      },
      {
        name: "ASPIRE AI Fluency + Build Day",
        date: "September 27, 2025",
        type: "build-day",
        icon: <GraduationCap className="h-5 w-5" />,
        filterKey: "sept27BuildDay",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        uniqueAttendees: csvData.sept27.dedupeCount,
      },
      {
        name: "ASPIRE Workshop",
        date: "December 6, 2025",
        type: "workshop",
        icon: <GraduationCap className="h-5 w-5" />,
        filterKey: "dec6Workshop",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        uniqueAttendees: csvData.dec6.dedupeCount,
      },
      {
        name: "Lead The Future",
        date: "December 13, 2025",
        type: "training",
        icon: <Sparkles className="h-5 w-5" />,
        filterKey: "dec13LTF",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        uniqueAttendees: csvData.ltf.dedupeCount,
        isYouthEvent: true,
      },
    ];
  }, [csvData]);

  const totalUniqueAttendees = useMemo(() => {
    return events.reduce((sum, e) => sum + e.uniqueAttendees, 0);
  }, [events]);

  if (csvData.loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{events.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalUniqueAttendees}</p>
                <p className="text-sm text-muted-foreground">Total Unique Attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {dashboardMetrics.totalRegistrants}
                </p>
                <p className="text-sm text-muted-foreground">Total Registrants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Events Timeline
          </CardTitle>
          <CardDescription>All tracked events with attendance from CSV data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={event.filterKey}
                className={`relative flex items-center gap-4 p-4 rounded-xl border ${event.color} cursor-pointer hover:scale-[1.01] transition-all duration-200`}
                onClick={() => navigate(`/events/${event.filterKey}`)}
              >
                {index < events.length - 1 && (
                  <div className="absolute left-[2.1rem] top-full h-4 w-0.5 bg-border z-0" />
                )}
                
                <div className={`p-2.5 rounded-xl ${event.color}`}>
                  {event.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{event.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {EVENT_TYPE_LABELS[event.type]}
                    </Badge>
                    {event.isYouthEvent && (
                      <Badge variant="secondary" className="text-xs">Youth</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{event.uniqueAttendees}</p>
                    <p className="text-xs text-muted-foreground">Unique</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
