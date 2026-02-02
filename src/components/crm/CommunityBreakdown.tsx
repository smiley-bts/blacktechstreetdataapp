import { Contact, isEventAttendee, isDec6Workshop, isDec13LTF, isSept27BuildDay, isHappyHourAug2025, isJune2025Event, isSep2025Event } from "@/types/contact";
import { useContactTags } from "@/hooks/useContactTags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Globe, Calendar, Crown, ChevronRight, Users } from "lucide-react";
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

  const metrics = useMemo(() => {
    const stakeholderIds = getContactsWithTag("Stakeholder");
    const websiteOnlyCount = contacts.filter(c => !isEventAttendee(c)).length;
    const irlAttendeesCount = contacts.filter(c => isEventAttendee(c)).length;

    // Event distribution for chart
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* IRL Attendees Card - Primary Focus */}
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 group">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            IRL Attendees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-4xl font-bold text-foreground">
              <CountUp end={metrics.irlAttendeesCount} duration={600} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Attended at least one event
            </p>
          </div>
          
          {/* Event Distribution Chart */}
          {metrics.eventDistribution.length > 0 && (
            <div className="h-[140px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.eventDistribution} layout="vertical">
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
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {metrics.eventDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={EVENT_COLORS[index % EVENT_COLORS.length]} />
                    ))}
                  </Bar>
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

      {/* Stakeholders Card */}
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
              <CountUp end={metrics.stakeholderCount} duration={600} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Priority contacts tagged
            </p>
          </div>

          {/* Recent Stakeholders Preview */}
          {metrics.recentStakeholders.length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Recent stakeholders:</p>
              <div className="space-y-1.5">
                {metrics.recentStakeholders.map((contact) => (
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
    </div>
  );
}
