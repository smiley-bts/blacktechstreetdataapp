import { Contact, hasEventFeedback, hasBuildDayData, getDisplayName, getContactInitials } from "@/types/contact";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Building2, Star, Hammer, StickyNote, ChevronRight } from "lucide-react";
import { useContactNotes } from "@/hooks/useContactNotes";

interface ContactListRowProps {
  contact: Contact;
  onClick: () => void;
  variant: "list" | "compact";
}

const aiLevelColors: Record<string, string> = {
  "beginner": "from-blue-500 to-blue-600",
  "emerging": "from-cyan-500 to-teal-500",
  "intermediate": "from-emerald-500 to-green-500",
  "advanced": "from-purple-500 to-violet-500",
  "expert": "from-pink-500 to-rose-500",
};

function getAiLevelGradient(level: string): string {
  const lowerLevel = level.toLowerCase();
  for (const [key, gradient] of Object.entries(aiLevelColors)) {
    if (lowerLevel.includes(key)) return gradient;
  }
  return "from-muted to-muted";
}

function getShortAiLevel(level: string): string {
  if (level.toLowerCase().includes("beginner")) return "Beginner";
  if (level.toLowerCase().includes("emerging")) return "Emerging";
  if (level.toLowerCase().includes("intermediate")) return "Intermediate";
  if (level.toLowerCase().includes("advanced")) return "Advanced";
  if (level.toLowerCase().includes("expert")) return "Expert";
  return level.substring(0, 12);
}

export function ContactListRow({ contact, onClick, variant }: ContactListRowProps) {
  const location = [contact.city, contact.state].filter(Boolean).join(", ");
  const { hasNote } = useContactNotes();
  const contactHasNote = hasNote(contact.recordId);
  const hasFeedback = hasEventFeedback(contact);
  const hasBuildDay = hasBuildDayData(contact);

  if (variant === "compact") {
    return (
      <div
        className="group flex items-center gap-3 px-4 py-2 bg-card/60 hover:bg-card border-b border-border/30 cursor-pointer transition-colors"
        onClick={onClick}
      >
        <Avatar className={`h-8 w-8 bg-gradient-to-br ${getAiLevelGradient(contact.aiExperienceLevel)} shrink-0`}>
          <AvatarFallback className="bg-transparent text-foreground text-xs font-semibold">
            {getContactInitials(contact)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <span className="font-medium text-foreground truncate min-w-[120px] max-w-[180px]">
            {getDisplayName(contact)}
          </span>
          <span className="text-sm text-muted-foreground truncate hidden sm:block max-w-[200px]">
            {contact.email}
          </span>
          <span className="text-sm text-muted-foreground truncate hidden md:block max-w-[120px]">
            {location}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {contact.lifecycleStage && (
            <Badge variant="outline" className="text-xs hidden lg:flex">
              {contact.lifecycleStage}
            </Badge>
          )}
          {hasFeedback && <Star className="h-3.5 w-3.5 text-gold" />}
          {hasBuildDay && <Hammer className="h-3.5 w-3.5 text-chart-purple" />}
          {contactHasNote && <StickyNote className="h-3.5 w-3.5 text-gold" />}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    );
  }

  // List variant (more detailed)
  return (
    <div
      className="group flex items-center gap-4 px-4 py-3 bg-card/80 hover:bg-card border border-border/30 rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      <Avatar className={`h-10 w-10 bg-gradient-to-br ${getAiLevelGradient(contact.aiExperienceLevel)} shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all`}>
        <AvatarFallback className="bg-transparent text-foreground font-semibold">
          {getContactInitials(contact)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">
        {/* Name & ID */}
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {getDisplayName(contact)}
          </div>
          <div className="text-xs text-muted-foreground font-mono truncate">
            {contact.uid || `ID: ${contact.recordId}`}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="min-w-0 hidden sm:block">
          {contact.email && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {/* Location & Company */}
        <div className="min-w-0 hidden lg:block">
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {(contact.jobTitle || contact.companyName) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[contact.jobTitle, contact.companyName].filter(Boolean).join(" @ ")}
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1 hidden lg:flex">
          {contact.lifecycleStage && (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {contact.lifecycleStage}
            </Badge>
          )}
          {contact.aiExperienceLevel && (
            <Badge className={`text-xs bg-gradient-to-r ${getAiLevelGradient(contact.aiExperienceLevel)} text-foreground border-0`}>
              {getShortAiLevel(contact.aiExperienceLevel)}
            </Badge>
          )}
        </div>
      </div>

      {/* Right Side Indicators */}
      <div className="flex items-center gap-2 shrink-0">
        {hasFeedback && (
          <Badge className="text-xs bg-gold/20 text-gold border-gold/30 hidden md:flex">
            <Star className="h-3 w-3" />
          </Badge>
        )}
        {hasBuildDay && (
          <Badge className="text-xs bg-chart-purple/20 text-chart-purple border-chart-purple/30 hidden md:flex">
            <Hammer className="h-3 w-3" />
          </Badge>
        )}
        {contactHasNote && (
          <Badge className="text-xs bg-gold/20 text-gold border-gold/30 hidden md:flex">
            <StickyNote className="h-3 w-3" />
          </Badge>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

export function ContactListRowSkeleton({ variant }: { variant: "list" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/30 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="flex-1 flex items-center gap-4">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-48 hidden sm:block" />
        </div>
        <div className="h-5 bg-muted rounded w-16" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 border border-border/30 rounded-lg animate-pulse">
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1 grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="space-y-2 hidden sm:block">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
        <div className="space-y-2 hidden lg:block">
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
        <div className="flex gap-1 hidden lg:flex">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-20" />
        </div>
      </div>
    </div>
  );
}
