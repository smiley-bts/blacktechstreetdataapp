import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, ChevronDown, X } from "lucide-react";
import { PRESET_TAGS } from "@/hooks/useContactTags";

interface TagFilterProps {
  selectedTags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
}

const TAG_COLORS: Record<string, string> = {
  "VIP": "bg-gold/20 text-gold border-gold/30",
  "Follow-up Needed": "bg-destructive/20 text-destructive border-destructive/30",
  "High Engagement": "bg-primary/20 text-primary border-primary/30",
  "Mentor Candidate": "bg-accent/20 text-accent border-accent/30",
  "Speaker": "bg-chart-purple/20 text-chart-purple border-chart-purple/30",
  "Volunteer": "bg-chart-blue/20 text-chart-blue border-chart-blue/30",
  "Partner": "bg-chart-emerald/20 text-chart-emerald border-chart-emerald/30",
  "Sponsor": "bg-chart-amber/20 text-chart-amber border-chart-amber/30",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || "bg-secondary text-foreground border-border";
}

export function TagFilter({ selectedTags, allTags, onChange }: TagFilterProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const clearAll = () => onChange([]);

  // Combine preset labels with all tags
  const presetLabels = PRESET_TAGS.map(p => p.label) as string[];
  const sortedTags = [
    ...presetLabels.filter(t => allTags.includes(t)),
    ...allTags.filter(t => !presetLabels.includes(t)),
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 h-8 ${selectedTags.length > 0 ? 'border-primary/50 bg-primary/5' : ''}`}
        >
          <Tag className="h-3.5 w-3.5" />
          Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {selectedTags.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Filter by Tags</label>
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground"
                onClick={clearAll}
              >
                Clear all
              </Button>
            )}
          </div>

          {sortedTags.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No tags created yet
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {sortedTags.map(tag => (
                <label
                  key={tag}
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-secondary/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  />
                  <Badge 
                    variant="outline" 
                    className={`${getTagColor(tag)} text-xs`}
                  >
                    {tag}
                  </Badge>
                </label>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Display selected tags as removable badges
export function SelectedTagBadges({ 
  tags, 
  onRemove 
}: { 
  tags: string[]; 
  onRemove: (tag: string) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(tag => (
        <Badge
          key={tag}
          variant="outline"
          className={`${getTagColor(tag)} gap-1 text-xs`}
        >
          {tag}
          <button onClick={() => onRemove(tag)} className="hover:opacity-70">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
