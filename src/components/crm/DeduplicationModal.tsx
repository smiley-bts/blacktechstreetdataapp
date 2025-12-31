import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users2,
  Mail,
  Phone,
  User,
  ChevronRight,
  Merge,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Contact, getDisplayName, getContactInitials } from "@/types/contact";
import { useDuplicateDetection, DuplicateGroup, mergeContacts } from "@/hooks/useDuplicateDetection";
import { toast } from "@/hooks/use-toast";

interface DeduplicationModalProps {
  contacts: Contact[];
  onMerge: (merged: Contact, removedIds: string[]) => void;
}

function DuplicateGroupCard({
  group,
  onMerge,
}: {
  group: DuplicateGroup;
  onMerge: (primary: Contact, secondaries: Contact[]) => void;
}) {
  const [selectedPrimary, setSelectedPrimary] = useState<string>(
    group.contacts[0].recordId
  );
  const [expanded, setExpanded] = useState(false);

  const handleMerge = () => {
    const primary = group.contacts.find((c) => c.recordId === selectedPrimary)!;
    const secondaries = group.contacts.filter(
      (c) => c.recordId !== selectedPrimary
    );
    onMerge(primary, secondaries);
  };

  const reasonIcon = {
    "Same email address": <Mail className="h-4 w-4" />,
    "Same phone number": <Phone className="h-4 w-4" />,
    "Similar name": <User className="h-4 w-4" />,
  }[group.reason] || <Users2 className="h-4 w-4" />;

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {group.contacts.slice(0, 3).map((contact, idx) => (
              <Avatar
                key={contact.recordId}
                className="h-8 w-8 border-2 border-card"
                style={{ zIndex: 3 - idx }}
              >
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getContactInitials(contact)}
                </AvatarFallback>
              </Avatar>
            ))}
            {group.contacts.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                +{group.contacts.length - 3}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {group.contacts.length} contacts
              </span>
              <Badge variant="outline" className="text-xs gap-1">
                {reasonIcon}
                {group.reason}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
              {group.matchKey}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </div>

      {expanded && (
        <div className="border-t border-border/50 p-3 space-y-3 bg-secondary/20">
          <p className="text-xs text-muted-foreground">
            Select the primary contact to keep. Data from other contacts will be
            merged into it.
          </p>
          <div className="space-y-2">
            {group.contacts.map((contact) => (
              <div
                key={contact.recordId}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPrimary === contact.recordId
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-secondary/50 border border-transparent"
                }`}
                onClick={() => setSelectedPrimary(contact.recordId)}
              >
                <Checkbox
                  checked={selectedPrimary === contact.recordId}
                  onCheckedChange={() => setSelectedPrimary(contact.recordId)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {getContactInitials(contact)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {getDisplayName(contact)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {contact.email && (
                      <span className="truncate max-w-[150px]">
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && <span>{contact.phone}</span>}
                  </div>
                </div>
                {selectedPrimary === contact.recordId ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    Primary
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Merge
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleMerge} className="w-full gap-2" size="sm">
            <Merge className="h-4 w-4" />
            Merge {group.contacts.length} Contacts
          </Button>
        </div>
      )}
    </div>
  );
}

export function DeduplicationModal({ contacts, onMerge }: DeduplicationModalProps) {
  const [open, setOpen] = useState(false);
  const { duplicateGroups, totalDuplicates } = useDuplicateDetection(contacts);
  const [mergedGroupIds, setMergedGroupIds] = useState<Set<string>>(new Set());

  const remainingGroups = useMemo(
    () => duplicateGroups.filter((g) => !mergedGroupIds.has(g.id)),
    [duplicateGroups, mergedGroupIds]
  );

  const handleMergeGroup = (primary: Contact, secondaries: Contact[]) => {
    let merged = primary;
    secondaries.forEach((secondary) => {
      merged = mergeContacts(merged, secondary);
    });

    const removedIds = secondaries.map((c) => c.recordId);
    onMerge(merged, removedIds);

    // Mark this group as merged
    const groupId = duplicateGroups.find((g) =>
      g.contacts.some((c) => c.recordId === primary.recordId)
    )?.id;
    if (groupId) {
      setMergedGroupIds((prev) => new Set([...prev, groupId]));
    }

    toast({
      title: "Contacts merged!",
      description: `${secondaries.length + 1} contacts merged into one`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Users2 className="h-4 w-4" />
          Dedupe
          {totalDuplicates > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 bg-amber-500 text-amber-950 text-xs">
              {duplicateGroups.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            Duplicate Detection & Merge
          </DialogTitle>
        </DialogHeader>

        {remainingGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              No Duplicates Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Great! Your contact list appears to be clean with no obvious duplicates
              detected.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {remainingGroups.length} potential duplicate{" "}
                  {remainingGroups.length === 1 ? "group" : "groups"} found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Review each group and select a primary contact to merge data
                  into. Other contacts will be removed.
                </p>
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {remainingGroups.map((group) => (
                  <DuplicateGroupCard
                    key={group.id}
                    group={group}
                    onMerge={handleMergeGroup}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
