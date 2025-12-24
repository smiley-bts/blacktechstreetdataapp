import { useState } from "react";
import { Search, Filter, Download, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContactFilter, SavedSearch } from "@/types/contact";

interface ContactSearchBarProps {
  filters: ContactFilter;
  onFiltersChange: (filters: ContactFilter) => void;
  totalCount: number;
  filteredCount: number;
  uniqueLifecycleStages: string[];
  uniqueAiLevels: string[];
  uniqueAgeRanges: string[];
  uniqueIncomeRanges: string[];
  savedSearches: SavedSearch[];
  onSaveSearch: (name: string) => void;
  onLoadSearch: (search: SavedSearch) => void;
  onDeleteSearch: (id: string) => void;
  onExport: () => void;
}

export function ContactSearchBar({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  uniqueLifecycleStages,
  uniqueAiLevels,
  uniqueAgeRanges,
  uniqueIncomeRanges,
  savedSearches,
  onSaveSearch,
  onLoadSearch,
  onDeleteSearch,
  onExport,
}: ContactSearchBarProps) {
  const [saveSearchName, setSaveSearchName] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = 
    filters.lifecycleStage.length +
    filters.aiExperienceLevel.length +
    filters.ageRange.length +
    filters.incomeRange.length +
    (filters.eventAttendeesOnly ? 1 : 0) +
    (filters.buildDayOnly ? 1 : 0);

  const handleFilterToggle = (
    field: keyof Pick<ContactFilter, 'lifecycleStage' | 'aiExperienceLevel' | 'ageRange' | 'incomeRange'>,
    value: string
  ) => {
    const current = filters[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [field]: updated });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      lifecycleStage: [],
      aiExperienceLevel: [],
      ageRange: [],
      incomeRange: [],
      cohort: [],
      eventAttendeesOnly: false,
      buildDayOnly: false,
    });
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      onSaveSearch(saveSearchName.trim());
      setSaveSearchName("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by UID, name, email, or phone..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filter Button */}
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Filter contacts by multiple criteria
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-200px)] pr-4 mt-4">
              <div className="space-y-6">
                {/* Lifecycle Stage */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Lifecycle Stage</Label>
                  <div className="space-y-2">
                    {uniqueLifecycleStages.map((stage) => (
                      <div key={stage} className="flex items-center space-x-2">
                        <Checkbox
                          id={`stage-${stage}`}
                          checked={filters.lifecycleStage.includes(stage)}
                          onCheckedChange={() => handleFilterToggle('lifecycleStage', stage)}
                        />
                        <Label htmlFor={`stage-${stage}`} className="text-sm font-normal cursor-pointer">
                          {stage}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Experience Level */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">AI Experience Level</Label>
                  <div className="space-y-2">
                    {uniqueAiLevels.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ai-${level}`}
                          checked={filters.aiExperienceLevel.includes(level)}
                          onCheckedChange={() => handleFilterToggle('aiExperienceLevel', level)}
                        />
                        <Label htmlFor={`ai-${level}`} className="text-sm font-normal cursor-pointer line-clamp-2">
                          {level.length > 50 ? level.substring(0, 50) + '...' : level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Age Range</Label>
                  <div className="space-y-2">
                    {uniqueAgeRanges.map((age) => (
                      <div key={age} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${age}`}
                          checked={filters.ageRange.includes(age)}
                          onCheckedChange={() => handleFilterToggle('ageRange', age)}
                        />
                        <Label htmlFor={`age-${age}`} className="text-sm font-normal cursor-pointer">
                          {age}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Income Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Income Range</Label>
                  <div className="space-y-2">
                    {uniqueIncomeRanges.map((income) => (
                      <div key={income} className="flex items-center space-x-2">
                        <Checkbox
                          id={`income-${income}`}
                          checked={filters.incomeRange.includes(income)}
                          onCheckedChange={() => handleFilterToggle('incomeRange', income)}
                        />
                        <Label htmlFor={`income-${income}`} className="text-sm font-normal cursor-pointer">
                          {income}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Search */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">Save This Search</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search name..."
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                    />
                    <Button onClick={handleSaveSearch} size="icon" variant="outline">
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Saved Searches */}
                {savedSearches.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Saved Searches</Label>
                    <div className="space-y-2">
                      {savedSearches.map((search) => (
                        <div key={search.id} className="flex items-center justify-between p-2 rounded bg-secondary/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start"
                            onClick={() => {
                              onLoadSearch(search);
                              setFilterOpen(false);
                            }}
                          >
                            {search.name}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDeleteSearch(search.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear All Filters
                </Button>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Export Button */}
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Results count and active filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} contacts
        </span>
        
        {/* Active filter badges */}
        {filters.lifecycleStage.map((stage) => (
          <Badge key={`stage-${stage}`} variant="secondary" className="gap-1">
            {stage}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => handleFilterToggle('lifecycleStage', stage)}
            />
          </Badge>
        ))}
        {filters.aiExperienceLevel.map((level) => (
          <Badge key={`ai-${level}`} variant="secondary" className="gap-1">
            {level.substring(0, 20)}...
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => handleFilterToggle('aiExperienceLevel', level)}
            />
          </Badge>
        ))}
        {filters.ageRange.map((age) => (
          <Badge key={`age-${age}`} variant="secondary" className="gap-1">
            {age}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => handleFilterToggle('ageRange', age)}
            />
          </Badge>
        ))}
        {filters.incomeRange.map((income) => (
          <Badge key={`income-${income}`} variant="secondary" className="gap-1">
            {income}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => handleFilterToggle('incomeRange', income)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
