import { Contact, isEventAttendee, isDec6Workshop, isDec13LTF, isSept27BuildDay, isHappyHourAug2025, isJune2025Event, isSep2025Event } from "@/types/contact";
import { useContactTags } from "@/hooks/useContactTags";
import { useParticipantMetrics } from "@/hooks/useParticipantMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Calendar, Crown, ChevronRight, Users, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CommunityBreakdownProps {
  contacts: Contact[];
  onNavigateToWebsiteLeads?: () => void;
  onNavigateToIRLAttendees?: () => void;
  onNavigateToStakeholders?: () => void;
}

const EVENT_COLORS = [
  "hsl(var(--chart-blue))",
  "hsl(var(--primary))",
  "hsl(var(--chart-purple))",
  "hsl(var(--gold))",
  "hsl(var(--chart-teal))",
  "hsl(var(--emerald))",
];

export function CommunityBreakdown({
  contacts,
  onNavigateToWebsiteLeads,
  onNavigateToIRLAttendees,
  onNavigateToStakeholders,
}: CommunityBreakdownProps) {
  const { getContactsWithTag } = useContactTags();
  const { metrics: participantMetrics, isLoading } = useParticipantMetrics();

  // Check if we have new participant data
  const hasParticipantData = participantMetrics.totalUniqueAttendees > 0;

  const legacyMetrics = useMemo(() => {
    const stakeholderIds = getContactsWithTag("Stakeholder");
    const websiteOnlyCount = contacts.filter(c => !isEventAttendee(c)).length;
    const irlAttendeesCount = contacts.filter(c => isEventAttendee(c)).length;

    // Event distribution for chart (legacy)
    const eventDistribution = [
      { name: "June '25", value: contacts.filter(c => isJune2025Event(c)).length },
      { name: "Happy Hour", value: contacts.filter(c => isHappyHourAug2025(c)).length },
      { name: "Sep '25", value: contacts.filter(c => isSep2025Event(c)).length },
      { name: "Sept 27", value: contacts.filter(c => isSept27BuildDay(c)).length },
      { name: "Dec 6", value: contacts.filter(c => isDec6Workshop(c)).length },
      { name: "Dec 13", value: contacts.filter(c => isDec13LTF(c)).length },
    ].filter(d => d.value > 0);

    // Recent stakeholders (up to 5)
    const stakeholderContacts = contacts.filter(c => stakeholderIds.includes(c.recordId));
    const recentStakeholders = stakeholderContacts.slice(0, 5);

    return {
      websiteOnlyCount,
      irlAttendeesCount,
      stakeholderCount: stakeholderIds.length,
      eventDistribution,
      recentStakeholders,
    };
  }, [contacts, getContactsWithTag]);

  // Build event chart data from new system or fallback
  const eventChartData = useMemo(() => {
    if (hasParticipantData && participantMetrics.eventSummaries.length > 0) {
      return participantMetrics.eventSummaries.slice(0, 6).map(event => ({
        name: event.eventName.length > 12 
          ? event.eventName.substring(0, 12) + '...' 
          : event.eventName,
        attended: event.totalAttended,
        registered: event.totalRegistered,
        rate: event.attendanceRate,
      }));
    }
    return legacyMetrics.eventDistribution;
  }, [hasParticipantData, participantMetrics.eventSummaries, legacyMetrics.eventDistribution]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* IRL Attendees Card - Attendance First */}
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 group">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            {hasParticipantData ? "Confirmed Attendees" : "IRL Attendees"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-4xl font-bold text-foreground">
              <CountUp 
                end={hasParticipantData 
                  ? participantMetrics.totalUniqueAttendees 
                  : legacyMetrics.irlAttendeesCount
                } 
                duration={600} 
              />
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasParticipantData 
                ? "Verified attendance across all events"
                : "Registered for at least one event"
              }
            </p>
          </div>

          {/* Attendance vs Registration breakdown (new system) */}
          {hasParticipantData && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-lg font-semibold">{participantMetrics.totalAttendances}</p>
                  <p className="text-[10px] text-muted-foreground">Total attendances</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-lg font-semibold">{participantMetrics.overallAttendanceRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Attendance rate</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Event Distribution Chart */}
          {eventChartData.length > 0 && (
            <div className="h-[140px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={80} 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => {
                      if (hasParticipantData) {
                        return [value, name === 'attended' ? 'Attended' : 'Registered'];
                      }
                      return [value, 'Registered'];
                    }}
                  />
                  {hasParticipantData ? (
                    <>
                      <Bar dataKey="attended" fill="hsl(var(--emerald))" radius={[0, 4, 4, 0]} />
                    </>
                  ) : (
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {eventChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={EVENT_COLORS[index % EVENT_COLORS.length]} />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full gap-2 group-hover:border-primary/50"
            onClick={onNavigateToIRLAttendees}
          >
            View All Attendees
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      {/* Engagement Depth Card (new) or Stakeholders (legacy) */}
      {hasParticipantData ? (
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 group">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              Engagement Depth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-foreground">
                <CountUp end={participantMetrics.retentionRate} duration={600} />
                <span className="text-2xl">%</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Participants returned for multiple events
              </p>
            </div>

            {/* Engagement breakdown */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">First-time attendees</span>
                <span className="font-medium">{participantMetrics.firstTimeAttendees}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Returning (2+ events)</span>
                <span className="font-medium text-purple-500">{participantMetrics.multiEventAttendees}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">High engagement (3+)</span>
                <span className="font-medium text-emerald-500">{participantMetrics.highEngagement}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stakeholders</span>
                <span className="font-medium text-amber-500">{participantMetrics.stakeholderCount}</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full gap-2 group-hover:border-primary/50"
              onClick={onNavigateToStakeholders}
            >
              View Stakeholders
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Legacy Stakeholders Card
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 group">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
              Stakeholders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-foreground">
                <CountUp end={legacyMetrics.stakeholderCount} duration={600} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Priority contacts tagged
              </p>
            </div>

            {/* Recent Stakeholders Preview */}
            {legacyMetrics.recentStakeholders.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Recent stakeholders:</p>
                <div className="space-y-1.5">
                  {legacyMetrics.recentStakeholders.map((contact) => (
                    <div 
                      key={contact.recordId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Crown className="h-3 w-3 text-amber-500" />
                      </div>
                      <span className="truncate text-foreground">
                        {contact.fullName || contact.firstName || contact.email || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Use the crown icon on contact cards to tag stakeholders
                </p>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full gap-2 group-hover:border-primary/50"
              onClick={onNavigateToStakeholders}
            >
              View All Stakeholders
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
