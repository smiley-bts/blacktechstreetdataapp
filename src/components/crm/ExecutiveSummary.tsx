import { Contact, ContactFilter } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Star, 
  Brain, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryProps {
  contacts: Contact[];
  onNavigateToContacts?: (filters: Partial<ContactFilter>) => void;
}

export function ExecutiveSummary({ contacts, onNavigateToContacts }: ExecutiveSummaryProps) {
  const metrics = useContactMetrics(contacts);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Quick Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Complete Profiles */}
          <button 
            onClick={() => onNavigateToContacts?.({ search: "" })}
            className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-left group"
          >
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{metrics.complete} Complete Profiles</p>
              <p className="text-xs text-muted-foreground">80%+ data completeness</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
          
          {/* Need Attention */}
          <button 
            onClick={() => onNavigateToContacts?.({ search: "" })}
            className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-left group"
          >
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{metrics.incomplete} Need Attention</p>
              <p className="text-xs text-muted-foreground">Less than 50% complete</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>

          {/* Feedback Submissions */}
          <button 
            onClick={() => onNavigateToContacts?.({ hasFeedback: true })}
            className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-left group"
          >
            <Brain className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{metrics.withFeedback} Feedback Submissions</p>
              <p className="text-xs text-muted-foreground">{metrics.buildDayParticipants} with Build Day projects</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>

          {/* NPS Breakdown */}
          {metrics.npsScore !== null && (
            <button 
              onClick={() => onNavigateToContacts?.({ hasFeedback: true })}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border hover:opacity-90 transition-all text-left group",
                metrics.npsScore >= 50 
                  ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" 
                  : metrics.npsScore >= 0 
                    ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                    : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
              )}
            >
              <TrendingUp className={cn(
                "h-5 w-5 shrink-0",
                metrics.npsScore >= 50 ? "text-emerald-500" : metrics.npsScore >= 0 ? "text-amber-500" : "text-red-500"
              )} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{metrics.promoters} Promoters vs {metrics.detractors} Detractors</p>
                <p className="text-xs text-muted-foreground">NPS: {metrics.npsScore > 0 ? '+' : ''}{metrics.npsScore}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
