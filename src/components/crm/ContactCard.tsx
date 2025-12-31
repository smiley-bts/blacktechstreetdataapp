import { Contact, hasEventFeedback, hasBuildDayData, getDisplayName, getContactInitials, hasValidDisplayName } from "@/types/contact";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Building2, ChevronRight, Star, Hammer, StickyNote } from "lucide-react";
import { useContactNotes } from "@/hooks/useContactNotes";
import { useNameOverrides } from "@/hooks/useNameOverrides";
import { NameQualityBadge } from "./NameQualityBadge";

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
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

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const location = [contact.city, contact.state].filter(Boolean).join(", ");
  const { hasNote } = useContactNotes();
  const { getOverride, hasOverride } = useNameOverrides();
  const contactHasNote = hasNote(contact.recordId);
  const hasFeedback = hasEventFeedback(contact);
  const hasBuildDay = hasBuildDayData(contact);
  const nameOverride = getOverride(contact.recordId);
  const displayName = nameOverride || getDisplayName(contact);

  return (
    <Card 
      className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer card-shine"
      onClick={onClick}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start gap-3">
          <Avatar className={`h-12 w-12 bg-gradient-to-br ${getAiLevelGradient(contact.aiExperienceLevel)} shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all`}>
            <AvatarFallback className="bg-transparent text-foreground font-semibold">
              {getContactInitials(contact)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                    {displayName}
                  </h3>
                  <NameQualityBadge contact={contact} hasOverride={hasOverride(contact.recordId)} />
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {contact.uid || `ID: ${contact.recordId}`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 relative">
        {/* Contact Info */}
        <div className="space-y-1.5 text-sm">
          {contact.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{location}</span>
            </div>
          )}
          {(contact.jobTitle || contact.companyName) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {[contact.jobTitle, contact.companyName].filter(Boolean).join(" @ ")}
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
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
          {hasFeedback && (
            <Badge className="text-xs bg-gold/20 text-gold border-gold/30">
              <Star className="h-3 w-3 mr-1" />
              Feedback
            </Badge>
          )}
          {hasBuildDay && (
            <Badge className="text-xs bg-chart-purple/20 text-chart-purple border-chart-purple/30">
              <Hammer className="h-3 w-3 mr-1" />
              Build Day
            </Badge>
          )}
          {contactHasNote && (
            <Badge className="text-xs bg-gold/20 text-gold border-gold/30">
              <StickyNote className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContactCardSkeleton() {
  return (
    <Card className="animate-pulse bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
