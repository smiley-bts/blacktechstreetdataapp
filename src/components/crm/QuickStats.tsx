import { Users, Globe, Calendar, Crown, AlertCircle } from "lucide-react";
import { Contact, isEventAttendee } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { useContactTags } from "@/hooks/useContactTags";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { CountUp } from "@/components/ui/count-up";

interface QuickStatsProps {
  contacts: Contact[];
}

export function QuickStats({ contacts }: QuickStatsProps) {
  const metrics = useContactMetrics(contacts);
  const { getContactsWithTag } = useContactTags();

  // Calculate custom metrics
  const customMetrics = useMemo(() => {
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

  // Primary stats - focused on IRL attendees
  const statCards = [
    {
      label: "IRL Attendees",
      value: customMetrics.irlAttendeesCount,
      icon: Calendar,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      isPrimary: true,
    },
    {
      label: "Stakeholders",
      value: customMetrics.stakeholderCount,
      icon: Crown,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
      isPrimary: true,
    },
    {
      label: "Needs Attention",
      value: metrics.incomplete,
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      glow: "shadow-red-500/20",
      isPrimary: false,
    },
  ];

  // Secondary stats - smaller display
  const secondaryStats = [
    {
      label: "Total Contacts",
      value: metrics.total,
      icon: Users,
    },
    {
      label: "Website Only",
      value: customMetrics.websiteOnlyCount,
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Primary stats - larger, prominent */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
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
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats - smaller, muted */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        {secondaryStats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <stat.icon className="h-3.5 w-3.5" />
            <span>{stat.label}:</span>
            <span className="font-medium text-foreground">{stat.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
