import { Contact, hasValidDisplayName } from "@/types/contact";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Edit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NameQualityBadgeProps {
  contact: Contact;
  hasOverride?: boolean;
  size?: "sm" | "md";
}

export function NameQualityBadge({ contact, hasOverride = false, size = "sm" }: NameQualityBadgeProps) {
  const hasValidName = hasValidDisplayName(contact);
  
  if (hasOverride) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${size === "sm" ? "h-5 px-1.5" : "h-6 px-2"} bg-accent/20 text-accent border-accent/30`}
            >
              <Edit className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Custom name override applied</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (hasValidName) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${size === "sm" ? "h-5 px-1.5" : "h-6 px-2"} bg-emerald-500/20 text-emerald-500 border-emerald-500/30`}
            >
              <UserCheck className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Verified name</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${size === "sm" ? "h-5 px-1.5" : "h-6 px-2"} bg-amber-500/20 text-amber-500 border-amber-500/30`}
          >
            <UserX className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Using fallback identifier (UID/ID)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
