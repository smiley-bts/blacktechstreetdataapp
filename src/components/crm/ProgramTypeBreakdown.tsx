import { EventTypeBreakdown } from "@/hooks/useEventAttendance";
import { 
  EVENT_TYPE_LABELS, 
  EVENT_TYPE_COLORS,
  EVENT_TYPES,
  EventType,
} from "@/types/eventTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Users, Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramTypeBreakdownProps {
  breakdown: EventTypeBreakdown[];
  onTypeClick?: (type: EventType) => void;
}

const TYPE_ICONS: Record<EventType, React.ComponentType<{ className?: string }>> = {
  [EVENT_TYPES.WORKSHOP]: GraduationCap,
  [EVENT_TYPES.COMMUNITY_ENGAGEMENT]: Users,
  [EVENT_TYPES.EDUCATION]: Briefcase,
  [EVENT_TYPES.ENTERPRISE]: Building2,
};

export function ProgramTypeBreakdown({ breakdown, onTypeClick }: ProgramTypeBreakdownProps) {
  // Find the max for relative sizing
  const maxAttendees = Math.max(...breakdown.map(b => b.uniqueAttendees), 1);
  
  // Sort by attendee count descending
  const sortedBreakdown = [...breakdown].sort(
    (a, b) => b.uniqueAttendees - a.uniqueAttendees
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Program Type Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedBreakdown.map((item) => {
          const colors = EVENT_TYPE_COLORS[item.type];
          const Icon = TYPE_ICONS[item.type];
          const percentage = Math.round((item.uniqueAttendees / maxAttendees) * 100);
          
          return (
            <button
              key={item.type}
              onClick={() => onTypeClick?.(item.type)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                "hover:border-primary/30 hover:bg-accent/50",
                colors.border,
                colors.bg
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-md", colors.bg)}>
                    <Icon className={cn("h-4 w-4", colors.text)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {EVENT_TYPE_LABELS[item.type]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.eventCount} event{item.eventCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    <CountUp end={item.uniqueAttendees} duration={400} />
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    unique attendees
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={percentage} 
                  className="h-1.5"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{item.totalAttendances} total attendances</span>
                  <span>{item.attendanceRate}% attendance rate</span>
                </div>
              </div>
            </button>
          );
        })}

        {breakdown.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No event data available. Import attendance records to see program breakdown.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
