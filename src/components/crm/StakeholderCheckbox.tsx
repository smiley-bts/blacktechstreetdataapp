import { useState, useCallback } from "react";
import { Crown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useContactTags } from "@/hooks/useContactTags";
import { cn } from "@/lib/utils";

interface StakeholderCheckboxProps {
  contactId: string;
  size?: "sm" | "md";
  className?: string;
}

const STAKEHOLDER_TAG = "Stakeholder";

export function StakeholderCheckbox({ contactId, size = "md", className }: StakeholderCheckboxProps) {
  const { getTags, addTag, removeTag } = useContactTags();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const tags = getTags(contactId);
  const isStakeholder = tags.includes(STAKEHOLDER_TAG);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      if (isStakeholder) {
        await removeTag(contactId, STAKEHOLDER_TAG);
      } else {
        await addTag(contactId, STAKEHOLDER_TAG);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [contactId, isStakeholder, addTag, removeTag]);

  const sizeClasses = size === "sm" 
    ? "h-4 w-4" 
    : "h-5 w-5";

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        isUpdating && "opacity-50",
        className
      )}
      onClick={handleToggle}
    >
      {isStakeholder ? (
        <div className={cn(
          "flex items-center justify-center rounded bg-gold/20 border border-gold/50",
          sizeClasses
        )}>
          <Crown className={cn(
            "text-gold",
            size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"
          )} />
        </div>
      ) : (
        <Checkbox 
          checked={false}
          className={cn(
            "border-muted-foreground/40 hover:border-gold/60 transition-colors",
            sizeClasses
          )}
        />
      )}
    </div>
  );
}

export function useIsStakeholder(contactId: string): boolean {
  const { getTags } = useContactTags();
  return getTags(contactId).includes(STAKEHOLDER_TAG);
}
