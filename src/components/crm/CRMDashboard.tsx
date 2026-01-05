import { useState, useCallback, useMemo, useEffect } from "react";
import { useContacts, useFilteredContacts, getUniqueValues } from "@/hooks/useContacts";
import { ContactFilter, SavedSearch, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay, Contact } from "@/types/contact";
import { ContactSearchBar } from "./ContactSearchBar";
import { ContactList } from "./ContactList";
import { QuickStats } from "./QuickStats";
import { EventFilterToggles, EventFilters } from "./EventFilterToggles";
import { ExportModal } from "./ExportModal";
import { ImportContactsModal } from "./ImportContactsModal";
import { DeduplicationModal } from "./DeduplicationModal";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { SavedReports } from "./SavedReports";
import { ShareReportButton } from "./ShareReportButton";
import { TagFilter } from "./TagFilter";
import { FeedbackDashboard } from "./FeedbackDashboard";
import { ProjectsDashboard } from "./ProjectsDashboard";
import { ContactDetailModal } from "./ContactDetailModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, Printer, MessageSquare, Folder } from "lucide-react";
import { useContactTags } from "@/hooks/useContactTags";
import { getFiltersFromUrl, serializeFilters } from "@/lib/urlState";
import { openPrintView } from "./PrintableReport";
import btsLogo from "@/assets/black-tech-street-logo.png";

// CRM Dashboard v2 - Event Attendee Focus

const defaultFilters: ContactFilter = {
  search: "",
  lifecycleStage: [],
  aiExperienceLevel: [],
  ageRange: [],
  incomeRange: [],
  cohort: [],
  tags: [],
  eventAttendeesOnly: false,
  buildDayOnly: false,
  dec6Workshop: false,
  dec13LTF: false,
  sept27BuildDay: false,
  hasFeedback: false,
  hasProject: false,
};

export default function CRMDashboard() {
  const { contacts, loading, error, addContacts, mergeContacts } = useContacts();
  const { getAllUniqueTags, getContactsWithTag } = useContactTags();
  const [filters, setFilters] = useState<ContactFilter>(() => {
    // Check URL for shared filters
    const urlFilters = getFiltersFromUrl();
    if (urlFilters) {
      return { ...defaultFilters, ...urlFilters };
    }
    return defaultFilters;
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem("crm-saved-searches");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedContactEmail, setSelectedContactEmail] = useState<string | null>(null);

  // Find contact by email for modal
  const selectedContact = useMemo(() => {
    if (!selectedContactEmail) return null;
    return contacts.find(c => c.email?.toLowerCase() === selectedContactEmail.toLowerCase()) || null;
  }, [contacts, selectedContactEmail]);

  const handleContactClick = useCallback((email: string) => {
    setSelectedContactEmail(email);
  }, []);

  // Sync filters to URL (debounced)
  useEffect(() => {
    const encoded = serializeFilters(filters);
    const url = new URL(window.location.href);
    if (encoded) {
      url.searchParams.set("filters", encoded);
    } else {
      url.searchParams.delete("filters");
    }
    window.history.replaceState({}, "", url.toString());
  }, [filters]);

  // Filter contacts including tag-based filtering
  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    // Apply standard filters via hook
    result = result.filter((contact) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchMatch = 
          contact.uid?.toLowerCase().includes(searchLower) ||
          contact.firstName?.toLowerCase().includes(searchLower) ||
          contact.lastName?.toLowerCase().includes(searchLower) ||
          contact.fullName?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.phone?.includes(filters.search) ||
          contact.recordId?.includes(filters.search);
        if (!searchMatch) return false;
      }

      // Lifecycle stage filter
      if (filters.lifecycleStage.length > 0) {
        if (!filters.lifecycleStage.includes(contact.lifecycleStage)) return false;
      }

      // AI Experience filter
      if (filters.aiExperienceLevel.length > 0) {
        const hasMatch = filters.aiExperienceLevel.some(level => 
          contact.aiExperienceLevel?.toLowerCase().includes(level.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      // Age range filter
      if (filters.ageRange.length > 0) {
        if (!filters.ageRange.includes(contact.ageRange)) return false;
      }

      // Income range filter  
      if (filters.incomeRange.length > 0) {
        if (!filters.incomeRange.includes(contact.incomeRange)) return false;
      }

      // Event-specific filters
      if (filters.dec6Workshop && !isDec6Workshop(contact)) return false;
      if (filters.dec13LTF && !isDec13LTF(contact)) return false;
      if (filters.sept27BuildDay && !isSept27BuildDay(contact)) return false;
      if (filters.hasFeedback && !hasEventFeedback(contact)) return false;
      if (filters.hasProject && !hasBuildDayData(contact)) return false;

      return true;
    });

    // Apply tag filter
    if (filters.tags.length > 0) {
      const contactsWithSelectedTags = new Set<string>();
      filters.tags.forEach(tag => {
        getContactsWithTag(tag).forEach(id => contactsWithSelectedTags.add(id));
      });
      result = result.filter(c => contactsWithSelectedTags.has(c.recordId));
    }

    return result;
  }, [contacts, filters, getContactsWithTag]);

  // Get unique values for filters
  const uniqueLifecycleStages = useMemo(() => getUniqueValues(contacts, "lifecycleStage"), [contacts]);
  const uniqueAiLevels = useMemo(() => getUniqueValues(contacts, "aiExperienceLevel"), [contacts]);
  const uniqueAgeRanges = useMemo(() => getUniqueValues(contacts, "ageRange"), [contacts]);
  const uniqueIncomeRanges = useMemo(() => getUniqueValues(contacts, "incomeRange"), [contacts]);
  const allTags = useMemo(() => getAllUniqueTags(), [getAllUniqueTags]);

  // Event filter counts
  const eventCounts = useMemo(() => ({
    dec6Workshop: contacts.filter(c => isDec6Workshop(c)).length,
    dec13LTF: contacts.filter(c => isDec13LTF(c)).length,
    sept27BuildDay: contacts.filter(c => isSept27BuildDay(c)).length,
    hasFeedback: contacts.filter(c => hasEventFeedback(c)).length,
    hasProject: contacts.filter(c => hasBuildDayData(c)).length,
  }), [contacts]);

  const handleSaveSearch = useCallback((name: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem("crm-saved-searches", JSON.stringify(updated));
  }, [filters, savedSearches]);

  const handleLoadSearch = useCallback((search: SavedSearch) => {
    setFilters(search.filters);
  }, []);

  const handleDeleteSearch = useCallback((id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem("crm-saved-searches", JSON.stringify(updated));
  }, [savedSearches]);

  const handleEventFiltersChange = useCallback((eventFilters: EventFilters) => {
    setFilters(prev => ({
      ...prev,
      ...eventFilters,
    }));
  }, []);

  const handleTagsChange = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, tags }));
  }, []);

  const handleImportContacts = useCallback((newContacts: Contact[]) => {
    addContacts(newContacts);
  }, [addContacts]);

  const handleMergeContacts = useCallback((merged: Contact, removedIds: string[]) => {
    mergeContacts(merged, removedIds);
  }, [mergeContacts]);

  const handleLoadReport = useCallback((reportFilters: ContactFilter) => {
    setFilters(reportFilters);
    setActiveTab("contacts");
  }, []);

  const handlePrint = useCallback(() => {
    openPrintView(filteredContacts, filters, "Contact Report");
  }, [filteredContacts, filters]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md p-6 rounded-xl bg-card border border-border">
          <p className="text-destructive">Error loading contacts: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <img src={btsLogo} alt="Black Tech Street" className="h-10 w-auto hover-scale" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Contact CRM
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your community contacts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareReportButton filters={filters} />
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <ThemeToggle />
            <DeduplicationModal contacts={contacts} onMerge={handleMergeContacts} />
            <ImportContactsModal onImport={handleImportContacts} />
            <ExportModal contacts={contacts} filteredContacts={filteredContacts} />
          </div>
        </header>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-secondary/50">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Folder className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <ExecutiveSummary 
              contacts={contacts} 
              onNavigateToContacts={(partialFilters) => {
                setFilters(prev => ({ ...prev, ...partialFilters }));
                setActiveTab("contacts");
              }}
            />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-6 space-y-6">
            {/* Quick Stats */}
            <QuickStats contacts={contacts} />

            {/* Event Filter Toggles + Tag Filter */}
            <div className="bg-card/50 border border-border/30 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    Filter by Event
                  </p>
                  <EventFilterToggles
                    filters={{
                      dec6Workshop: filters.dec6Workshop,
                      dec13LTF: filters.dec13LTF,
                      sept27BuildDay: filters.sept27BuildDay,
                      hasFeedback: filters.hasFeedback,
                      hasProject: filters.hasProject,
                    }}
                    onFiltersChange={handleEventFiltersChange}
                    counts={eventCounts}
                  />
                </div>
                <div className="border-l border-border pl-4">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    Filter by Tags
                  </p>
                  <TagFilter
                    selectedTags={filters.tags}
                    allTags={allTags}
                    onChange={handleTagsChange}
                  />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <ContactSearchBar
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={contacts.length}
              filteredCount={filteredContacts.length}
              uniqueLifecycleStages={uniqueLifecycleStages}
              uniqueAiLevels={uniqueAiLevels}
              uniqueAgeRanges={uniqueAgeRanges}
              uniqueIncomeRanges={uniqueIncomeRanges}
              savedSearches={savedSearches}
              onSaveSearch={handleSaveSearch}
              onLoadSearch={handleLoadSearch}
              onDeleteSearch={handleDeleteSearch}
            />

            {/* Contact List */}
            <ContactList
              contacts={filteredContacts}
              loading={loading}
              filters={filters}
            />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="mt-6">
            <FeedbackDashboard 
              contacts={contacts}
              onContactClick={handleContactClick}
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <ProjectsDashboard 
              contacts={contacts}
              onContactClick={handleContactClick}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <SavedReports 
              contacts={contacts} 
              currentFilters={filters} 
              onLoadReport={handleLoadReport}
            />
          </TabsContent>
        </Tabs>

        {/* Contact Detail Modal for feedback/project links */}
        <ContactDetailModal
          contact={selectedContact}
          open={!!selectedContact}
          onOpenChange={(open) => !open && setSelectedContactEmail(null)}
        />
      </div>
    </div>
  );
}
