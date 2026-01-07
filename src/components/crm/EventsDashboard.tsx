import { useMemo } from "react";
import { Contact, isDec6Workshop, isDec13LTF, isSept27BuildDay, isHappyHourAug2025, isJune2025Event, isSep2025Event } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, PartyPopper, Briefcase, GraduationCap, Sparkles, Rocket, UserCheck } from "lucide-react";

interface EventsDashboardProps {
  contacts: Contact[];
  onEventClick?: (eventFilter: string) => void;
}

interface EventInfo {
  id: string;
  name: string;
  date: string;
  type: "workshop" | "build-day" | "social" | "training";
  icon: React.ReactNode;
  filter: (contact: Contact) => boolean;
  filterKey: string;
  color: string;
}

const EVENTS: EventInfo[] = [
  {
    id: "june-2025-aspire",
    name: "ASPIRE Workshop",
    date: "June 27-28, 2025",
    type: "workshop",
    icon: <Rocket className="h-5 w-5" />,
    filter: isJune2025Event,
    filterKey: "june2025Event",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
  {
    id: "happy-hour-aug-2025",
    name: "Happy Hour",
    date: "August 27, 2025",
    type: "social",
    icon: <PartyPopper className="h-5 w-5" />,
    filter: isHappyHourAug2025,
    filterKey: "happyHourAug2025",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
  },
  {
    id: "sep-2025-aspire",
    name: "ASPIRE AI Fluency",
    date: "September 27, 2025",
    type: "workshop",
    icon: <GraduationCap className="h-5 w-5" />,
    filter: isSep2025Event,
    filterKey: "sept27BuildDay",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "sept-27-build-day",
    name: "Build Day",
    date: "September 27, 2025",
    type: "build-day",
    icon: <Briefcase className="h-5 w-5" />,
    filter: isSept27BuildDay,
    filterKey: "sept27BuildDay",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "dec-6-workshop",
    name: "ASPIRE Workshop",
    date: "December 6, 2025",
    type: "workshop",
    icon: <GraduationCap className="h-5 w-5" />,
    filter: isDec6Workshop,
    filterKey: "dec6Workshop",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    id: "dec-13-ltf",
    name: "Learn to Fly",
    date: "December 13, 2025",
    type: "training",
    icon: <Sparkles className="h-5 w-5" />,
    filter: isDec13LTF,
    filterKey: "dec13LTF",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  "workshop": "Workshop",
  "build-day": "Build Day",
  "social": "Social",
  "training": "Training",
};

export function EventsDashboard({ contacts, onEventClick }: EventsDashboardProps) {
  const metrics = useContactMetrics(contacts);

  const eventStats = useMemo(() => {
    return EVENTS.map(event => ({
      ...event,
      attendeeCount: contacts.filter(event.filter).length,
      attendees: contacts.filter(event.filter),
    }));
  }, [contacts]);

  // Sort events by date (most recent first)
  const sortedEvents = useMemo(() => {
    return [...eventStats].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [eventStats]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{EVENTS.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
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
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.eventRegistered}</p>
                <p className="text-sm text-muted-foreground">Registered</p>
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
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.eventActuallyAttended}</p>
                <p className="text-sm text-muted-foreground">Actually Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.multiEventAttendees}</p>
                <p className="text-sm text-muted-foreground">Multi-Event</p>
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
          <CardDescription>All tracked events and their attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                className={`relative flex items-center gap-4 p-4 rounded-xl border ${event.color} cursor-pointer hover:scale-[1.01] transition-all duration-200`}
                onClick={() => onEventClick?.(event.filterKey)}
              >
                {/* Timeline connector */}
                {index < sortedEvents.length - 1 && (
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
                  </div>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{event.attendeeCount}</p>
                  <p className="text-xs text-muted-foreground">registered</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Type Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => {
          const eventsOfType = eventStats.filter(e => e.type === type);
          const totalAttendees = eventsOfType.reduce((sum, e) => sum + e.attendeeCount, 0);
          
          return (
            <Card key={type} className="bg-card/50">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-foreground">{eventsOfType.length}</p>
                <p className="text-sm text-muted-foreground">{label}s</p>
                <p className="text-xs text-muted-foreground mt-1">{totalAttendees} registered</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
