import { Users, UserCheck, TrendingUp, CalendarDays, ArrowRight } from "lucide-react";
import { useCSVDashboardMetrics } from "@/hooks/useCSVDashboardMetrics";
import { CountUp } from "@/components/ui/count-up";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CSVDashboardHeroProps {
  onViewEvents?: () => void;
  onViewPeople?: () => void;
  onViewAI?: () => void;
}

export function CSVDashboardHero({ onViewEvents, onViewPeople, onViewAI }: CSVDashboardHeroProps) {
  const metrics = useCSVDashboardMetrics();

  const heroStats = [
    {
      label: "Total Registrants",
      value: metrics.totalRegistrants,
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Certificate Holders",
      value: metrics.totalAttendees,
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      isPrimary: true,
    },
    {
      label: "Attendance Rate",
      value: metrics.overallRate,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      isPercentage: true,
    },
    {
      label: "Events Held",
      value: metrics.totalEvents,
      icon: CalendarDays,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  if (metrics.loading) {
    return (
      <div className="rounded-2xl border border-border p-6 sm:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/5 via-background to-emerald-500/5 border border-border p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Program Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Aggregated metrics across all ASPIRE events from CSV data
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {heroStats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden rounded-xl p-4",
                "bg-card/50 backdrop-blur-sm border border-border/50",
                "hover:border-primary/30 hover:shadow-lg transition-all duration-300",
                "group animate-fade-in",
                stat.isPrimary && "ring-2 ring-emerald-500/20"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className={cn("font-bold text-foreground", stat.isPrimary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl")}>
                <CountUp end={stat.value} duration={600} />
                {stat.isPercentage && <span className="text-lg">%</span>}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={onViewEvents}>
            <CalendarDays className="h-4 w-4" />
            Browse Events
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2" onClick={onViewPeople}>
            <Users className="h-4 w-4" />
            View People
          </Button>
          <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={onViewAI}>
            💬 Ask AI Assistant
          </Button>
        </div>
      </div>
    </div>
  );
}
