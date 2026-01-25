import { useState, useMemo, useCallback } from "react";
import { Contact, ContactFilter, isEventAttendee, hasBuildDayData, hasEventFeedback, hasValidDisplayName, isJune2025Event, isHappyHourAug2025, isSep2025Event, isDec6Workshop, isDec13LTF, isSept27BuildDay } from "@/types/contact";
import { ContactCard, ContactCardSkeleton } from "./ContactCard";
import { ContactListRow, ContactListRowSkeleton } from "./ContactListRow";
import { ContactDetailModal } from "./ContactDetailModal";
import { ViewOptionsBar, ViewMode, SortField, SortDirection } from "./ViewOptionsBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Globe, Calendar, Crown, AlertCircle, CalendarDays, PartyPopper, Hammer, GraduationCap, Presentation } from "lucide-react";
import { getCompletenessScore } from "@/lib/contactCompleteness";
import { useContactTags } from "@/hooks/useContactTags";

interface ContactListProps {
  contacts: Contact[];
  loading: boolean;
  filters: ContactFilter;
}

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  filter: (contact: Contact, getContactsWithTag: (tag: string) => string[]) => boolean;
}

// Primary tabs: All, Website Only, IRL Attendees, Stakeholders
const primaryTabs: TabConfig[] = [
  {
    id: "all",
    label: "All Contacts",
    icon: Users,
    filter: () => true,
  },
  {
    id: "website",
    label: "Website Only",
    icon: Globe,
    filter: (c) => !isEventAttendee(c),
  },
  {
    id: "irl",
    label: "IRL Attendees",
    icon: Calendar,
    filter: (c) => isEventAttendee(c),
  },
  {
    id: "stakeholders",
    label: "Stakeholders",
    icon: Crown,
    filter: (c, getContactsWithTag) => getContactsWithTag("Stakeholder").includes(c.recordId),
  },
];

// Event sub-tabs for IRL Attendees
const eventSubTabs: TabConfig[] = [
  {
    id: "all-irl",
    label: "All IRL",
    icon: Calendar,
    filter: (c) => isEventAttendee(c),
  },
  {
    id: "june-2025",
    label: "June Workshop",
    icon: CalendarDays,
    filter: (c) => isJune2025Event(c),
  },
  {
    id: "happy-hour",
    label: "Happy Hour",
    icon: PartyPopper,
    filter: (c) => isHappyHourAug2025(c),
  },
  {
    id: "sep-2025",
    label: "Sept Build Day",
    icon: Hammer,
    filter: (c) => isSep2025Event(c) || isSept27BuildDay(c),
  },
  {
    id: "dec-workshop",
    label: "Dec Workshop",
    icon: Presentation,
    filter: (c) => isDec6Workshop(c),
  },
  {
    id: "dec-ltf",
    label: "Lead The Future",
    icon: GraduationCap,
    filter: (c) => isDec13LTF(c),
  },
];

function sortContacts(contacts: Contact[], field: SortField, direction: SortDirection): Contact[] {
  return [...contacts].sort((a, b) => {
    // Special handling for completeness sort
    if (field === "completeness") {
      const scoreA = getCompletenessScore(a);
      const scoreB = getCompletenessScore(b);
      return direction === "asc" ? scoreA - scoreB : scoreB - scoreA;
    }

    // First priority: contacts with valid names come first
    const aHasValidName = hasValidDisplayName(a);
    const bHasValidName = hasValidDisplayName(b);
    
    if (aHasValidName && !bHasValidName) return -1;
    if (!aHasValidName && bHasValidName) return 1;

    // Then apply the regular sort within each group
    let valueA: string = "";
    let valueB: string = "";

    switch (field) {
      case "name":
        valueA = (a.fullName || `${a.firstName} ${a.lastName}`).toLowerCase();
        valueB = (b.fullName || `${b.firstName} ${b.lastName}`).toLowerCase();
        break;
      case "email":
        valueA = (a.email || "").toLowerCase();
        valueB = (b.email || "").toLowerCase();
        break;
      case "lifecycleStage":
        valueA = (a.lifecycleStage || "").toLowerCase();
        valueB = (b.lifecycleStage || "").toLowerCase();
        break;
      case "aiExperienceLevel":
        valueA = (a.aiExperienceLevel || "").toLowerCase();
        valueB = (b.aiExperienceLevel || "").toLowerCase();
        break;
      case "city":
        valueA = (a.city || "").toLowerCase();
        valueB = (b.city || "").toLowerCase();
        break;
      case "createdAt":
        valueA = a.createDate || "";
        valueB = b.createDate || "";
        break;
    }

    if (direction === "asc") {
      return valueA.localeCompare(valueB);
    }
    return valueB.localeCompare(valueA);
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function ContactList({ contacts, loading, filters }: ContactListProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [activeEventSubTab, setActiveEventSubTab] = useState("all-irl");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [shuffleKey, setShuffleKey] = useState(0);
  const { getContactsWithTag } = useContactTags();

  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const handleRandomize = useCallback(() => {
    setShuffleKey(prev => prev + 1);
  }, []);

  // Compute tab contacts with stakeholder tag support
  const tabContacts = useMemo(() => {
    const result: Record<string, Contact[]> = {};
    const stakeholderIds = getContactsWithTag("Stakeholder");
    
    // Primary tabs
    primaryTabs.forEach((tab) => {
      let filtered = contacts.filter(c => tab.filter(c, () => stakeholderIds));
      if (shuffleKey > 0) {
        filtered = shuffleArray(filtered);
      } else {
        filtered = sortContacts(filtered, sortField, sortDirection);
      }
      result[tab.id] = filtered;
    });
    
    // Event sub-tabs
    eventSubTabs.forEach((tab) => {
      let filtered = contacts.filter(c => tab.filter(c, () => stakeholderIds));
      if (shuffleKey > 0) {
        filtered = shuffleArray(filtered);
      } else {
        filtered = sortContacts(filtered, sortField, sortDirection);
      }
      result[tab.id] = filtered;
    });
    
    return result;
  }, [contacts, sortField, sortDirection, shuffleKey, getContactsWithTag]);

  // Get current contacts based on active tab
  const currentTabContacts = useMemo(() => {
    if (activeTab === "irl") {
      return tabContacts[activeEventSubTab] || [];
    }
    return tabContacts[activeTab] || [];
  }, [activeTab, activeEventSubTab, tabContacts]);

  const displayLimit = viewMode === "compact" ? 200 : 100;
  const displayContacts = currentTabContacts.slice(0, displayLimit);

  if (loading) {
    return (
      <div className="space-y-4">
        <ViewOptionsBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onRandomize={handleRandomize}
          totalShowing={0}
          totalFiltered={0}
        />
        {viewMode === "cards" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ContactCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={viewMode === "compact" ? "bg-card/50 rounded-lg overflow-hidden" : "space-y-2"}>
            {Array.from({ length: 12 }).map((_, i) => (
              <ContactListRowSkeleton key={i} variant={viewMode === "compact" ? "compact" : "list"} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderContacts = (contactsToRender: Contact[]) => {
    if (contactsToRender.length === 0) {
      const activeTabConfig = [...primaryTabs, ...eventSubTabs].find(t => t.id === (activeTab === "irl" ? activeEventSubTab : activeTab));
      const Icon = activeTabConfig?.icon || Users;
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            No contacts found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      );
    }

    switch (viewMode) {
      case "cards":
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {contactsToRender.map((contact) => (
              <ContactCard
                key={contact.recordId}
                contact={contact}
                onClick={() => setSelectedContact(contact)}
              />
            ))}
          </div>
        );
      case "list":
        return (
          <div className="space-y-2">
            {contactsToRender.map((contact) => (
              <ContactListRow
                key={contact.recordId}
                contact={contact}
                onClick={() => setSelectedContact(contact)}
                variant="list"
              />
            ))}
          </div>
        );
      case "compact":
        return (
          <div className="bg-card/50 rounded-lg overflow-hidden border border-border/30">
            {contactsToRender.map((contact) => (
              <ContactListRow
                key={contact.recordId}
                contact={contact}
                onClick={() => setSelectedContact(contact)}
                variant="compact"
              />
            ))}
          </div>
        );
    }
  };

  return (
    <>
      <div className="space-y-4">
        <ViewOptionsBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onRandomize={handleRandomize}
          totalShowing={displayContacts.length}
          totalFiltered={currentTabContacts.length}
        />

        {/* Primary Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-4 h-auto p-1 bg-muted/50">
            {primaryTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="text-xs opacity-70">
                  ({tabContacts[tab.id]?.length || 0})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Regular tab content */}
          {primaryTabs.filter(t => t.id !== "irl").map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="m-0">
              {renderContacts(tabContacts[tab.id]?.slice(0, displayLimit) || [])}
              {(tabContacts[tab.id]?.length || 0) > displayLimit && (
                <p className="text-center text-sm text-muted-foreground mt-4 py-4 bg-muted/30 rounded-lg">
                  Showing first {displayLimit} of {tabContacts[tab.id]?.length.toLocaleString()} contacts. 
                  Use search/filters to narrow results.
                </p>
              )}
            </TabsContent>
          ))}

          {/* IRL Tab with Event Sub-tabs */}
          <TabsContent value="irl" className="m-0 space-y-4">
            <Tabs value={activeEventSubTab} onValueChange={setActiveEventSubTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-card/50 border border-border/30">
                {eventSubTabs.map((subTab) => (
                  <TabsTrigger
                    key={subTab.id}
                    value={subTab.id}
                    className="flex items-center gap-1.5 text-xs whitespace-nowrap data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    <subTab.icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{subTab.label}</span>
                    <span className="text-[10px] opacity-70">
                      ({tabContacts[subTab.id]?.length || 0})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {eventSubTabs.map((subTab) => (
                <TabsContent key={subTab.id} value={subTab.id} className="m-0 mt-4">
                  {renderContacts(tabContacts[subTab.id]?.slice(0, displayLimit) || [])}
                  {(tabContacts[subTab.id]?.length || 0) > displayLimit && (
                    <p className="text-center text-sm text-muted-foreground mt-4 py-4 bg-muted/30 rounded-lg">
                      Showing first {displayLimit} of {tabContacts[subTab.id]?.length.toLocaleString()} contacts. 
                      Use search/filters to narrow results.
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <ContactDetailModal
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </>
  );
}
