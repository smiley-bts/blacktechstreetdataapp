import { useState, useCallback, useMemo } from "react";
import { useContacts, useFilteredContacts, getUniqueValues } from "@/hooks/useContacts";
import { ContactFilter, SavedSearch, Contact } from "@/types/contact";
import { ContactSearchBar } from "./ContactSearchBar";
import { ContactList } from "./ContactList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp, Brain } from "lucide-react";
import btsLogo from "@/assets/black-tech-street-logo.png";

const defaultFilters: ContactFilter = {
  search: "",
  lifecycleStage: [],
  aiExperienceLevel: [],
  ageRange: [],
  incomeRange: [],
  cohort: [],
};

export default function CRMDashboard() {
  const { contacts, loading, error } = useContacts();
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

  // Stats
  const stats = useMemo(() => {
    const leads = contacts.filter(c => c.lifecycleStage?.toLowerCase() === "lead").length;
    const withEmail = contacts.filter(c => c.email).length;
    const emerging = contacts.filter(c => c.aiExperienceLevel?.toLowerCase().includes("emerging")).length;
    const intermediate = contacts.filter(c => 
      c.aiExperienceLevel?.toLowerCase().includes("intermediate") ||
      c.aiExperienceLevel?.toLowerCase().includes("advanced")
    ).length;

    return { leads, withEmail, emerging, intermediate };
  }, [contacts]);

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

  const handleExport = useCallback(() => {
    const headers = ["UID", "First Name", "Last Name", "Email", "Phone", "City", "State", "Lifecycle Stage", "AI Level"];
    const rows = filteredContacts.map(c => [
      c.uid,
      c.firstName,
      c.lastName,
      c.email,
      c.phone,
      c.city,
      c.state,
      c.lifecycleStage,
      c.aiExperienceLevel?.substring(0, 30),
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v || ''}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredContacts]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading contacts: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
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
        </header>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emerging AI Users</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emerging.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intermediate+</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.intermediate.toLocaleString()}</div>
            </CardContent>
          </Card>
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
          onExport={handleExport}
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
