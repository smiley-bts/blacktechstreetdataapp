import { useMemo } from "react";
import { Contact, isDec6Workshop, isDec13LTF, isSept27BuildDay, isHappyHourAug2025, isJune2025Event, isSep2025Event, isMarch2025Event, isMay2025Event } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, PartyPopper, GraduationCap, Sparkles, Rocket, UserCheck, ClipboardList, Wrench } from "lucide-react";

interface EventsDashboardProps {
  contacts: Contact[];
  onEventClick?: (eventFilter: string) => void;
}

interface EventInfo {
  id: string;
  name: string;
  date: string;
  type: "workshop" | "build-day" | "social" | "training" | "survey";
  icon: React.ReactNode;
  filter: (contact: Contact) => boolean;
  attendedFilter: (contact: Contact) => boolean;
  filterKey: string;
  color: string;
  inviteOnly?: boolean;
}

// Helper to check if contact actually attended an event
function actuallyAttendedEvent(contact: Contact, eventKeyword: string): boolean {
  return !!(contact.eventsActuallyAttended && contact.eventsActuallyAttended.toLowerCase().includes(eventKeyword.toLowerCase()));
}

const EVENTS: EventInfo[] = [
  {
    id: "march-2025-presurvey",
    name: "Pre-Survey/Interest",
    date: "March 6, 2025",
    type: "survey",
    icon: <ClipboardList className="h-5 w-5" />,
    filter: isMarch2025Event,
    attendedFilter: (c) => actuallyAttendedEvent(c, "March"),
    filterKey: "march2025Event",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
  {
    id: "may-2025-workshops",
    name: "May Workshops",
    date: "May 15 & 30, 2025",
    type: "workshop",
    icon: <Wrench className="h-5 w-5" />,
    filter: isMay2025Event,
    attendedFilter: (c) => actuallyAttendedEvent(c, "May"),
    filterKey: "may2025Event",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    inviteOnly: true,
  },
  {
    id: "june-2025-aspire",
    name: "ASPIRE Workshop",
    date: "June 27-28, 2025",
    type: "workshop",
    icon: <Rocket className="h-5 w-5" />,
    filter: isJune2025Event,
    attendedFilter: (c) => actuallyAttendedEvent(c, "June"),
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
    attendedFilter: (c) => actuallyAttendedEvent(c, "Happy Hour"),
    filterKey: "happyHourAug2025",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
  },
  {
    id: "sep-2025-aspire-build-day",
    name: "ASPIRE AI Fluency + Build Day",
    date: "September 27, 2025",
    type: "build-day",
    icon: <GraduationCap className="h-5 w-5" />,
    filter: (c) => isSep2025Event(c) || isSept27BuildDay(c),
    attendedFilter: (c) => actuallyAttendedEvent(c, "Sep") || actuallyAttendedEvent(c, "ASPIRE Sep"),
    filterKey: "sept27BuildDay",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "dec-6-workshop",
    name: "ASPIRE Workshop",
    date: "December 6, 2025",
    type: "workshop",
    icon: <GraduationCap className="h-5 w-5" />,
    filter: isDec6Workshop,
    attendedFilter: (c) => actuallyAttendedEvent(c, "Dec 6"),
    filterKey: "dec6Workshop",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    id: "dec-13-ltf",
    name: "Lead The Future",
    date: "December 13, 2025",
    type: "training",
    icon: <Sparkles className="h-5 w-5" />,
    filter: isDec13LTF,
    attendedFilter: (c) => actuallyAttendedEvent(c, "Dec 13") || actuallyAttendedEvent(c, "LTF"),
    filterKey: "dec13LTF",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  "workshop": "Workshop",
  "build-day": "Build Day",
  "social": "Social",
  "training": "Training",
  "survey": "Survey",
};

export function EventsDashboard({ contacts, onEventClick }: EventsDashboardProps) {
  const metrics = useContactMetrics(contacts);

  const eventStats = useMemo(() => {
    return EVENTS.map(event => ({
      ...event,
      registeredCount: contacts.filter(event.filter).length,
      attendedCount: contacts.filter(event.attendedFilter).length,
      registeredContacts: contacts.filter(event.filter),
      attendedContacts: contacts.filter(event.attendedFilter),
    }));
  }, [contacts]);

  // Sort events by date (chronological order - oldest first)
  const sortedEvents = useMemo(() => {
    // Parse date strings to get sortable dates
    const parseEventDate = (dateStr: string): Date => {
      // Extract year and month from strings like "June 27-28, 2025" or "December 6, 2025"
      const months: Record<string, number> = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      
      for (const [monthName, monthIndex] of Object.entries(months)) {
        if (dateStr.includes(monthName)) {
          const yearMatch = dateStr.match(/(\d{4})/);
          const dayMatch = dateStr.match(/(\d{1,2})/);
          const year = yearMatch ? parseInt(yearMatch[1]) : 2025;
          const day = dayMatch ? parseInt(dayMatch[1]) : 1;
          return new Date(year, monthIndex, day);
        }
      }
      return new Date(dateStr);
    };
    
    return [...eventStats].sort((a, b) => {
      const dateA = parseEventDate(a.date);
      const dateB = parseEventDate(b.date);
      return dateA.getTime() - dateB.getTime();
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
                <p className="text-sm text-muted-foreground">Attendees</p>
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
          <CardDescription>All tracked events with registration and attendance</CardDescription>
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
                
                <div className="flex items-center gap-4 text-right">
                  {!event.inviteOnly && (
                    <>
                      <div>
                        <p className="text-xl font-bold text-foreground">{event.registeredCount}</p>
                        <p className="text-xs text-muted-foreground">registered</p>
                      </div>
                      <div className="w-px h-10 bg-border" />
                    </>
                  )}
                  <div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{event.attendedCount}</p>
                    <p className="text-xs text-muted-foreground">attended</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Type Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => {
          const eventsOfType = eventStats.filter(e => e.type === type);
          const totalRegistered = eventsOfType.reduce((sum, e) => sum + e.registeredCount, 0);
          const totalAttended = eventsOfType.reduce((sum, e) => sum + e.attendedCount, 0);
          
          return (
            <Card key={type} className="bg-card/50">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-foreground">{eventsOfType.length}</p>
                <p className="text-sm text-muted-foreground">{label}s</p>
                <div className="flex justify-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{totalRegistered} reg</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{totalAttended} att</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
