import { Contact } from "@/types/contact";
import { getCompletenessScore, getCompletenessColor, getMissingFields } from "@/lib/contactCompleteness";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CompletenessIndicatorProps {
  contact: Contact;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CompletenessIndicator({ contact, size = "sm", showLabel = false }: CompletenessIndicatorProps) {
  const score = getCompletenessScore(contact);
  const colors = getCompletenessColor(score);
  const missingFields = getMissingFields(contact);

  const sizeClasses = {
    sm: "h-5 w-5 text-[8px]",
    md: "h-7 w-7 text-[10px]",
    lg: "h-10 w-10 text-xs",
  };

  const strokeWidth = size === "sm" ? 3 : size === "md" ? 2.5 : 2;
  const radius = size === "sm" ? 7 : size === "md" ? 10 : 14;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", showLabel && "cursor-help")}>
            <div className={cn("relative", sizeClasses[size])}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  className={colors.text}
                />
              </svg>
              <span className={cn(
                "absolute inset-0 flex items-center justify-center font-bold",
                colors.text
              )}>
                {score}
              </span>
            </div>
            {showLabel && (
              <span className={cn("text-xs font-medium", colors.text)}>
                {score}%
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-medium text-sm">Profile {score}% complete</p>
            {missingFields.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Missing: {missingFields.join(", ")}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact dot indicator for very tight spaces
export function CompletenesssDot({ contact }: { contact: Contact }) {
  const score = getCompletenessScore(contact);
  const colors = getCompletenessColor(score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("h-2 w-2 rounded-full", colors.bg)} />
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{score}% complete</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
