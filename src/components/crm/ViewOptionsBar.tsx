import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  LayoutGrid, 
  List, 
  Rows3,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Shuffle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export type ViewMode = "cards" | "list" | "compact";
export type SortField = "name" | "email" | "lifecycleStage" | "aiExperienceLevel" | "createdAt" | "city" | "completeness";
export type SortDirection = "asc" | "desc";

interface ViewOptionsBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onRandomize: () => void;
  totalShowing: number;
  totalFiltered: number;
}

const sortOptions: { field: SortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "lifecycleStage", label: "Lifecycle Stage" },
  { field: "aiExperienceLevel", label: "AI Level" },
  { field: "city", label: "City" },
  { field: "createdAt", label: "Date Added" },
  { field: "completeness", label: "Data Quality" },
];

export function ViewOptionsBar({
  viewMode,
  onViewModeChange,
  sortField,
  sortDirection,
  onSortChange,
  onRandomize,
  totalShowing,
  totalFiltered,
}: ViewOptionsBarProps) {
  const currentSortLabel = sortOptions.find(o => o.field === sortField)?.label || "Sort";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-3 sm:px-4 bg-card/50 border border-border/30 rounded-lg">
      {/* Left: View Mode Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium hidden lg:block">
          View
        </span>
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(v) => v && onViewModeChange(v as ViewMode)}
          className="bg-background/50 p-1 rounded-lg"
        >
          <ToggleGroupItem 
            value="cards" 
            aria-label="Card view"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-2 sm:px-3"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="ml-1 sm:ml-2 hidden sm:inline text-sm">Cards</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List view"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-2 sm:px-3"
          >
            <List className="h-4 w-4" />
            <span className="ml-1 sm:ml-2 hidden sm:inline text-sm">List</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="compact" 
            aria-label="Compact view"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-2 sm:px-3"
          >
            <Rows3 className="h-4 w-4" />
            <span className="ml-1 sm:ml-2 hidden md:inline text-sm">Compact</span>
          </ToggleGroupItem>
        </ToggleGroup>
        
        {/* Count - inline on mobile */}
        <div className="text-xs sm:text-sm text-muted-foreground sm:hidden">
          <span className="font-semibold text-foreground">{totalShowing}</span>
          {totalShowing < totalFiltered && <span>/{totalFiltered}</span>}
        </div>
      </div>

      {/* Center: Count - hidden on mobile */}
      <div className="text-sm text-muted-foreground hidden sm:block">
        Showing <span className="font-semibold text-foreground">{totalShowing}</span>
        {totalShowing < totalFiltered && (
          <span> of <span className="font-semibold text-foreground">{totalFiltered}</span></span>
        )}
      </div>

      {/* Right: Sort & Randomize */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">{currentSortLabel}</span>
              {sortDirection === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.field}
                onClick={() => {
                  if (sortField === option.field) {
                    onSortChange(option.field, sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    onSortChange(option.field, "asc");
                  }
                }}
                className="flex items-center justify-between"
              >
                <span>{option.label}</span>
                {sortField === option.field && (
                  sortDirection === "asc" ? (
                    <SortAsc className="h-4 w-4 text-primary" />
                  ) : (
                    <SortDesc className="h-4 w-4 text-primary" />
                  )
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRandomize}
          className="gap-2 hover:bg-primary/10 hover:text-primary"
          title="Shuffle contacts"
        >
          <Shuffle className="h-4 w-4" />
          <span className="hidden lg:inline">Shuffle</span>
        </Button>
      </div>
    </div>
  );
}
