import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  User, 
  Search,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Sep2025PreSurveyFeedback, Sep2025WorkshopFeedback, BuildDayFeedback } from "@/types/feedback";
import { Contact } from "@/types/contact";
import { cn } from "@/lib/utils";

interface ParticipantJourneyViewProps {
  preSurveyData: Sep2025PreSurveyFeedback[];
  workshopData: Sep2025WorkshopFeedback[];
  buildDayData: BuildDayFeedback[];
  findContactByEmail: (email: string) => Contact | undefined;
  onContactClick?: (email: string) => void;
}

interface ParticipantJourney {
  id: string;
  name: string;
  email: string;
  preSurvey?: Sep2025PreSurveyFeedback;
  workshop?: Sep2025WorkshopFeedback;
  buildDay?: BuildDayFeedback;
  stagesCompleted: number;
}

// Normalize email for matching
function normalizeEmail(email: string): string {
  return (email || "").toLowerCase().trim();
}

// Normalize name for fuzzy matching
function normalizeName(name: string): string {
  return (name || "").toLowerCase().trim().replace(/\s+/g, " ");
}

// Match participants by email or name
function matchParticipants(
  preSurvey: Sep2025PreSurveyFeedback[],
  workshop: Sep2025WorkshopFeedback[],
  buildDay: BuildDayFeedback[]
): ParticipantJourney[] {
  const journeyMap = new Map<string, ParticipantJourney>();

  // Index by email first
  const preByEmail = new Map<string, Sep2025PreSurveyFeedback>();
  const workshopByEmail = new Map<string, Sep2025WorkshopFeedback>();
  const buildDayByEmail = new Map<string, BuildDayFeedback>();

  preSurvey.forEach(p => {
    const email = normalizeEmail(p.email);
    if (email) preByEmail.set(email, p);
  });

  workshop.forEach(w => {
    const email = normalizeEmail(w.email) || normalizeEmail(w.emailAddress);
    if (email) workshopByEmail.set(email, w);
  });

  buildDay.forEach(b => {
    const email = normalizeEmail(b.email);
    if (email) buildDayByEmail.set(email, b);
  });

  // Create journeys starting from pre-survey participants
  preSurvey.forEach(p => {
    const email = normalizeEmail(p.email);
    const name = p.fullName;
    const id = email || `pre-${p.submissionId}`;
    
    const journey: ParticipantJourney = {
      id,
      name,
      email,
      preSurvey: p,
      workshop: workshopByEmail.get(email),
      buildDay: buildDayByEmail.get(email),
      stagesCompleted: 1 + (workshopByEmail.has(email) ? 1 : 0) + (buildDayByEmail.has(email) ? 1 : 0)
    };
    
    journeyMap.set(id, journey);
  });

  // Add workshop-only participants (no pre-survey)
  workshop.forEach(w => {
    const email = normalizeEmail(w.email) || normalizeEmail(w.emailAddress);
    if (!email || journeyMap.has(email)) return;
    
    const journey: ParticipantJourney = {
      id: email,
      name: w.name,
      email,
      preSurvey: undefined,
      workshop: w,
      buildDay: buildDayByEmail.get(email),
      stagesCompleted: 1 + (buildDayByEmail.has(email) ? 1 : 0)
    };
    
    journeyMap.set(email, journey);
  });

  // Add build-day-only participants
  buildDay.forEach(b => {
    const email = normalizeEmail(b.email);
    if (!email || journeyMap.has(email)) return;
    
    const journey: ParticipantJourney = {
      id: email,
      name: b.name,
      email,
      preSurvey: undefined,
      workshop: undefined,
      buildDay: b,
      stagesCompleted: 1
    };
    
    journeyMap.set(email, journey);
  });

  return Array.from(journeyMap.values())
    .sort((a, b) => b.stagesCompleted - a.stagesCompleted);
}

// Get AI confidence level from pre-survey text
function parseConfidenceLevel(confidence: string): number {
  if (!confidence) return 0;
  const lower = confidence.toLowerCase();
  if (lower.includes("very confident") || lower.includes("expert")) return 5;
  if (lower.includes("confident") || lower.includes("advanced")) return 4;
  if (lower.includes("intermediate") || lower.includes("somewhat")) return 3;
  if (lower.includes("emerging") || lower.includes("basic") || lower.includes("beginner")) return 2;
  if (lower.includes("no experience") || lower.includes("none")) return 1;
  return 0;
}

// Get mindset emoji
function getMindsetEmoji(mindset: string): string {
  if (!mindset) return "❓";
  const lower = mindset.toLowerCase();
  if (lower.includes("optimist")) return "🌟";
  if (lower.includes("cultivator")) return "🌱";
  if (lower.includes("anchor") || lower.includes("concerned")) return "⚓";
  if (lower.includes("realist") || lower.includes("cautious")) return "⚖️";
  return "🤔";
}

// Get mindset color
function getMindsetColor(mindset: string): string {
  if (!mindset) return "text-muted-foreground";
  const lower = mindset.toLowerCase();
  if (lower.includes("optimist")) return "text-emerald-500";
  if (lower.includes("cultivator")) return "text-blue-500";
  if (lower.includes("anchor") || lower.includes("concerned")) return "text-amber-500";
  if (lower.includes("realist") || lower.includes("cautious")) return "text-purple-500";
  return "text-muted-foreground";
}

export function ParticipantJourneyView({
  preSurveyData,
  workshopData,
  buildDayData,
  findContactByEmail,
  onContactClick
}: ParticipantJourneyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const journeys = useMemo(() => 
    matchParticipants(preSurveyData, workshopData, buildDayData),
    [preSurveyData, workshopData, buildDayData]
  );

  const filteredJourneys = useMemo(() => {
    if (!searchQuery) return journeys;
    const query = searchQuery.toLowerCase();
    return journeys.filter(j => 
      j.name.toLowerCase().includes(query) ||
      j.email.toLowerCase().includes(query)
    );
  }, [journeys, searchQuery]);

  // Summary stats
  const stats = useMemo(() => {
    const total = journeys.length;
    const completedAll = journeys.filter(j => j.stagesCompleted === 3).length;
    const preOnly = journeys.filter(j => j.preSurvey && !j.workshop && !j.buildDay).length;
    const completedWorkshop = journeys.filter(j => j.workshop).length;
    const completedBuildDay = journeys.filter(j => j.buildDay).length;
    
    // Mindset changes for those who did both pre and post
    const withMindsetChange = journeys.filter(j => j.preSurvey && j.workshop);
    
    return {
      total,
      completedAll,
      preOnly,
      completedWorkshop,
      completedBuildDay,
      dropOffRate: total > 0 ? Math.round((preOnly / total) * 100) : 0,
      retentionRate: total > 0 ? Math.round((completedWorkshop / total) * 100) : 0,
      withMindsetChange: withMindsetChange.length
    };
  }, [journeys]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.completedAll}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Completed All Stages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.retentionRate}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Attended Workshop</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.withMindsetChange}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">With Mindset Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journey Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Participant Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 sm:gap-4 text-center">
            <div className="flex-1">
              <div className="h-12 sm:h-16 flex items-center justify-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {preSurveyData.length}
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pre-Registered</p>
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="h-12 sm:h-16 flex items-center justify-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-500">
                  {workshopData.length}
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Workshop Feedback</p>
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="h-12 sm:h-16 flex items-center justify-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-500">
                  {buildDayData.length}
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Build Day Feedback</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[400px] sm:h-[500px]">
          <div className="space-y-2">
            {filteredJourneys.map((journey) => (
              <ParticipantJourneyCard
                key={journey.id}
                journey={journey}
                isExpanded={expandedId === journey.id}
                onToggle={() => setExpandedId(expandedId === journey.id ? null : journey.id)}
                findContactByEmail={findContactByEmail}
                onContactClick={onContactClick}
              />
            ))}
            {filteredJourneys.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No participants found matching your search.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function ParticipantJourneyCard({
  journey,
  isExpanded,
  onToggle,
  findContactByEmail,
  onContactClick
}: {
  journey: ParticipantJourney;
  isExpanded: boolean;
  onToggle: () => void;
  findContactByEmail: (email: string) => Contact | undefined;
  onContactClick?: (email: string) => void;
}) {
  const contact = findContactByEmail(journey.email);
  
  // Mindset progression
  const mindsetBefore = journey.workshop?.mindsetBefore || "";
  const mindsetAfter = journey.workshop?.mindsetAfter || "";
  const hasMindsetChange = mindsetBefore && mindsetAfter && mindsetBefore !== mindsetAfter;

  // Confidence data
  const preConfidence = journey.preSurvey ? parseConfidenceLevel(journey.preSurvey.aiConfidence) : null;
  const postConfidence = journey.workshop?.confidenceUnderstanding || null;

  return (
    <Card 
      className={cn(
        "transition-all duration-200 cursor-pointer",
        isExpanded ? "ring-1 ring-primary/50" : "hover:border-primary/30"
      )}
      onClick={onToggle}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
              {journey.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm sm:text-base truncate">{journey.name}</p>
                {contact && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContactClick?.(journey.email);
                    }}
                  >
                    View
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{journey.email}</p>
            </div>
          </div>

          {/* Stage Progress Pills */}
          <div className="flex items-center gap-1 shrink-0">
            <div className={cn(
              "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full",
              journey.preSurvey ? "bg-primary" : "bg-muted"
            )} title="Pre-Survey" />
            <div className={cn(
              "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full",
              journey.workshop ? "bg-blue-500" : "bg-muted"
            )} title="Workshop" />
            <div className={cn(
              "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full",
              journey.buildDay ? "bg-emerald-500" : "bg-muted"
            )} title="Build Day" />
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
            )}
          </div>
        </div>

        {/* Quick Mindset Change Preview (collapsed) */}
        {!isExpanded && hasMindsetChange && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={getMindsetColor(mindsetBefore)}>
              {getMindsetEmoji(mindsetBefore)} {mindsetBefore.split(":")[0]}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={getMindsetColor(mindsetAfter)}>
              {getMindsetEmoji(mindsetAfter)} {mindsetAfter.split(":")[0]}
            </span>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Journey Timeline */}
            <div className="grid gap-3">
              {/* Pre-Survey Stage */}
              <div className={cn(
                "p-3 rounded-lg border",
                journey.preSurvey ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-dashed"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {journey.preSurvey ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Pre-Registration</span>
                </div>
                {journey.preSurvey && (
                  <div className="text-xs text-muted-foreground space-y-1 pl-6">
                    {journey.preSurvey.ageRange && (
                      <p><span className="font-medium">Age:</span> {journey.preSurvey.ageRange}</p>
                    )}
                    {journey.preSurvey.educationLevel && (
                      <p><span className="font-medium">Education:</span> {journey.preSurvey.educationLevel}</p>
                    )}
                    {journey.preSurvey.aiConfidence && (
                      <p><span className="font-medium">AI Confidence:</span> {journey.preSurvey.aiConfidence}</p>
                    )}
                    {journey.preSurvey.currentRole && (
                      <p><span className="font-medium">Role:</span> {journey.preSurvey.currentRole}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Workshop Stage */}
              <div className={cn(
                "p-3 rounded-lg border",
                journey.workshop ? "bg-blue-500/5 border-blue-500/20" : "bg-muted/30 border-dashed"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {journey.workshop ? (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Workshop Feedback</span>
                </div>
                {journey.workshop && (
                  <div className="text-xs text-muted-foreground space-y-2 pl-6">
                    {/* Mindset Change */}
                    {hasMindsetChange && (
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="font-medium text-foreground mb-1">Mindset Shift</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={getMindsetColor(mindsetBefore)}>
                            {getMindsetEmoji(mindsetBefore)} {mindsetBefore.split(":")[0]}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className={getMindsetColor(mindsetAfter)}>
                            {getMindsetEmoji(mindsetAfter)} {mindsetAfter.split(":")[0]}
                          </span>
                        </div>
                      </div>
                    )}
                    {journey.workshop.confidenceUnderstanding && (
                      <p><span className="font-medium">Confidence:</span> {journey.workshop.confidenceUnderstanding}/5</p>
                    )}
                    {journey.workshop.recommendLikelihood && (
                      <p><span className="font-medium">Would Recommend:</span> {journey.workshop.recommendLikelihood}/5</p>
                    )}
                    {journey.workshop.ahaMoment && (
                      <div className="mt-2 p-2 rounded bg-secondary/30 italic">
                        <p className="font-medium text-foreground not-italic mb-1">Aha Moment:</p>
                        "{journey.workshop.ahaMoment}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Build Day Stage */}
              <div className={cn(
                "p-3 rounded-lg border",
                journey.buildDay ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30 border-dashed"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {journey.buildDay ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Build Day</span>
                </div>
                {journey.buildDay && (
                  <div className="text-xs text-muted-foreground space-y-1 pl-6">
                    {journey.buildDay.confidenceSolving && (
                      <p><span className="font-medium">Confidence Solving:</span> {journey.buildDay.confidenceSolving}/5</p>
                    )}
                    {journey.buildDay.recommendLikelihood && (
                      <p><span className="font-medium">Would Recommend:</span> {journey.buildDay.recommendLikelihood}/5</p>
                    )}
                    {journey.buildDay.teamBuildDescription && (
                      <p><span className="font-medium">Project:</span> {journey.buildDay.teamBuildDescription.substring(0, 100)}...</p>
                    )}
                    {journey.buildDay.quote && (
                      <div className="mt-2 p-2 rounded bg-secondary/30 italic">
                        "{journey.buildDay.quote}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progression Summary */}
            {journey.preSurvey && journey.workshop && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Progression Summary
                </p>
                <div className="text-xs space-y-1">
                  {preConfidence && postConfidence && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-medium">{preConfidence}/5</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium">{postConfidence}/5</span>
                      {postConfidence > preConfidence && (
                        <Badge className="bg-emerald-500/20 text-emerald-500 text-[10px]">
                          <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                          +{postConfidence - preConfidence}
                        </Badge>
                      )}
                      {postConfidence < preConfidence && (
                        <Badge className="bg-red-500/20 text-red-500 text-[10px]">
                          <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                          {postConfidence - preConfidence}
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    Completed {journey.stagesCompleted} of 3 stages
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
