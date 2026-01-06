import { Calendar, Hammer, GraduationCap, Users, Sparkles, Wine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface EventFilters {
  dec6Workshop: boolean;
  dec13LTF: boolean;
  sept27BuildDay: boolean;
  happyHourAug2025: boolean;
  hasFeedback: boolean;
  hasProject: boolean;
}

interface EventFilterTogglesProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  counts: {
    dec6Workshop: number;
    dec13LTF: number;
    sept27BuildDay: number;
    happyHourAug2025: number;
    hasFeedback: number;
    hasProject: number;
  };
}

const eventToggleConfig = [
  {
    key: "dec6Workshop" as keyof EventFilters,
    label: "Dec 6 Workshop",
    shortLabel: "Dec 6",
    icon: Calendar,
    color: "from-blue-500 to-blue-600",
    activeColor: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  },
  {
    key: "dec13LTF" as keyof EventFilters,
    label: "Dec 13 LTF",
    shortLabel: "LTF",
    icon: GraduationCap,
    color: "from-purple-500 to-purple-600",
    activeColor: "bg-purple-500/20 border-purple-500/50 text-purple-300",
  },
  {
    key: "sept27BuildDay" as keyof EventFilters,
    label: "Sept 27 Build Day",
    shortLabel: "Build Day",
    icon: Hammer,
    color: "from-amber-500 to-orange-600",
    activeColor: "bg-amber-500/20 border-amber-500/50 text-amber-300",
  },
  {
    key: "happyHourAug2025" as keyof EventFilters,
    label: "Happy Hour Aug 27",
    shortLabel: "Happy Hr",
    icon: Wine,
    color: "from-rose-500 to-pink-600",
    activeColor: "bg-rose-500/20 border-rose-500/50 text-rose-300",
  },
  {
    key: "hasFeedback" as keyof EventFilters,
    label: "Has Feedback",
    shortLabel: "Feedback",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
    activeColor: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
  },
  {
    key: "hasProject" as keyof EventFilters,
    label: "Has Project",
    shortLabel: "Project",
    icon: Users,
    color: "from-pink-500 to-rose-600",
    activeColor: "bg-pink-500/20 border-pink-500/50 text-pink-300",
  },
];

export function EventFilterToggles({ filters, onFiltersChange, counts }: EventFilterTogglesProps) {
  const toggleFilter = (key: keyof EventFilters) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-wrap gap-2">
      {eventToggleConfig.map(({ key, label, shortLabel, icon: Icon, activeColor }) => {
        const isActive = filters[key];
        const count = counts[key];
        
        return (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
              "text-sm font-medium",
              isActive
                ? activeColor
                : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/5"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel}</span>
            <Badge
              variant="secondary"
              className={cn(
                "h-5 min-w-[1.25rem] px-1 text-xs",
                isActive && "bg-background/30"
              )}
            >
              {count}
            </Badge>
          </button>
        );
      })}
      
      {activeCount > 0 && (
        <button
          onClick={() => onFiltersChange({
            dec6Workshop: false,
            dec13LTF: false,
            sept27BuildDay: false,
            happyHourAug2025: false,
            hasFeedback: false,
            hasProject: false,
          })}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
