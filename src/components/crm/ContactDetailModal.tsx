import { useState, useEffect } from "react";
import { Contact } from "@/types/contact";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  User,
  Brain,
  Copy,
  ExternalLink,
  Briefcase,
  Sparkles,
  MessageSquareQuote,
  Hammer,
  Users,
  Star,
  Lightbulb,
  Target,
  StickyNote,
  Linkedin,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useContactNotes } from "@/hooks/useContactNotes";

interface ContactDetailModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ 
  icon: Icon, 
  label, 
  value, 
  copyable = false,
  highlight = false,
}: { 
  icon: any; 
  label: string; 
  value: string; 
  copyable?: boolean;
  highlight?: boolean;
}) {
  if (!value || value === 'nan' || value === 'NaN') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  return (
    <div className={`flex items-start gap-3 py-3 px-3 rounded-lg transition-all ${
      highlight ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
    }`}>
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-sm mt-0.5 break-words ${highlight ? 'text-foreground font-medium' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
      {copyable && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 shrink-0 hover:bg-primary/20 hover:text-primary transition-colors" 
          onClick={handleCopy}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

function QuoteCard({ quote, label }: { quote: string; label: string }) {
  if (!quote || quote === 'nan') return null;
  
  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 overflow-hidden">
      <div className="absolute top-2 left-3 text-primary/30">
        <MessageSquareQuote className="h-8 w-8" />
      </div>
      <div className="relative z-10 pt-6">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">{label}</p>
        <p className="text-sm text-foreground italic leading-relaxed">"{quote}"</p>
      </div>
    </div>
  );
}

function StatBadge({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  if (!value || value === 'nan') return null;
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 px-1">
      {Icon && <Icon className="h-4 w-4 text-primary" />}
      <span className="text-gradient-primary">{children}</span>
    </h4>
  );
}

export function ContactDetailModal({ contact, open, onOpenChange }: ContactDetailModalProps) {
  const { getNote, setNote } = useContactNotes();
  const [noteValue, setNoteValue] = useState("");
  
  useEffect(() => {
    if (contact) {
      setNoteValue(getNote(contact.recordId));
    }
  }, [contact, getNote]);

  if (!contact) return null;

  const handleSaveNote = () => {
    setNote(contact.recordId, noteValue);
    toast({ title: "Note saved!", description: "Your note has been saved" });
  };

  const getInitials = () => {
    const first = contact.firstName?.[0] || '';
    const last = contact.lastName?.[0] || '';
    return (first + last).toUpperCase() || "?";
  };

  const location = [contact.city, contact.state, contact.country]
    .filter(Boolean)
    .join(", ");

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'nan') return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const hasEventFeedback = !!(
    contact.npsScore || 
    contact.ahaMoment || 
    contact.favoritePart || 
    contact.optionalQuote
  );

  const hasBuildDay = !!(
    contact.teamBuildDescription || 
    contact.aiToolsUsed || 
    contact.rolesOnTeam
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] glass-card border-primary/20 p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="relative p-6 pb-4 gradient-mesh">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card pointer-events-none" />
          <DialogHeader className="relative z-10">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/50 ring-offset-2 ring-offset-card glow-subtle">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-1">
                <DialogTitle className="text-2xl font-display font-bold text-foreground">
                  {contact.fullName || `${contact.firstName} ${contact.lastName}`.trim() || "Unknown Contact"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-mono mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-secondary/80 text-primary">
                    {contact.uid || `ID: ${contact.recordId}`}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:text-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(contact.uid || contact.recordId);
                      toast({ title: "Copied!", description: "UID copied to clipboard" });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {contact.lifecycleStage && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                      {contact.lifecycleStage}
                    </Badge>
                  )}
                  {contact.aiExperienceLevel && (
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {contact.aiExperienceLevel.includes(":") 
                        ? contact.aiExperienceLevel.split(":")[0] 
                        : contact.aiExperienceLevel.substring(0, 20)}
                    </Badge>
                  )}
                  {hasEventFeedback && (
                    <Badge className="bg-gold/20 text-gold border-gold/30">
                      <Star className="h-3 w-3 mr-1" />
                      Has Feedback
                    </Badge>
                  )}
                  {hasBuildDay && (
                    <Badge className="bg-chart-purple/20 text-chart-purple border-chart-purple/30">
                      <Hammer className="h-3 w-3 mr-1" />
                      Build Day
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="flex flex-col gap-2">
                {contact.linkedinUrl && (
                  <Button 
                    size="sm" 
                    className="gap-2 bg-[#0077b5] hover:bg-[#006396] text-foreground"
                    onClick={() => window.open(contact.linkedinUrl, '_blank')}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                )}
                {contact.email && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-2 border-primary/30 hover:bg-primary/10"
                    onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <Tabs defaultValue="overview" className="px-6 pb-6">
          <TabsList className="grid grid-cols-5 w-full bg-secondary/50 p-1 mb-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Feedback
            </TabsTrigger>
            <TabsTrigger value="buildday" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Build Day
            </TabsTrigger>
            <TabsTrigger value="demographics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Demographics
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Notes
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[380px]">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="m-0 space-y-6 animate-fade-in">
              {/* Contact Info */}
              <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                <InfoRow icon={Mail} label="Email" value={contact.email} copyable highlight />
                <InfoRow icon={Phone} label="Phone" value={contact.phone} copyable />
                <InfoRow icon={MapPin} label="Location" value={location} />
              </div>

              {/* Professional */}
              <div>
                <SectionTitle icon={Briefcase}>Professional</SectionTitle>
                <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                  <InfoRow icon={Briefcase} label="Job Title" value={contact.jobTitle} />
                  <InfoRow icon={Building2} label="Company" value={contact.companyName} />
                  <InfoRow icon={Target} label="Industry" value={contact.industry} />
                  <InfoRow icon={User} label="Current Role" value={contact.currentRole} />
                </div>
              </div>

              {/* AI Experience */}
              <div>
                <SectionTitle icon={Brain}>AI Profile</SectionTitle>
                <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                  <InfoRow icon={Brain} label="AI Experience Level" value={contact.aiExperienceLevel} highlight />
                  <InfoRow icon={Star} label="AI Confidence (1-5)" value={contact.aiConfidence} />
                  <InfoRow icon={Lightbulb} label="Pre-Workshop Mindset" value={contact.preWorkshopMindset} />
                  <InfoRow icon={Sparkles} label="Post-Workshop Mindset" value={contact.postWorkshopMindset} />
                </div>
              </div>
            </TabsContent>

            {/* FEEDBACK TAB */}
            <TabsContent value="feedback" className="m-0 space-y-6 animate-fade-in">
              {/* NPS and Key Stats */}
              <div className="flex flex-wrap gap-3">
                <StatBadge value={contact.npsScore} label="NPS Score" icon={Star} />
                <StatBadge value={contact.postEventAIConfidence} label="Post-Event Confidence" icon={Sparkles} />
                <StatBadge value={contact.responsibleAIPreparedness} label="AI Preparedness" icon={CheckCircle} />
              </div>

              {/* Quotes & Insights */}
              <div className="space-y-4">
                <QuoteCard quote={contact.optionalQuote} label="Their Quote About the Experience" />
                <QuoteCard quote={contact.ahaMoment} label="Biggest Aha Moment" />
                <QuoteCard quote={contact.favoritePart} label="Favorite Part" />
                <QuoteCard quote={contact.oneWayToUseAI} label="How They Plan to Use AI" />
              </div>

              {/* More Feedback Data */}
              <div>
                <SectionTitle icon={MessageSquareQuote}>More Feedback</SectionTitle>
                <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                  <InfoRow icon={Lightbulb} label="New Concept Learned" value={contact.newConceptLearned} />
                  <InfoRow icon={Target} label="After Event Opportunities" value={contact.afterEventOpportunities} />
                  <InfoRow icon={Brain} label="AI Task Understanding" value={contact.aiTaskUnderstanding} />
                  <InfoRow icon={Star} label="Strongest Skill After Today" value={contact.strongestSkillAfterToday} />
                  <InfoRow icon={MessageSquareQuote} label="Wish We Covered More" value={contact.wishCoveredMore} />
                </div>
              </div>
            </TabsContent>

            {/* BUILD DAY TAB */}
            <TabsContent value="buildday" className="m-0 space-y-6 animate-fade-in">
              {hasBuildDay ? (
                <>
                  {/* What They Built */}
                  {contact.teamBuildDescription && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-chart-purple/10 via-accent/5 to-transparent border border-chart-purple/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Hammer className="h-5 w-5 text-chart-purple" />
                        <h4 className="font-semibold text-foreground">What Their Team Built</h4>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{contact.teamBuildDescription}</p>
                    </div>
                  )}

                  {/* Tools & Roles */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h5 className="font-medium text-foreground text-sm">AI Tools Used</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.aiToolsUsed || "Not specified"}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-accent" />
                        <h5 className="font-medium text-foreground text-sm">Roles on Team</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.rolesOnTeam || "Not specified"}</p>
                    </div>
                  </div>

                  {/* More Build Day Data */}
                  <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                    <InfoRow icon={Target} label="Team Impact" value={contact.teamImpact} />
                    <InfoRow icon={Users} label="Knew Team Before?" value={contact.knewTeamBefore} />
                    <InfoRow icon={CheckCircle} label="Space Felt Welcoming?" value={contact.spaceFeltWelcoming} />
                    <InfoRow icon={Brain} label="Bias Responsibility" value={contact.biasResponsibility} />
                    <InfoRow icon={Target} label="Community Design" value={contact.teamCommunityDesign} />
                    <InfoRow icon={Calendar} label="Would Attend Follow-up?" value={contact.attendFollowUp} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                    <Hammer className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No Build Day Data</h3>
                  <p className="text-sm text-muted-foreground">
                    This contact hasn't participated in a Build Day event yet.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* DEMOGRAPHICS TAB */}
            <TabsContent value="demographics" className="m-0 space-y-6 animate-fade-in">
              <div>
                <SectionTitle icon={User}>Personal Information</SectionTitle>
                <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                  <InfoRow icon={User} label="Age Range" value={contact.ageRange} highlight />
                  <InfoRow icon={DollarSign} label="Income Range" value={contact.incomeRange} />
                  <InfoRow icon={MapPin} label="City" value={contact.city} />
                  <InfoRow icon={MapPin} label="State" value={contact.state} />
                  <InfoRow icon={MapPin} label="Postal Code" value={contact.postalCode} />
                  <InfoRow icon={MapPin} label="Country" value={contact.country} />
                </div>
              </div>

              <div>
                <SectionTitle icon={Calendar}>CRM Timeline</SectionTitle>
                <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                  <InfoRow icon={Calendar} label="Created" value={formatDate(contact.createDate) || ''} />
                  <InfoRow icon={Calendar} label="Last Activity" value={formatDate(contact.lastActivityDate) || ''} />
                  <InfoRow icon={Calendar} label="Last Modified" value={formatDate(contact.lastModifiedDate) || ''} />
                </div>
              </div>

              <div>
                <SectionTitle icon={Target}>Program Participation</SectionTitle>
                <div className="grid gap-1 bg-secondary/30 rounded-xl p-2 border border-border/50">
                  <InfoRow icon={Calendar} label="Events Attended" value={contact.eventsAttended} highlight />
                  <InfoRow icon={Calendar} label="Sept 27th Registration" value={contact.sept27thReg} />
                  <InfoRow icon={Brain} label="Cohort 1 AI Level" value={contact.cohort1AiLevel} />
                  <InfoRow icon={Building2} label="Cohort 1 Industry" value={contact.cohort1Industry} />
                  <InfoRow icon={Users} label="Volunteer Interest" value={contact.volunteerInterest} />
                  <InfoRow icon={MessageSquareQuote} label="Community Involvement" value={contact.communityInvolvement} />
                </div>
              </div>
            </TabsContent>

            {/* NOTES TAB */}
            <TabsContent value="notes" className="m-0 space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-gold/5 via-transparent to-transparent border border-gold/20">
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote className="h-5 w-5 text-gold" />
                  <h4 className="font-semibold text-foreground">Personal Notes</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add private notes about this contact. Notes are saved locally in your browser.
                </p>
                <Textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Add notes about this contact... (e.g., follow-up needed, interesting project idea, connection opportunities)"
                  className="min-h-[150px] bg-card/50 border-border/50 focus:border-gold/50 resize-none"
                />
                <Button 
                  onClick={handleSaveNote}
                  className="mt-3 bg-gold hover:bg-gold/90 text-gold-foreground"
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
