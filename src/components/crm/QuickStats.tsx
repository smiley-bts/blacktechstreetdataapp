import { TrendingUp, Users, Star, Hammer, Brain, Award, Target, Sparkles, AlertCircle, UserCheck } from "lucide-react";
import { Contact } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  contacts: Contact[];
}

export function QuickStats({ contacts }: QuickStatsProps) {
  const metrics = useContactMetrics(contacts);

  const statCards = [
    {
      label: "Total Contacts",
      value: metrics.total.toLocaleString(),
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/20",
    },
    {
      label: "Event Registered",
      value: metrics.eventRegistered.toLocaleString(),
      icon: Star,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
    },
    {
      label: "Attendees",
      value: metrics.eventActuallyAttended.toLocaleString(),
      icon: UserCheck,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      label: "Build Day Projects",
      value: metrics.buildDayParticipants.toLocaleString(),
      icon: Hammer,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
    },
    {
      label: "Has Feedback",
      value: metrics.withFeedback.toLocaleString(),
      icon: Sparkles,
      gradient: "from-pink-500 to-rose-600",
      glow: "shadow-pink-500/20",
    },
    {
      label: "Emerging AI Users",
      value: metrics.emerging.toLocaleString(),
      icon: Brain,
      gradient: "from-purple-500 to-violet-600",
      glow: "shadow-purple-500/20",
    },
    {
      label: "Intermediate+",
      value: metrics.intermediate.toLocaleString(),
      icon: Award,
      gradient: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/20",
    },
    {
      label: "Volunteers",
      value: metrics.volunteersInterested.toLocaleString(),
      icon: Target,
      gradient: "from-fuchsia-500 to-purple-600",
      glow: "shadow-fuchsia-500/20",
    },
    {
      label: "NPS Score",
      value: metrics.npsScore !== null ? `${metrics.npsScore > 0 ? '+' : ''}${metrics.npsScore}` : "N/A",
      icon: TrendingUp,
      gradient: metrics.npsScore && metrics.npsScore >= 50 ? "from-emerald-500 to-green-600" : "from-slate-500 to-gray-600",
      glow: metrics.npsScore && metrics.npsScore >= 50 ? "shadow-emerald-500/20" : "shadow-slate-500/20",
    },
    {
      label: "Needs Attention",
      value: metrics.incomplete.toLocaleString(),
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      glow: "shadow-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-3",
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
              "h-3.5 w-3.5 sm:h-4 sm:w-4 mb-1 sm:mb-2",
              "text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-200"
            )} />
            <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
