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
import { AIInsightsPanel } from "./AIInsightsPanel";
import { PresentationMode } from "@/components/presentation/PresentationMode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, Printer, MessageSquare, Folder, Settings, Presentation } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactTags } from "@/hooks/useContactTags";
import { getFiltersFromUrl, serializeFilters } from "@/lib/urlState";
import { openPrintView } from "./PrintableReport";
import { fuzzySearchFields } from "@/lib/fuzzySearch";
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

const TAGLINES = [
  "Manage your community contacts",
  "When In Doubt Email Smiley! 😉",
  "Warning: May cause excessive organization 📋",
  "Your people. Your data. 🚀"
];

export default function CRMDashboard() {
  const { contacts, loading, error, addContacts, mergeContacts } = useContacts();
  const { getAllUniqueTags, getContactsWithTag } = useContactTags();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineFading, setTaglineFading] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  
  // Rotate tagline every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFading(true);
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
        setTaglineFading(false);
      }, 300);
    }, 20000);
    return () => clearInterval(interval);
  }, []);
  
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

  // Filter contacts including tag-based filtering with fuzzy search
  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    // Apply standard filters via hook
    result = result.filter((contact) => {
      // Search filter with fuzzy matching
      if (filters.search) {
        const { matches } = fuzzySearchFields(filters.search, [
          contact.uid,
          contact.firstName,
          contact.lastName,
          contact.fullName,
          contact.email,
          contact.phone,
          contact.recordId,
          contact.companyName,
        ], 0.3);
        if (!matches) return false;
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
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="animate-fade-in">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/50 to-accent/10 border border-border/50 p-4 sm:p-6">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 border border-border/50 shadow-sm">
                      <img src={btsLogo} alt="Black Tech Street" className="h-7 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                      Contact CRM
                    </h1>
                    <p className={`text-xs sm:text-sm text-muted-foreground hidden sm:flex items-center gap-1.5 mt-0.5 transition-opacity duration-300 ${taglineFading ? 'opacity-0' : 'opacity-100'}`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {TAGLINES[taglineIndex]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ThemeToggle />
                <div className="hidden sm:flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowPresentationMode(true)}
                      className="gap-2 bg-primary/10 backdrop-blur-sm hover:bg-primary/20 border-primary/30 text-primary transition-all duration-200"
                    >
                      <Presentation className="h-4 w-4" />
                      <span className="hidden md:inline">Present</span>
                    </Button>
                    <ShareReportButton filters={filters} />
                    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200">
                      <Printer className="h-4 w-4" />
                      <span className="hidden md:inline">Print</span>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200">
                      <Link to="/auth">
                        <Settings className="h-4 w-4" />
                        <span className="hidden md:inline">Admin</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Action buttons row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                <div className="flex items-center gap-2 bg-background/40 backdrop-blur-sm rounded-lg p-1.5 border border-border/30">
                  <DeduplicationModal contacts={contacts} onMerge={handleMergeContacts} />
                  <ImportContactsModal onImport={handleImportContacts} />
                  <ExportModal contacts={contacts} filteredContacts={filteredContacts} />
                </div>
                <div className="sm:hidden flex items-center gap-2 ml-auto">
                  <ShareReportButton filters={filters} />
                  <Button variant="outline" size="sm" onClick={handlePrint} className="bg-background/50">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full grid-cols-5 bg-secondary/50 h-auto p-1">
            <TabsTrigger value="overview" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Folder className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <ExecutiveSummary 
              contacts={contacts} 
              onNavigateToContacts={(partialFilters) => {
                setFilters(prev => ({ ...prev, ...partialFilters }));
                setActiveTab("contacts");
              }}
            />
            <AIInsightsPanel contacts={contacts} />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <QuickStats contacts={contacts} />

            {/* Event Filter Toggles + Tag Filter */}
            <div className="bg-card/50 border border-border/30 rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider font-medium">
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
                <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4">
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider font-medium">
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

      {/* Presentation Mode Overlay */}
      {showPresentationMode && (
        <PresentationMode 
          contacts={contacts} 
          onExit={() => setShowPresentationMode(false)} 
        />
      )}
    </div>
  );
}
