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
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  User,
  Brain,
  Globe,
  Copy,
  ExternalLink,
  Heart,
  Briefcase,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContactDetailModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ icon: Icon, label, value, copyable = false }: { 
  icon: any; 
  label: string; 
  value: string; 
  copyable?: boolean;
}) {
  if (!value || value === 'nan' || value === 'NaN') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words">{value}</p>
      </div>
      {copyable && (
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy}>
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
      {children}
    </h4>
  );
}

export function ContactDetailModal({ contact, open, onOpenChange }: ContactDetailModalProps) {
  if (!contact) return null;

  const getInitials = () => {
    const first = contact.firstName?.[0] || '';
    const last = contact.lastName?.[0] || '';
    return (first + last).toUpperCase() || "?";
  };

  const location = [contact.city, contact.state, contact.postalCode, contact.country]
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
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Get all raw data fields that aren't already mapped
  const additionalFields = Object.entries(contact.rawData || {}).filter(([key, value]) => {
    if (!value || value === '' || value === 'nan' || value === 'NaN') return false;
    // Skip fields we're already showing
    const skipFields = ['Record ID', 'First Name', 'Last Name', 'Email', 'Phone Number', 'City', 'State/Region'];
    return !skipFields.includes(key);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 bg-primary">
              <AvatarFallback className="bg-transparent text-primary-foreground text-xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {contact.fullName || `${contact.firstName} ${contact.lastName}`.trim() || "Unknown Contact"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {contact.uid || `Record ID: ${contact.recordId}`}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {contact.lifecycleStage && (
                  <Badge variant="outline">{contact.lifecycleStage}</Badge>
                )}
                {contact.leadStatus && (
                  <Badge variant="secondary">{contact.leadStatus}</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-profile">AI Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="all-data">All Data</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="overview" className="m-0 space-y-4">
              {/* Contact Info */}
              <div>
                <SectionTitle><User className="h-4 w-4" /> Contact Information</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={Mail} label="Email" value={contact.email} copyable />
                  <InfoRow icon={Phone} label="Phone" value={contact.phone} copyable />
                  <InfoRow icon={MapPin} label="Location" value={location} />
                </div>
              </div>

              {/* Professional */}
              <div>
                <SectionTitle><Briefcase className="h-4 w-4" /> Professional</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={Building2} label="Job Title" value={contact.jobTitle} />
                  <InfoRow icon={Building2} label="Company" value={contact.companyName} />
                  <InfoRow icon={Briefcase} label="Industry" value={contact.industry} />
                  <InfoRow icon={User} label="Current Role" value={contact.currentRole} />
                </div>
              </div>

              {/* Demographics */}
              <div>
                <SectionTitle><User className="h-4 w-4" /> Demographics</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={User} label="Age Range" value={contact.ageRange} />
                  <InfoRow icon={Briefcase} label="Income Range" value={contact.incomeRange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-profile" className="m-0 space-y-4">
              <div>
                <SectionTitle><Brain className="h-4 w-4" /> AI Experience</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={Brain} label="AI Experience Level" value={contact.aiExperienceLevel} />
                  <InfoRow icon={Brain} label="AI Confidence (1-5)" value={contact.aiConfidence} />
                  <InfoRow icon={Brain} label="Pre-Workshop Mindset" value={contact.preWorkshopMindset} />
                  <InfoRow icon={Brain} label="Post-Workshop Mindset" value={contact.postWorkshopMindset} />
                </div>
              </div>

              <div>
                <SectionTitle><Globe className="h-4 w-4" /> Program Participation</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={Calendar} label="Cohort 1 AI Level" value={contact.cohort1AiLevel} />
                  <InfoRow icon={Briefcase} label="Cohort 1 Industry" value={contact.cohort1Industry} />
                  <InfoRow icon={Calendar} label="Events Attended" value={contact.eventsAttended} />
                  <InfoRow icon={Calendar} label="Sept 27th Registration" value={contact.sept27thReg} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="m-0 space-y-4">
              <div>
                <SectionTitle><Calendar className="h-4 w-4" /> Timeline</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={Calendar} label="Created" value={formatDate(contact.createDate) || ''} />
                  <InfoRow icon={Calendar} label="Last Activity" value={formatDate(contact.lastActivityDate) || ''} />
                  <InfoRow icon={Calendar} label="Last Modified" value={formatDate(contact.lastModifiedDate) || ''} />
                </div>
              </div>

              <div>
                <SectionTitle><Heart className="h-4 w-4" /> Community Involvement</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={Heart} label="Community Connection" value={contact.communityInvolvement} />
                  <InfoRow icon={Heart} label="Volunteer Interest" value={contact.volunteerInterest} />
                </div>
              </div>

              <div>
                <SectionTitle><Globe className="h-4 w-4" /> Source</SectionTitle>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <InfoRow icon={Globe} label="Record Source" value={contact.recordSource} />
                  <InfoRow icon={User} label="Contact Owner" value={contact.contactOwner} />
                  <InfoRow icon={Mail} label="Marketing Status" value={contact.marketingContactStatus} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all-data" className="m-0">
              <div className="space-y-1">
                {additionalFields.slice(0, 100).map(([key, value]) => (
                  <div key={key} className="py-2 border-b border-border/50 last:border-0">
                    <p className="text-xs text-muted-foreground">{key}</p>
                    <p className="text-sm text-foreground break-words">{String(value)}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
