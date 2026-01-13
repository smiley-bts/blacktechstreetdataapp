import { useParams, useNavigate, Link } from "react-router-dom";
import { useMemo } from "react";
import { useContacts } from "@/hooks/useContacts";
import { Contact, isDec6Workshop, isDec13LTF, isSept27BuildDay, isHappyHourAug2025, isJune2025Event, isSep2025Event, isMarch2025Event, isMay2025Event, getDisplayName } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, UserCheck, TrendingUp, Calendar, Rocket, GraduationCap, PartyPopper, Sparkles, ClipboardList, Wrench, BarChart3 } from "lucide-react";

interface EventConfig {
  id: string;
  name: string;
  date: string;
  type: "workshop" | "build-day" | "social" | "training" | "survey";
  icon: React.ReactNode;
  color: string;
  filter: (contact: Contact) => boolean;
  attendedFilter: (contact: Contact) => boolean;
  multiDay?: boolean;
  day1Filter?: (contact: Contact) => boolean;
  day2Filter?: (contact: Contact) => boolean;
  inviteOnly?: boolean;
}

function actuallyAttendedEvent(contact: Contact, eventKeyword: string): boolean {
  return !!(contact.eventsActuallyAttended && contact.eventsActuallyAttended.toLowerCase().includes(eventKeyword.toLowerCase()));
}

const EVENTS: Record<string, EventConfig> = {
  "march2025Event": {
    id: "march-2025-presurvey",
    name: "Pre-Survey/Interest",
    date: "March 6, 2025",
    type: "survey",
    icon: <ClipboardList className="h-6 w-6" />,
    filter: isMarch2025Event,
    attendedFilter: (c) => actuallyAttendedEvent(c, "March"),
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
  "may2025Event": {
    id: "may-2025-workshops",
    name: "May Workshops",
    date: "May 15 & 30, 2025",
    type: "workshop",
    icon: <Wrench className="h-6 w-6" />,
    filter: isMay2025Event,
    attendedFilter: (c) => actuallyAttendedEvent(c, "May"),
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    inviteOnly: true,
  },
  "june2025Event": {
    id: "june-2025-aspire",
    name: "ASPIRE Workshop",
    date: "June 27-28, 2025",
    type: "workshop",
    icon: <Rocket className="h-6 w-6" />,
    filter: isJune2025Event,
    attendedFilter: (c) => actuallyAttendedEvent(c, "June 2025 Day 1") || actuallyAttendedEvent(c, "June 2025 Day 2"),
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    multiDay: true,
    day1Filter: (c: Contact) => actuallyAttendedEvent(c, "June 2025 Day 1"),
    day2Filter: (c: Contact) => actuallyAttendedEvent(c, "June 2025 Day 2"),
  },
  "happyHourAug2025": {
    id: "happy-hour-aug-2025",
    name: "Happy Hour",
    date: "August 27, 2025",
    type: "social",
    icon: <PartyPopper className="h-6 w-6" />,
    filter: isHappyHourAug2025,
    attendedFilter: (c) => actuallyAttendedEvent(c, "Happy Hour"),
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
  },
  "sept27BuildDay": {
    id: "sep-2025-aspire-build-day",
    name: "ASPIRE AI Fluency + Build Day",
    date: "September 27, 2025",
    type: "build-day",
    icon: <GraduationCap className="h-6 w-6" />,
    filter: (c) => isSep2025Event(c) || isSept27BuildDay(c),
    attendedFilter: (c) => actuallyAttendedEvent(c, "Sep 2025"),
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  "dec6Workshop": {
    id: "dec-6-workshop",
    name: "ASPIRE Workshop",
    date: "December 6, 2025",
    type: "workshop",
    icon: <GraduationCap className="h-6 w-6" />,
    filter: isDec6Workshop,
    attendedFilter: (c) => actuallyAttendedEvent(c, "Dec 6"),
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  "dec13LTF": {
    id: "dec-13-ltf",
    name: "Lead The Future",
    date: "December 13, 2025",
    type: "training",
    icon: <Sparkles className="h-6 w-6" />,
    filter: isDec13LTF,
    attendedFilter: (c) => actuallyAttendedEvent(c, "Dec 13") || actuallyAttendedEvent(c, "LTF"),
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
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
  const { contacts, loading: isLoading } = useContacts();

  const event = eventId ? EVENTS[eventId] : null;

  const stats = useMemo(() => {
    if (!event || !contacts.length) return null;

    const registered = contacts.filter(event.filter);
    const attended = contacts.filter(event.attendedFilter);
    const day1 = event.day1Filter ? contacts.filter(event.day1Filter) : [];
    const day2 = event.day2Filter ? contacts.filter(event.day2Filter) : [];
    const bothDays = event.multiDay ? day1.filter(c => day2.some(d => d.recordId === c.recordId)) : [];

    const registrationToAttendance = registered.length > 0 
      ? Math.round((attended.length / registered.length) * 100) 
      : 0;
    const day1ToDay2Retention = event.multiDay && day1.length > 0 
      ? Math.round((day2.length / day1.length) * 100) 
      : null;

    // Demographics breakdown
    const ageGroups: Record<string, number> = {};
    const industries: Record<string, number> = {};
    const aiLevels: Record<string, number> = {};

    attended.forEach(contact => {
      if (contact.ageRange) {
        ageGroups[contact.ageRange] = (ageGroups[contact.ageRange] || 0) + 1;
      }
      if (contact.industry) {
        industries[contact.industry] = (industries[contact.industry] || 0) + 1;
      }
      if (contact.aiExperienceLevel) {
        aiLevels[contact.aiExperienceLevel] = (aiLevels[contact.aiExperienceLevel] || 0) + 1;
      }
    });

    return {
      registered,
      attended,
      day1,
      day2,
      bothDays,
      registrationToAttendance,
      day1ToDay2Retention,
      ageGroups: Object.entries(ageGroups).sort((a, b) => b[1] - a[1]),
      industries: Object.entries(industries).sort((a, b) => b[1] - a[1]).slice(0, 8),
      aiLevels: Object.entries(aiLevels).sort((a, b) => b[1] - a[1]),
    };
  }, [event, contacts]);

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

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
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

        {/* Key Metrics */}
        <div className={`grid gap-4 ${event.multiDay ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {!event.inviteOnly && (
            <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.registered.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Registered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {event.multiDay ? (
            <>
              <Card className="bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10">
                      <UserCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.day1.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Day 1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10">
                      <UserCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.day2.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Day 2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10">
                      <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.bothDays.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Both Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.day1ToDay2Retention || 0}%</p>
                      <p className="text-sm text-muted-foreground">Retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10">
                      <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.attended.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Attended</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!event.inviteOnly && (
                <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.registrationToAttendance || 0}%</p>
                        <p className="text-sm text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Funnel Visualization for Multi-Day Events */}
        {event.multiDay && stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Attendance Funnel
              </CardTitle>
              <CardDescription>Registration to completion journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Registered</span>
                  <span className="font-medium">{stats.registered.length}</span>
                </div>
                <Progress value={100} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Day 1 Attendance</span>
                  <span className="font-medium">{stats.day1.length} ({stats.registered.length > 0 ? Math.round((stats.day1.length / stats.registered.length) * 100) : 0}%)</span>
                </div>
                <Progress value={stats.registered.length > 0 ? (stats.day1.length / stats.registered.length) * 100 : 0} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Day 2 Attendance</span>
                  <span className="font-medium">{stats.day2.length} ({stats.registered.length > 0 ? Math.round((stats.day2.length / stats.registered.length) * 100) : 0}%)</span>
                </div>
                <Progress value={stats.registered.length > 0 ? (stats.day2.length / stats.registered.length) * 100 : 0} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed Both Days</span>
                  <span className="font-medium">{stats.bothDays.length} ({stats.registered.length > 0 ? Math.round((stats.bothDays.length / stats.registered.length) * 100) : 0}%)</span>
                </div>
                <Progress value={stats.registered.length > 0 ? (stats.bothDays.length / stats.registered.length) * 100 : 0} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demographics Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Age Distribution */}
          {stats && stats.ageGroups.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Age Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.ageGroups.map(([age, count]) => (
                  <div key={age} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate flex-1 mr-2">{age}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(count / stats.attended.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Industry Distribution */}
          {stats && stats.industries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Industries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.industries.map(([industry, count]) => (
                  <div key={industry} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate flex-1 mr-2">{industry}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${(count / stats.attended.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Experience Levels */}
          {stats && stats.aiLevels.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">AI Experience Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.aiLevels.map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate flex-1 mr-2">{level}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(count / stats.attended.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Attendee List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Attendees ({stats?.attended.length || 0})
            </CardTitle>
            <CardDescription>
              {event.multiDay 
                ? "People who attended at least one day" 
                : "People who attended this event"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {stats?.attended.map(contact => (
                <div 
                  key={contact.recordId}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {getDisplayName(contact).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getDisplayName(contact)}</p>
                    {contact.email && (
                      <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                    )}
                  </div>
                  {event.multiDay && (
                    <div className="flex gap-1">
                      {event.day1Filter?.(contact) && (
                        <Badge variant="outline" className="text-[10px] px-1">D1</Badge>
                      )}
                      {event.day2Filter?.(contact) && (
                        <Badge variant="outline" className="text-[10px] px-1">D2</Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}