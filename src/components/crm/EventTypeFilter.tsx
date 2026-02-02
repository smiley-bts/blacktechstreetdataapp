import { 
  EVENT_TYPES, 
  EventType, 
  EVENT_TYPE_LABELS, 
  EVENT_TYPE_COLORS,
  getEventTypeOptions,
} from "@/types/eventTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GraduationCap, Users, Briefcase, Building2, X } from "lucide-react";

interface EventTypeFilterProps {
  selectedType: EventType | null;
  onTypeChange: (type: EventType | null) => void;
  counts?: Record<EventType, number>;
  compact?: boolean;
}

const TYPE_ICONS: Record<EventType, React.ComponentType<{ className?: string }>> = {
  [EVENT_TYPES.WORKSHOP]: GraduationCap,
  [EVENT_TYPES.COMMUNITY_ENGAGEMENT]: Users,
  [EVENT_TYPES.EDUCATION]: Briefcase,
  [EVENT_TYPES.ENTERPRISE]: Building2,
};

export function EventTypeFilter({ 
  selectedType, 
  onTypeChange, 
  counts,
  compact = false,
}: EventTypeFilterProps) {
  const options = getEventTypeOptions();

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange(null)}
          className="h-8"
        >
          All Events
        </Button>
        {options.map(({ value, label }) => {
          const colors = EVENT_TYPE_COLORS[value];
          const Icon = TYPE_ICONS[value];
          const count = counts?.[value] ?? 0;
          
          return (
            <Button
              key={value}
              variant={selectedType === value ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(value)}
              className={cn(
                "h-8 gap-1.5",
                selectedType !== value && colors.bg
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label.split(" ")[0]}</span>
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Filter by Program Type</h3>
        {selectedType && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTypeChange(null)}
            className="h-7 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Clear filter
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ value, label }) => {
          const colors = EVENT_TYPE_COLORS[value];
          const Icon = TYPE_ICONS[value];
          const count = counts?.[value] ?? 0;
          const isSelected = selectedType === value;
          
          return (
            <button
              key={value}
              onClick={() => onTypeChange(isSelected ? null : value)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                isSelected 
                  ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20" 
                  : `${colors.bg} ${colors.border} hover:border-primary/30`
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                isSelected ? "bg-primary/20" : colors.bg
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  isSelected ? "text-primary" : colors.text
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {label}
                </p>
                {count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {count} attendee{count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
