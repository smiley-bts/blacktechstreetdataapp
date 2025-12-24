import { Contact } from "@/types/contact";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Building2, Eye, ChevronRight } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
}

const aiLevelColors: Record<string, string> = {
  "beginner": "bg-blue-500",
  "emerging": "bg-cyan-500",
  "intermediate": "bg-emerald-500",
  "advanced": "bg-purple-500",
  "expert": "bg-pink-500",
};

const lifecycleColors: Record<string, string> = {
  "lead": "bg-amber-500",
  "subscriber": "bg-blue-500",
  "opportunity": "bg-emerald-500",
  "customer": "bg-primary",
  "evangelist": "bg-pink-500",
};

function getAiLevelColor(level: string): string {
  const lowerLevel = level.toLowerCase();
  for (const [key, color] of Object.entries(aiLevelColors)) {
    if (lowerLevel.includes(key)) return color;
  }
  return "bg-muted";
}

function getLifecycleColor(stage: string): string {
  const lowerStage = stage.toLowerCase();
  for (const [key, color] of Object.entries(lifecycleColors)) {
    if (lowerStage.includes(key)) return color;
  }
  return "bg-muted";
}

function getInitials(contact: Contact): string {
  const first = contact.firstName?.[0] || '';
  const last = contact.lastName?.[0] || '';
  if (first || last) return (first + last).toUpperCase();
  if (contact.email) return contact.email[0].toUpperCase();
  return "?";
}

function getShortAiLevel(level: string): string {
  if (level.toLowerCase().includes("beginner")) return "Beginner";
  if (level.toLowerCase().includes("emerging")) return "Emerging";
  if (level.toLowerCase().includes("intermediate")) return "Intermediate";
  if (level.toLowerCase().includes("advanced")) return "Advanced";
  if (level.toLowerCase().includes("expert")) return "Expert";
  return level.substring(0, 15);
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const location = [contact.city, contact.state].filter(Boolean).join(", ");

  return (
    <Card 
      className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className={`h-12 w-12 ${getAiLevelColor(contact.aiExperienceLevel)} shrink-0`}>
            <AvatarFallback className="bg-transparent text-white font-semibold">
              {getInitials(contact)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground leading-tight">
                  {contact.fullName || `${contact.firstName} ${contact.lastName}`.trim() || "Unknown"}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {contact.uid || `ID: ${contact.recordId}`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
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
                {[contact.jobTitle, contact.companyName].filter(Boolean).join(" at ")}
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {contact.lifecycleStage && (
            <Badge variant="outline" className="text-xs">
              {contact.lifecycleStage}
            </Badge>
          )}
          {contact.aiExperienceLevel && (
            <Badge 
              className={`text-xs ${getAiLevelColor(contact.aiExperienceLevel)} text-white border-0`}
            >
              {getShortAiLevel(contact.aiExperienceLevel)}
            </Badge>
          )}
          {contact.ageRange && (
            <Badge variant="secondary" className="text-xs">
              {contact.ageRange}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContactCardSkeleton() {
  return (
    <Card className="animate-pulse">
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
