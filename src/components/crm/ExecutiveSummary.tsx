import { Contact, ContactFilter } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { useParticipantMetrics } from "@/hooks/useParticipantMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Star, 
  Brain, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Users,
  Repeat,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryProps {
  contacts: Contact[];
  onNavigateToContacts?: (filters: Partial<ContactFilter>) => void;
}

export function ExecutiveSummary({ contacts, onNavigateToContacts }: ExecutiveSummaryProps) {
  const legacyMetrics = useContactMetrics(contacts);
  const { metrics: participantMetrics, isLoading } = useParticipantMetrics();

  // Use new metrics when available
  const hasParticipantData = participantMetrics.totalUniqueAttendees > 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Quick Insights
          {hasParticipantData && (
            <span className="ml-2 text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              Attendance-verified
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Longitudinal Tracking - NEW */}
          {hasParticipantData && (
            <button 
              onClick={() => onNavigateToContacts?.({ search: "" })}
              className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-left group"
            >
              <Repeat className="h-5 w-5 text-purple-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {participantMetrics.returningAttendees} Returning Participants
                </p>
                <p className="text-xs text-muted-foreground">
                  {participantMetrics.retentionRate}% came back after first event
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* Survey Completion - NEW */}
          {hasParticipantData && (
            <button 
              onClick={() => onNavigateToContacts?.({ hasFeedback: true })}
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-left group"
            >
              <FileCheck className="h-5 w-5 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {participantMetrics.surveyCompletionRate}% Survey Completion
                </p>
                <p className="text-xs text-muted-foreground">
                  {participantMetrics.releaseSigningRate}% signed media release
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* High Engagement - NEW */}
          {hasParticipantData && (
            <button 
              onClick={() => onNavigateToContacts?.({ search: "" })}
              className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-left group"
            >
              <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {participantMetrics.highEngagement} Highly Engaged
                </p>
                <p className="text-xs text-muted-foreground">
                  Attended 3+ events
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* Average Events - NEW */}
          {hasParticipantData && (
            <button 
              onClick={() => onNavigateToContacts?.({ search: "" })}
              className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-left group"
            >
              <Users className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {participantMetrics.averageEventsPerAttendee} Avg Events/Person
                </p>
                <p className="text-xs text-muted-foreground">
                  {participantMetrics.totalAttendances} total attendances
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* Legacy metrics shown when no participant data */}
          {!hasParticipantData && (
            <>
              {/* Complete Profiles */}
              <button 
                onClick={() => onNavigateToContacts?.({ search: "" })}
                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-left group"
              >
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{legacyMetrics.complete} Complete Profiles</p>
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
                  <p className="font-medium text-foreground">{legacyMetrics.incomplete} Need Attention</p>
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
                  <p className="font-medium text-foreground">{legacyMetrics.withFeedback} Feedback Submissions</p>
                  <p className="text-xs text-muted-foreground">{legacyMetrics.buildDayParticipants} with Build Day projects</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>

              {/* NPS Breakdown */}
              {legacyMetrics.npsScore !== null && (
                <button 
                  onClick={() => onNavigateToContacts?.({ hasFeedback: true })}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border hover:opacity-90 transition-all text-left group",
                    legacyMetrics.npsScore >= 50 
                      ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" 
                      : legacyMetrics.npsScore >= 0 
                        ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                        : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                  )}
                >
                  <TrendingUp className={cn(
                    "h-5 w-5 shrink-0",
                    legacyMetrics.npsScore >= 50 ? "text-emerald-500" : legacyMetrics.npsScore >= 0 ? "text-amber-500" : "text-red-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{legacyMetrics.promoters} Promoters vs {legacyMetrics.detractors} Detractors</p>
                    <p className="text-xs text-muted-foreground">NPS: {legacyMetrics.npsScore > 0 ? '+' : ''}{legacyMetrics.npsScore}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
