import { TrendingUp, Users, Star, Hammer, Brain, Award, Target, Sparkles, AlertCircle } from "lucide-react";
import { Contact, hasEventFeedback, hasBuildDayData } from "@/types/contact";
import { cn } from "@/lib/utils";
import { getCompletenessScore } from "@/lib/contactCompleteness";

interface QuickStatsProps {
  contacts: Contact[];
}

export function QuickStats({ contacts }: QuickStatsProps) {
  // Calculate all stats
  const incompleteCount = contacts.filter(c => getCompletenessScore(c) < 50).length;
  
  const stats = {
    total: contacts.length,
    withEmail: contacts.filter(c => c.email).length,
    leads: contacts.filter(c => c.lifecycleStage?.toLowerCase() === "lead").length,
    eventAttendees: contacts.filter(c => c.eventsAttended || c.sept27thReg).length,
    hasFeedback: contacts.filter(c => hasEventFeedback(c)).length,
    buildDayParticipants: contacts.filter(c => hasBuildDayData(c)).length,
    emerging: contacts.filter(c => c.aiExperienceLevel?.toLowerCase().includes("emerging")).length,
    intermediate: contacts.filter(c => 
      c.aiExperienceLevel?.toLowerCase().includes("intermediate") ||
      c.aiExperienceLevel?.toLowerCase().includes("advanced")
    ).length,
    volunteersInterested: contacts.filter(c => c.volunteerInterest?.toLowerCase() === "yes").length,
    promoters: contacts.filter(c => {
      const nps = parseInt(c.npsScore);
      return !isNaN(nps) && nps >= 4;
    }).length,
    incomplete: incompleteCount,
  };

  // Calculate NPS
  const npsResponses = contacts.filter(c => c.npsScore);
  const promoterCount = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
  const detractorCount = npsResponses.filter(c => parseInt(c.npsScore) <= 2).length;
  const npsScore = npsResponses.length > 0 
    ? Math.round(((promoterCount - detractorCount) / npsResponses.length) * 100)
    : null;

  const statCards = [
    {
      label: "Total Contacts",
      value: stats.total.toLocaleString(),
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/20",
    },
    {
      label: "Event Attendees",
      value: stats.eventAttendees.toLocaleString(),
      icon: Star,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
    },
    {
      label: "Build Day Projects",
      value: stats.buildDayParticipants.toLocaleString(),
      icon: Hammer,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      label: "Has Feedback",
      value: stats.hasFeedback.toLocaleString(),
      icon: Sparkles,
      gradient: "from-pink-500 to-rose-600",
      glow: "shadow-pink-500/20",
    },
    {
      label: "Emerging AI Users",
      value: stats.emerging.toLocaleString(),
      icon: Brain,
      gradient: "from-purple-500 to-violet-600",
      glow: "shadow-purple-500/20",
    },
    {
      label: "Intermediate+",
      value: stats.intermediate.toLocaleString(),
      icon: Award,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
    },
    {
      label: "Volunteers",
      value: stats.volunteersInterested.toLocaleString(),
      icon: Target,
      gradient: "from-fuchsia-500 to-purple-600",
      glow: "shadow-fuchsia-500/20",
    },
    {
      label: "NPS Score",
      value: npsScore !== null ? `${npsScore > 0 ? '+' : ''}${npsScore}` : "N/A",
      icon: TrendingUp,
      gradient: npsScore && npsScore >= 50 ? "from-emerald-500 to-green-600" : "from-slate-500 to-gray-600",
      glow: npsScore && npsScore >= 50 ? "shadow-emerald-500/20" : "shadow-slate-500/20",
    },
    {
      label: "Needs Attention",
      value: stats.incomplete.toLocaleString(),
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      glow: "shadow-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "relative overflow-hidden rounded-xl p-3",
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
              "h-4 w-4 mb-2",
              "text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-200"
            )} />
            <p className="text-xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
