import { useState, useCallback, useMemo } from "react";
import { useContacts, useFilteredContacts, getUniqueValues } from "@/hooks/useContacts";
import { ContactFilter, SavedSearch, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay, Contact } from "@/types/contact";
import { ContactSearchBar } from "./ContactSearchBar";
import { ContactList } from "./ContactList";
import { QuickStats } from "./QuickStats";
import { EventFilterToggles, EventFilters } from "./EventFilterToggles";
import { ExportModal } from "./ExportModal";
import { ImportContactsModal } from "./ImportContactsModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

// CRM Dashboard v2 - Event Attendee Focus

const defaultFilters: ContactFilter = {
  search: "",
  lifecycleStage: [],
  aiExperienceLevel: [],
  ageRange: [],
  incomeRange: [],
  cohort: [],
  eventAttendeesOnly: false,
  buildDayOnly: false,
  dec6Workshop: false,
  dec13LTF: false,
  sept27BuildDay: false,
  hasFeedback: false,
  hasProject: false,
};

export default function CRMDashboard() {
  const { contacts, loading, error, addContacts } = useContacts();
  const [filters, setFilters] = useState<ContactFilter>(defaultFilters);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem("crm-saved-searches");
    return saved ? JSON.parse(saved) : [];
  });

  const filteredContacts = useFilteredContacts(contacts, filters);

  // Get unique values for filters
  const uniqueLifecycleStages = useMemo(() => getUniqueValues(contacts, "lifecycleStage"), [contacts]);
  const uniqueAiLevels = useMemo(() => getUniqueValues(contacts, "aiExperienceLevel"), [contacts]);
  const uniqueAgeRanges = useMemo(() => getUniqueValues(contacts, "ageRange"), [contacts]);
  const uniqueIncomeRanges = useMemo(() => getUniqueValues(contacts, "incomeRange"), [contacts]);

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

  const handleImportContacts = useCallback((newContacts: Contact[]) => {
    addContacts(newContacts);
  }, [addContacts]);

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
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={btsLogo} alt="Black Tech Street" className="h-10 w-auto" />
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
            <ThemeToggle />
            <ImportContactsModal onImport={handleImportContacts} />
            <ExportModal contacts={contacts} filteredContacts={filteredContacts} />
          </div>
        </header>

        {/* Quick Stats */}
        <QuickStats contacts={contacts} />

        {/* Event Filter Toggles */}
        <div className="bg-card/50 border border-border/30 rounded-xl p-4">
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
      </div>
    </div>
  );
}
