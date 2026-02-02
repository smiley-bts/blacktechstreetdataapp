import { Users, Globe, Calendar, Crown, AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import { Contact, isEventAttendee } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { useParticipantMetrics } from "@/hooks/useParticipantMetrics";
import { useContactTags } from "@/hooks/useContactTags";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { CountUp } from "@/components/ui/count-up";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickStatsProps {
  contacts: Contact[];
}

export function QuickStats({ contacts }: QuickStatsProps) {
  const oldMetrics = useContactMetrics(contacts);
  const { metrics: participantMetrics, isLoading } = useParticipantMetrics();
  const { getContactsWithTag } = useContactTags();

  // Legacy metrics for fallback during migration
  const legacyMetrics = useMemo(() => {
    const stakeholderIds = getContactsWithTag("Stakeholder");
    const stakeholderCount = stakeholderIds.length;
    const websiteOnlyCount = contacts.filter(c => !isEventAttendee(c)).length;
    const irlAttendeesCount = contacts.filter(c => isEventAttendee(c)).length;
    
    return {
      stakeholderCount,
      websiteOnlyCount,
      irlAttendeesCount,
    };
  }, [contacts, getContactsWithTag]);

  // Use new participant metrics when available, fallback to legacy
  const hasParticipantData = participantMetrics.totalUniqueAttendees > 0;
  
  // Primary stats - attendance-first
  const statCards = [
    {
      label: "Unique Attendees",
      value: hasParticipantData ? participantMetrics.totalUniqueAttendees : legacyMetrics.irlAttendeesCount,
      subLabel: hasParticipantData 
        ? `${participantMetrics.overallAttendanceRate}% attendance rate`
        : "IRL event participants",
      icon: Calendar,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      tooltip: "People who actually attended at least one event (not just registered)",
    },
    {
      label: "Stakeholders",
      value: hasParticipantData ? participantMetrics.stakeholderCount : legacyMetrics.stakeholderCount,
      subLabel: hasParticipantData 
        ? `${participantMetrics.communityParticipantCount} community participants`
        : "Priority contacts",
      icon: Crown,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      tooltip: "Priority partners and key contacts tagged by your team",
    },
    {
      label: hasParticipantData ? "Retention Rate" : "Needs Attention",
      value: hasParticipantData ? participantMetrics.retentionRate : oldMetrics.incomplete,
      subLabel: hasParticipantData
        ? `${participantMetrics.returningAttendees} returned after first event`
        : "Incomplete profiles",
      icon: hasParticipantData ? TrendingUp : AlertCircle,
      gradient: hasParticipantData ? "from-purple-500 to-indigo-600" : "from-red-500 to-rose-600",
      glow: hasParticipantData ? "shadow-purple-500/20" : "shadow-red-500/20",
      isPercentage: hasParticipantData,
      tooltip: hasParticipantData 
        ? "Percentage of attendees who returned for additional events"
        : "Contacts with less than 50% data completeness",
    },
  ];

  // Secondary stats
  const secondaryStats = hasParticipantData ? [
    {
      label: "Total Attendances",
      value: participantMetrics.totalAttendances,
      icon: CheckCircle,
    },
    {
      label: "Avg Events/Person",
      value: participantMetrics.averageEventsPerAttendee,
      icon: TrendingUp,
    },
    {
      label: "Survey Rate",
      value: `${participantMetrics.surveyCompletionRate}%`,
      icon: Users,
    },
  ] : [
    {
      label: "Total Contacts",
      value: oldMetrics.total,
      icon: Users,
    },
    {
      label: "Website Only",
      value: legacyMetrics.websiteOnlyCount,
      icon: Globe,
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Data source indicator */}
        {!isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full",
              hasParticipantData ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <span>
              {hasParticipantData 
                ? "Showing attendance-verified metrics" 
                : "Showing registration-based metrics (migration pending)"
              }
            </span>
          </div>
        )}

        {/* Primary stats - larger, prominent */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {statCards.map((stat, index) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl p-4",
                    "bg-gradient-to-br from-card/80 to-card/40",
                    "border border-border/30",
                    "hover:border-primary/30 hover:-translate-y-1 transition-all duration-300",
                    "group cursor-default animate-fade-in",
                    `hover:shadow-lg ${stat.glow}`
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Gradient overlay */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    `bg-gradient-to-br ${stat.gradient}`
                  )} />
                  
                  <div className="relative z-10">
                    <stat.icon className={cn(
                      "h-5 w-5 mb-2",
                      "text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-200"
                    )} />
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      <CountUp end={stat.value} duration={600} />
                      {stat.isPercentage && <span className="text-lg">%</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                    {stat.subLabel && (
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
                        {stat.subLabel}
                      </p>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Secondary stats - smaller, muted */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
          {secondaryStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <stat.icon className="h-3.5 w-3.5" />
              <span>{stat.label}:</span>
              <span className="font-medium text-foreground">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
