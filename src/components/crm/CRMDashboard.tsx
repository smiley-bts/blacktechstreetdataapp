import { useState, useCallback, useMemo, useEffect } from "react";
import { useContacts, useFilteredContacts, getUniqueValues } from "@/hooks/useContacts";
import { useEventAutoSync } from "@/hooks/useEventAutoSync";
import { ContactFilter, SavedSearch, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay, isHappyHourAug2025, Contact } from "@/types/contact";
import { ContactSearchBar } from "./ContactSearchBar";
import { ContactList } from "./ContactList";
import { QuickStats } from "./QuickStats";
import { EventFilterToggles, EventFilters } from "./EventFilterToggles";
import { ExportModal } from "./ExportModal";
import { ImportContactsModal } from "./ImportContactsModal";
import { AttendanceImportModal } from "./AttendanceImportModal";
import { DeduplicationModal } from "./DeduplicationModal";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { SavedReports } from "./SavedReports";
import { ShareReportButton } from "./ShareReportButton";
import { TagFilter } from "./TagFilter";
import { FeedbackDashboard } from "./FeedbackDashboard";
import { EventsDashboard } from "./EventsDashboard";
import { ProjectsDashboard } from "./ProjectsDashboard";
import { ContactDetailModal } from "./ContactDetailModal";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { PresentationMode } from "@/components/presentation/PresentationMode";
import { DashboardHero } from "./DashboardHero";
import { openExecutiveReport } from "./ExecutiveReportGenerator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, Printer, MessageSquare, Folder, Settings, Presentation, LogOut, FileBarChart, RefreshCw, FileCheck, CalendarDays, Database, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useContactTags } from "@/hooks/useContactTags";
import { getFiltersFromUrl, serializeFilters } from "@/lib/urlState";
import { openPrintView } from "./PrintableReport";
import { fuzzySearchFields } from "@/lib/fuzzySearch";
import { useAuth } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useFeedback } from "@/hooks/useFeedback";
import { useProjects } from "@/hooks/useProjects";
import { useReleaseForms } from "@/hooks/useReleaseForms";
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
  june2025Event: false,
  happyHourAug2025: false,
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
  const { contacts, loading, error, addContacts, mergeContacts, importing, needsImport, importCsvToDatabase } = useContacts();
  const { syncing, forceSyncAll } = useEventAutoSync(contacts, loading);
  const { syncReleaseFormsToContacts, totalForms, getUnsyncedCount } = useReleaseForms();
  const { getAllUniqueTags, getContactsWithTag } = useContactTags();
  const { user, signOut, profile } = useAuth();
  const { workshopFeedback, buildDayFeedback } = useFeedback();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineFading, setTaglineFading] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);

  // Collect quotes and project names for executive report
  const feedbackQuotes = useMemo(() => {
    const quotes: string[] = [];
    workshopFeedback.forEach(f => {
      if (f.highlightTakeaway && f.sharePermission) {
        quotes.push(f.highlightTakeaway);
      }
    });
    buildDayFeedback.forEach(f => {
      if (f.quote && f.shareQuotePermission) {
        quotes.push(f.quote);
      }
    });
    return quotes.filter(q => q.length > 20 && q.length < 300);
  }, [workshopFeedback, buildDayFeedback]);

  const projectNames = useMemo(() => {
    return projects.map(p => p.projectName).filter(Boolean);
  }, [projects]);

  // Calculate unsynced release forms count based on current contacts
  const unsyncedFormsCount = useMemo(() => {
    return getUnsyncedCount(contacts.map(c => ({
      firstName: c.firstName,
      lastName: c.lastName,
      fullName: c.fullName,
      releaseSigned: c.releaseSigned,
    })));
  }, [contacts, getUnsyncedCount]);

  const handleGenerateExecutiveReport = useCallback(() => {
    openExecutiveReport(contacts, feedbackQuotes, projectNames);
  }, [contacts, feedbackQuotes, projectNames]);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  // Session timeout - auto logout after 30 min inactivity
  useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 2,
    onTimeout: handleLogout,
    enabled: !!user,
  });
  
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
      if (filters.happyHourAug2025 && !isHappyHourAug2025(contact)) return false;
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
    happyHourAug2025: contacts.filter(c => isHappyHourAug2025(c)).length,
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
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/50 to-accent/10 border border-border shadow-sm dark:shadow-none p-4 sm:p-6">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
              {/* Greeting banner for logged in user */}
              {profile && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Welcome back, <span className="text-primary">{profile.display_name}</span>!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You're logged in as {profile.role === 'owner' ? 'Owner' : 'Admin'} • Last login tracked
                    </p>
                  </div>
                </div>
              )}

              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 border border-border shadow-sm">
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
                    {profile && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-foreground">{profile.display_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">({profile.role})</span>
                      </div>
                    )}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateExecutiveReport}
                      className="gap-2 bg-emerald-500/10 backdrop-blur-sm hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-all duration-200"
                    >
                      <FileBarChart className="h-4 w-4" />
                      <span className="hidden md:inline">Executive Report</span>
                    </Button>
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
                    {user && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className="gap-2 bg-destructive/10 backdrop-blur-sm hover:bg-destructive/20 border-destructive/30 text-destructive transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden md:inline">Logout</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action buttons row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                <div className="flex items-center gap-2 bg-background/40 backdrop-blur-sm rounded-lg p-1.5 border border-border/30">
                  <DeduplicationModal contacts={contacts} onMerge={handleMergeContacts} />
                  <ImportContactsModal onImport={handleImportContacts} />
                  <AttendanceImportModal />
                  <ExportModal contacts={contacts} filteredContacts={filteredContacts} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={forceSyncAll}
                    disabled={syncing}
                    className="gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                    title="Force sync all event data to contacts"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    <span className="hidden md:inline">{syncing ? 'Syncing...' : 'Sync All'}</span>
                  </Button>
                  {unsyncedFormsCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={syncReleaseFormsToContacts}
                      className="gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      title={`Sync ${unsyncedFormsCount} release forms to contacts`}
                    >
                      <FileCheck className="h-4 w-4" />
                      <span className="hidden md:inline">Sync Releases ({unsyncedFormsCount})</span>
                    </Button>
                  )}
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

        {/* Import Banner - temporarily hidden for demo */}
        {false && needsImport && user && (
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-300">Database Import Required</p>
                <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                  Import your CSV contacts to the database for centralized data management.
                </p>
              </div>
            </div>
            <Button 
              onClick={importCsvToDatabase}
              disabled={importing}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Upload className={`h-4 w-4 ${importing ? 'animate-bounce' : ''}`} />
              {importing ? 'Importing...' : 'Import Now'}
            </Button>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full grid-cols-6 bg-secondary/50 h-auto p-1">
            <TabsTrigger value="overview" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
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
            <DashboardHero 
              contacts={contacts}
              onViewContacts={() => setActiveTab("contacts")}
              onViewEvents={() => setActiveTab("events")}
            />
            <ExecutiveSummary 
              contacts={contacts} 
              onNavigateToContacts={(partialFilters) => {
                setFilters(prev => ({ ...prev, ...partialFilters }));
                setActiveTab("contacts");
              }}
            />
            <AIInsightsPanel contacts={contacts} />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4 sm:mt-6">
            <EventsDashboard 
              contacts={contacts} 
              onEventClick={(filterKey) => {
                setFilters(prev => ({ ...prev, [filterKey]: true }));
                setActiveTab("contacts");
              }}
            />
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
                      happyHourAug2025: filters.happyHourAug2025,
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
