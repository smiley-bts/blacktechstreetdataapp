import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus, Tag, ChevronDown } from "lucide-react";
import { PRESET_TAGS } from "@/hooks/useContactTags";

interface TagInputProps {
  tags: string[];
  allTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  disabled?: boolean;
}

const TAG_COLORS: Record<string, string> = {
  "VIP": "bg-gold/20 text-gold border-gold/30 hover:bg-gold/30",
  "Follow-up Needed": "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30",
  "High Engagement": "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
  "Mentor Candidate": "bg-accent/20 text-accent border-accent/30 hover:bg-accent/30",
  "Speaker": "bg-chart-purple/20 text-chart-purple border-chart-purple/30 hover:bg-chart-purple/30",
  "Volunteer": "bg-chart-blue/20 text-chart-blue border-chart-blue/30 hover:bg-chart-blue/30",
  "Partner": "bg-chart-emerald/20 text-chart-emerald border-chart-emerald/30 hover:bg-chart-emerald/30",
  "Sponsor": "bg-chart-amber/20 text-chart-amber border-chart-amber/30 hover:bg-chart-amber/30",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || "bg-secondary text-foreground border-border hover:bg-secondary/80";
}

export function TagInput({ tags, allTags, onAddTag, onRemoveTag, disabled }: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const availableTags = allTags.filter(t => !tags.includes(t));
  const presetTags = (PRESET_TAGS.map(p => p.label) as string[]).filter(t => !tags.includes(t));

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
      setNewTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge 
            key={tag} 
            variant="outline"
            className={`${getTagColor(tag)} transition-colors`}
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
            {!disabled && (
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1.5 hover:opacity-70 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        
        {tags.length === 0 && (
          <span className="text-sm text-muted-foreground italic">No tags</span>
        )}
      </div>

      {/* Add Tag UI */}
      {!disabled && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <Plus className="h-3.5 w-3.5" />
              Add Tag
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              {/* Custom Tag Input */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Create new tag</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter tag name..."
                    className="h-8 text-sm"
                  />
                  <Button 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => handleAddTag(newTag)}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Preset Tags */}
              {presetTags.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Quick add</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {presetTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`${getTagColor(tag)} cursor-pointer text-xs`}
                        onClick={() => {
                          handleAddTag(tag);
                          setIsOpen(false);
                        }}
                      >
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Custom Tags */}
              {availableTags.filter(t => !presetTags.includes(t)).length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Existing tags</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-24 overflow-y-auto">
                    {availableTags.filter(t => !presetTags.includes(t)).map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer text-xs hover:bg-secondary"
                        onClick={() => {
                          handleAddTag(tag);
                          setIsOpen(false);
                        }}
                      >
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
