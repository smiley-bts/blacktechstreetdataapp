import { CalendarDays, TrendingUp, ArrowRight, UserCheck, CheckCircle, Users } from "lucide-react";
import { Contact } from "@/types/contact";
import { useParticipantMetrics } from "@/hooks/useParticipantMetrics";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";

interface DashboardHeroProps {
  contacts: Contact[];
  onViewContacts?: () => void;
  onViewEvents?: () => void;
  onViewAttendees?: () => void;
}

export function DashboardHero({ contacts, onViewContacts, onViewEvents, onViewAttendees }: DashboardHeroProps) {
  const { metrics: participantMetrics, isLoading } = useParticipantMetrics();
  const legacyMetrics = useContactMetrics(contacts);

  // Use new participant data if available, otherwise fallback to legacy
  const hasParticipantData = participantMetrics.totalUniqueAttendees > 0;

  // Attendee-focused stats with fallback
  const heroStats = hasParticipantData ? [
    {
      label: "Confirmed Attendees",
      value: participantMetrics.totalUniqueAttendees,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      isPrimary: true,
    },
    {
      label: "Total Attendances",
      value: participantMetrics.totalAttendances,
      icon: CalendarDays,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Retention Rate",
      value: participantMetrics.retentionRate,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      isPercentage: true,
    },
    {
      label: "Attendance Rate",
      value: participantMetrics.overallAttendanceRate,
      icon: UserCheck,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      isPercentage: true,
    },
  ] : [
    // Legacy fallback stats
    {
      label: "Event Attendees",
      value: legacyMetrics.eventActuallyAttended,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      isPrimary: true,
    },
    {
      label: "Unique Attendees",
      value: legacyMetrics.uniqueEventAttendees,
      icon: CalendarDays,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Multi-Event",
      value: legacyMetrics.multiEventAttendees,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "With Feedback",
      value: legacyMetrics.withFeedback,
      icon: UserCheck,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/5 via-background to-primary/5 border border-border p-6 sm:p-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Welcome text */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Attendee Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Track confirmed event attendance and engagement
          </p>
          {/* Secondary stat: Total contacts */}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {contacts.length.toLocaleString()} total contacts in database
          </p>
        </div>

        {/* Stats grid - Attendee focused */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {heroStats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden rounded-xl p-4",
                "bg-card/50 backdrop-blur-sm border border-border/50",
                "hover:border-primary/30 hover:shadow-lg transition-all duration-300",
                "group animate-fade-in",
                stat.isPrimary && "lg:col-span-1 ring-2 ring-emerald-500/20"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className={cn(
                "font-bold text-foreground",
                stat.isPrimary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              )}>
                {isLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  <>
                    <CountUp end={stat.value} duration={600} />
                    {stat.isPercentage && <span className="text-lg">%</span>}
                  </>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="default" 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={onViewAttendees}
          >
            <CheckCircle className="h-4 w-4" />
            View Attendees
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onViewEvents}
          >
            <CalendarDays className="h-4 w-4" />
            Browse Events
          </Button>
          <Button 
            variant="ghost" 
            className="gap-2 text-muted-foreground"
            onClick={onViewContacts}
          >
            <Users className="h-4 w-4" />
            All Contacts
          </Button>
        </div>
      </div>
    </div>
  );
}