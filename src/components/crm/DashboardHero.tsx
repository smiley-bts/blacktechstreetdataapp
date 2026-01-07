import { Users, CalendarDays, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Contact, hasEventFeedback } from "@/types/contact";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardHeroProps {
  contacts: Contact[];
  onViewContacts?: () => void;
  onViewEvents?: () => void;
}

export function DashboardHero({ contacts, onViewContacts, onViewEvents }: DashboardHeroProps) {
  // Calculate key metrics
  const totalContacts = contacts.length;
  const eventAttendees = contacts.filter(c => c.eventsAttended || c.sept27thReg).length;
  const feedbackCount = contacts.filter(c => hasEventFeedback(c)).length;
  
  // Calculate NPS
  const npsResponses = contacts.filter(c => c.npsScore);
  const promoterCount = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
  const detractorCount = npsResponses.filter(c => parseInt(c.npsScore) <= 2).length;
  const npsScore = npsResponses.length > 0 
    ? Math.round(((promoterCount - detractorCount) / npsResponses.length) * 100)
    : null;

  const heroStats = [
    {
      label: "Total Contacts",
      value: totalContacts.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Event Attendees",
      value: eventAttendees.toLocaleString(),
      icon: CalendarDays,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Feedback Collected",
      value: feedbackCount.toLocaleString(),
      icon: Sparkles,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      label: "NPS Score",
      value: npsScore !== null ? `${npsScore > 0 ? '+' : ''}${npsScore}` : "N/A",
      icon: TrendingUp,
      color: npsScore && npsScore >= 50 ? "text-emerald-500" : "text-muted-foreground",
      bgColor: npsScore && npsScore >= 50 ? "bg-emerald-500/10" : "bg-muted/50",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border p-6 sm:p-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Welcome text */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Community Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Your ASPIRE program at a glance
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {heroStats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden rounded-xl p-4",
                "bg-card/50 backdrop-blur-sm border border-border/50",
                "hover:border-primary/30 hover:shadow-lg transition-all duration-300",
                "group animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
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
            className="gap-2"
            onClick={onViewContacts}
          >
            <Users className="h-4 w-4" />
            View All Contacts
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
        </div>
      </div>
    </div>
  );
}
