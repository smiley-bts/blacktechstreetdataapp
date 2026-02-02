import { format } from "date-fns";
import { 
  ParticipantEngagement, 
  AttendanceRecord,
  getEngagementWeight,
} from "@/hooks/useParticipantEngagement";
import { 
  EVENT_TYPE_LABELS, 
  EVENT_TYPE_COLORS,
  GRANT_CATEGORY_LABELS,
  EventType,
} from "@/types/eventTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  Award,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantTimelineProps {
  engagement: ParticipantEngagement;
  showEngagementDetails?: boolean;
}

const TIER_CONFIG = {
  champion: {
    label: "Champion",
    color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: Star,
    description: "Highly engaged participant with deep program involvement",
  },
  high: {
    label: "High Engagement",
    color: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: TrendingUp,
    description: "Active participant with consistent attendance",
  },
  medium: {
    label: "Medium Engagement",
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Users,
    description: "Participant with growing involvement",
  },
  low: {
    label: "New/Low Engagement",
    color: "bg-slate-400",
    textColor: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    icon: Clock,
    description: "New or occasional participant",
  },
};

export function ParticipantTimeline({ 
  engagement, 
  showEngagementDetails = true 
}: ParticipantTimelineProps) {
  const tierConfig = TIER_CONFIG[engagement.engagementTier];
  const TierIcon = tierConfig.icon;
  const weight = getEngagementWeight(engagement.engagementTier);

  return (
    <div className="space-y-4">
      {/* Engagement Summary */}
      {showEngagementDetails && (
        <Card className={cn("border", tierConfig.borderColor)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg", tierConfig.bgColor)}>
                  <TierIcon className={cn("h-4 w-4", tierConfig.textColor)} />
                </div>
                Engagement Profile
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className={cn(tierConfig.bgColor, tierConfig.textColor, "border-0")}>
                      {tierConfig.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">{tierConfig.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Survey weight: {weight}x
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Engagement Score</span>
                <span className="font-medium">{engagement.engagementScore}/100</span>
              </div>
              <Progress value={engagement.engagementScore} className="h-2" />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-xl font-bold">{engagement.attendedEvents}</p>
                <p className="text-[10px] text-muted-foreground">Events</p>
              </div>
              <div>
                <p className="text-xl font-bold">{engagement.surveyCount}</p>
                <p className="text-[10px] text-muted-foreground">Surveys</p>
              </div>
              <div>
                <p className="text-xl font-bold">{engagement.uniqueEventTypes.length}</p>
                <p className="text-[10px] text-muted-foreground">Program Types</p>
              </div>
              <div>
                <p className="text-xl font-bold">{engagement.daysSinceLastEvent}</p>
                <p className="text-[10px] text-muted-foreground">Days Since</p>
              </div>
            </div>

            {/* Program types attended */}
            {engagement.uniqueEventTypes.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Programs Attended</p>
                <div className="flex flex-wrap gap-1.5">
                  {engagement.uniqueEventTypes.map((type) => {
                    const colors = EVENT_TYPE_COLORS[type];
                    return (
                      <Badge 
                        key={type} 
                        variant="outline" 
                        className={cn("text-[10px]", colors.bg, colors.text, colors.border)}
                      >
                        {EVENT_TYPE_LABELS[type].split(" ")[0]}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cohort info */}
            {engagement.cohortMonth && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Joined {format(new Date(engagement.cohortMonth + "-01"), "MMMM yyyy")} cohort
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {engagement.timeline.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

              <div className="space-y-4">
                {engagement.timeline.map((record, index) => (
                  <TimelineEvent 
                    key={record.id} 
                    record={record} 
                    isFirst={index === 0}
                    isLast={index === engagement.timeline.length - 1}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No attendance records found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TimelineEventProps {
  record: AttendanceRecord;
  isFirst: boolean;
  isLast: boolean;
}

function TimelineEvent({ record, isFirst, isLast }: TimelineEventProps) {
  const typeColors = EVENT_TYPE_COLORS[record.eventType];

  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 w-6 h-6 rounded-full flex items-center justify-center",
        record.confirmedAttended 
          ? "bg-emerald-500/20 ring-2 ring-emerald-500/50" 
          : "bg-muted ring-2 ring-border"
      )}>
        {record.confirmedAttended ? (
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Event card */}
      <div className={cn(
        "rounded-lg border p-3 transition-all hover:border-primary/30",
        record.confirmedAttended ? "bg-card" : "bg-muted/30 opacity-60"
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {record.eventName}
              {record.dayLabel && (
                <span className="text-muted-foreground"> — {record.dayLabel}</span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={cn("text-[10px]", typeColors.bg, typeColors.text, typeColors.border)}
              >
                {EVENT_TYPE_LABELS[record.eventType]}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {GRANT_CATEGORY_LABELS[record.grantCategory]}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">
              {format(new Date(record.eventDate), "MMM d, yyyy")}
            </p>
            <div className="flex items-center gap-1 mt-1 justify-end">
              {record.completedSurvey && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FileCheck className="h-3.5 w-3.5 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Completed survey</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {record.signedRelease && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Signed media release</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        {!record.confirmedAttended && (
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            Registered but did not attend
          </p>
        )}
      </div>
    </div>
  );
}
