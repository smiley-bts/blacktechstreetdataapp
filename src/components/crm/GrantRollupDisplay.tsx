import { 
  GRANT_CATEGORY_LABELS, 
  GrantProgramCategory,
  GRANT_PROGRAM_CATEGORIES,
} from "@/types/eventTypes";
import { GrantCategoryRollup } from "@/hooks/useEventAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, GraduationCap, Handshake, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrantRollupDisplayProps {
  rollups: GrantCategoryRollup[];
  isLoading?: boolean;
}

const CATEGORY_CONFIG: Record<GrantProgramCategory, {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  description: string;
}> = {
  [GRANT_PROGRAM_CATEGORIES.WORKFORCE_DEVELOPMENT]: {
    icon: Briefcase,
    gradient: "from-emerald-500 to-teal-600",
    description: "Hands-on AI training, skill-building workshops, and certification programs",
  },
  [GRANT_PROGRAM_CATEGORIES.COMMUNITY_BUILDING]: {
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
    description: "Info sessions, networking events, and community outreach activities",
  },
  [GRANT_PROGRAM_CATEGORIES.YOUTH_EDUCATION]: {
    icon: GraduationCap,
    gradient: "from-blue-500 to-indigo-600",
    description: "K-12 programs, youth workshops, and educational initiatives",
  },
  [GRANT_PROGRAM_CATEGORIES.PARTNERSHIP_GROWTH]: {
    icon: Handshake,
    gradient: "from-purple-500 to-fuchsia-600",
    description: "Corporate training, partner sessions, and enterprise engagements",
  },
};

export function GrantRollupDisplay({ rollups, isLoading }: GrantRollupDisplayProps) {
  // Calculate totals (unique across ALL categories to avoid double counting)
  const totalUniqueAttendees = rollups.reduce((sum, r) => sum + r.uniqueAttendees, 0);
  const totalEvents = rollups.reduce((sum, r) => sum + r.eventCount, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Grant-Aligned Program Rollup
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px]">
                  <p className="text-xs">
                    Unique attendees per category. Individuals are counted once per 
                    category even if they attended multiple events within that category.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalEvents} events total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {rollups.map((rollup) => {
            const config = CATEGORY_CONFIG[rollup.category];
            const Icon = config.icon;
            
            return (
              <TooltipProvider key={rollup.category}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-xl p-4",
                        "bg-gradient-to-br from-card/80 to-card/40",
                        "border border-border/30",
                        "hover:border-primary/30 transition-all duration-300",
                        "cursor-default"
                      )}
                    >
                      {/* Gradient accent */}
                      <div className={cn(
                        "absolute top-0 right-0 w-16 h-16 opacity-10",
                        `bg-gradient-to-br ${config.gradient}`,
                        "rounded-full blur-xl -translate-y-1/2 translate-x-1/2"
                      )} />
                      
                      <div className="relative z-10 space-y-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          `bg-gradient-to-br ${config.gradient} bg-opacity-10`
                        )}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            <CountUp end={rollup.uniqueAttendees} duration={600} />
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {GRANT_CATEGORY_LABELS[rollup.category]}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{rollup.eventCount} event{rollup.eventCount !== 1 ? "s" : ""}</span>
                          <span>•</span>
                          <span>{rollup.totalAttendances} attendances</span>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="text-xs">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
        {/* Summary note */}
        <p className="text-[10px] text-muted-foreground mt-4 text-center">
          ⚠️ Note: Individuals may be counted in multiple categories if they attended 
          different program types. Total unique across all programs may be lower than sum.
        </p>
      </CardContent>
    </Card>
  );
}
