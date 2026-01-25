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

  const statCards = [
    {
      label: "Total Contacts",
      value: metrics.total,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/20",
    },
    {
      label: "Website Leads",
      value: customMetrics.websiteOnlyCount,
      icon: Globe,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
    },
    {
      label: "IRL Attendees",
      value: customMetrics.irlAttendeesCount,
      icon: Calendar,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      label: "Stakeholders",
      value: customMetrics.stakeholderCount,
      icon: Crown,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
    },
    {
      label: "Needs Attention",
      value: metrics.incomplete,
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      glow: "shadow-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
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
  );
}
