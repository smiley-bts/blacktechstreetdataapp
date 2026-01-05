import { useState, useMemo } from "react";
import { useFeedback } from "@/hooks/useFeedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  TrendingUp, 
  Star, 
  Users,
  ChevronRight,
  Quote,
  Calendar,
  GraduationCap,
  ClipboardList
} from "lucide-react";
import { LTFFeedback, WorkshopFeedback, PreSurveyFeedback } from "@/types/feedback";
import { Contact } from "@/types/contact";

interface FeedbackDashboardProps {
  contacts: Contact[];
  onContactClick?: (email: string) => void;
}

// Event configuration for organizing feedback
interface EventConfig {
  id: string;
  name: string;
  shortName: string;
  dates: string;
  surveys: {
    id: string;
    name: string;
    type: "pre" | "post" | "ltf" | "workshop";
  }[];
}

const EVENTS: EventConfig[] = [
  {
    id: "dec-2025",
    name: "December 2025 ASPIRE",
    shortName: "Dec 2025",
    dates: "Dec 6-13, 2025",
    surveys: [
      { id: "pre", name: "Pre-Survey", type: "pre" },
      { id: "workshop", name: "Workshop Feedback (Dec 6)", type: "workshop" },
      { id: "ltf", name: "Lead The Future (Dec 13)", type: "ltf" },
    ]
  },
  {
    id: "jun-2025",
    name: "June 2025 ASPIRE Build Day",
    shortName: "Jun 2025",
    dates: "Jun 27-28, 2025",
    surveys: [
      { id: "pre", name: "Pre-Survey", type: "pre" },
      { id: "post", name: "Post-Survey", type: "workshop" },
    ]
  }
];

export function FeedbackDashboard({ contacts, onContactClick }: FeedbackDashboardProps) {
  const { 
    ltfFeedback, 
    workshopFeedback, 
    preSurveyFeedback,
    ltfSummary, 
    workshopSummary,
    preSurveySummary,
    loading, 
    error 
  } = useFeedback();
  
  const [selectedEvent, setSelectedEvent] = useState("dec-2025");
  const [view, setView] = useState<"summary" | "responses">("summary");

  // Get the current event config
  const currentEvent = EVENTS.find(e => e.id === selectedEvent) || EVENTS[0];

  // Filter feedback by event date
  const eventFeedback = useMemo(() => {
    if (selectedEvent === "dec-2025") {
      return {
        ltf: ltfFeedback.filter(f => f.submittedAt.startsWith("2025-12")),
        workshop: workshopFeedback.filter(f => f.submittedAt.startsWith("2025-12")),
        pre: preSurveyFeedback.filter(f => f.submittedAt.startsWith("2025-12") || f.submittedAt.startsWith("2025-11")),
      };
    } else if (selectedEvent === "jun-2025") {
      return {
        ltf: ltfFeedback.filter(f => f.submittedAt.startsWith("2025-06")),
        workshop: workshopFeedback.filter(f => f.submittedAt.startsWith("2025-06")),
        pre: preSurveyFeedback.filter(f => f.submittedAt.startsWith("2025-06")),
      };
    }
    return { ltf: [], workshop: [], pre: [] };
  }, [selectedEvent, ltfFeedback, workshopFeedback, preSurveyFeedback]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error loading feedback: {error}
      </div>
    );
  }

  const findContactByEmail = (email: string) => {
    return contacts.find(c => c.email?.toLowerCase() === email?.toLowerCase());
  };

  const totalResponses = eventFeedback.ltf.length + eventFeedback.workshop.length + eventFeedback.pre.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Event Tabs */}
      <Tabs value={selectedEvent} onValueChange={setSelectedEvent}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList className="bg-secondary/50">
            {EVENTS.map((event) => (
              <TabsTrigger 
                key={event.id} 
                value={event.id}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {event.shortName}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex gap-2">
            <button
              onClick={() => setView("summary")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === "summary" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Summary Dashboard
            </button>
            <button
              onClick={() => setView("responses")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === "responses" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Individual Responses
            </button>
          </div>
        </div>

        {EVENTS.map((event) => (
          <TabsContent key={event.id} value={event.id} className="mt-6">
            {/* Event Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-sm text-muted-foreground">{event.dates}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {eventFeedback.pre.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <ClipboardList className="h-3 w-3" />
                    Pre-Survey: {eventFeedback.pre.length}
                  </Badge>
                )}
                {eventFeedback.workshop.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Workshop: {eventFeedback.workshop.length}
                  </Badge>
                )}
                {eventFeedback.ltf.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <GraduationCap className="h-3 w-3" />
                    LTF: {eventFeedback.ltf.length}
                  </Badge>
                )}
              </div>
            </div>

            {view === "summary" ? (
              <FeedbackSummaryView 
                ltfSummary={ltfSummary}
                workshopSummary={workshopSummary}
                preSurveySummary={preSurveySummary}
                ltfFeedback={eventFeedback.ltf}
                workshopFeedback={eventFeedback.workshop}
                preSurveyFeedback={eventFeedback.pre}
                eventId={event.id}
              />
            ) : (
              <FeedbackResponsesView
                ltfFeedback={eventFeedback.ltf}
                workshopFeedback={eventFeedback.workshop}
                preSurveyFeedback={eventFeedback.pre}
                surveys={event.surveys}
                findContactByEmail={findContactByEmail}
                onContactClick={onContactClick}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface FeedbackSummaryViewProps {
  ltfSummary: {
    totalResponses: number;
    averageRating: number;
    averageConfidenceGain: number;
    hasPersonalStatementRate: number;
  };
  workshopSummary: {
    totalResponses: number;
    averageRecommendation: number;
    wouldAttendBuildDayRate: number;
    averageConfidenceGain: number;
  };
  preSurveySummary: {
    totalResponses: number;
    averageConfidence: number;
    averageAiExperience: number;
  };
  ltfFeedback: LTFFeedback[];
  workshopFeedback: WorkshopFeedback[];
  preSurveyFeedback: PreSurveyFeedback[];
  eventId: string;
}

function FeedbackSummaryView({ 
  ltfSummary, 
  workshopSummary,
  preSurveySummary,
  ltfFeedback, 
  workshopFeedback,
  preSurveyFeedback,
  eventId 
}: FeedbackSummaryViewProps) {
  // Extract notable quotes (from workshop feedback highlights)
  const notableQuotes = workshopFeedback
    .filter(f => f.highlightTakeaway && f.highlightTakeaway.length > 20 && f.sharePermission)
    .slice(0, 5);

  // Calculate grade distribution for LTF
  const gradeDistribution = ltfFeedback.reduce((acc, f) => {
    const grade = f.gradeLevel || "Unknown";
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate mindset shift
  const mindsetShift = {
    optimists: workshopFeedback.filter(f => f.mindsetAfter?.includes("Optimist")).length,
    cultivators: workshopFeedback.filter(f => f.mindsetAfter?.includes("Cultivator")).length,
    anchors: workshopFeedback.filter(f => f.mindsetAfter?.includes("Anchor")).length,
  };

  const totalResponses = ltfFeedback.length + workshopFeedback.length + preSurveyFeedback.length;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalResponses}</p>
                <p className="text-xs text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ltfFeedback.length > 0 
                    ? (ltfFeedback.reduce((sum, f) => sum + f.overallRating, 0) / ltfFeedback.length).toFixed(1)
                    : "—"}/5
                </p>
                <p className="text-xs text-muted-foreground">Avg LTF Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ltfFeedback.length > 0
                    ? `+${(ltfFeedback.reduce((sum, f) => sum + (f.confidenceAfter - f.confidenceBefore), 0) / ltfFeedback.length).toFixed(1)}`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Confidence Gain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workshopFeedback.length > 0
                    ? `${(workshopFeedback.filter(f => f.wouldAttendBuildDay).length / workshopFeedback.length * 100).toFixed(0)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Want Build Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        {ltfFeedback.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                LTF Grade Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(gradeDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([grade, count]) => (
                    <div key={grade} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{grade}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(count / ltfFeedback.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mindset Shift */}
        {workshopFeedback.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Post-Workshop Mindset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-700 dark:text-emerald-400">Cultivators</p>
                    <p className="text-xs text-muted-foreground">Ready to bridge ideas & people</p>
                  </div>
                  <span className="text-2xl font-bold">{mindsetShift.cultivators}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">Optimists</p>
                    <p className="text-xs text-muted-foreground">Energized to experiment</p>
                  </div>
                  <span className="text-2xl font-bold">{mindsetShift.optimists}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-400">Anchors</p>
                    <p className="text-xs text-muted-foreground">Ethics & long-term focus</p>
                  </div>
                  <span className="text-2xl font-bold">{mindsetShift.anchors}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pre-Survey Summary */}
        {preSurveyFeedback.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Pre-Survey Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div>
                    <p className="font-medium">Registered Participants</p>
                    <p className="text-xs text-muted-foreground">Completed pre-survey</p>
                  </div>
                  <span className="text-2xl font-bold">{preSurveyFeedback.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">Avg AI Experience</p>
                    <p className="text-xs text-muted-foreground">Self-reported level</p>
                  </div>
                  <span className="text-2xl font-bold">
                    {preSurveyFeedback.length > 0
                      ? (preSurveyFeedback.reduce((sum, f) => sum + f.aiExperience, 0) / preSurveyFeedback.length).toFixed(1)
                      : "—"}/5
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notable Quotes */}
      {notableQuotes.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Quote className="h-4 w-4" />
              Participant Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {notableQuotes.map((feedback, i) => (
                <div 
                  key={i} 
                  className="p-4 bg-secondary/30 rounded-lg border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className="text-sm italic text-foreground/80">"{feedback.highlightTakeaway}"</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — {feedback.firstName} {feedback.lastName}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FeedbackResponsesViewProps {
  ltfFeedback: LTFFeedback[];
  workshopFeedback: WorkshopFeedback[];
  preSurveyFeedback: PreSurveyFeedback[];
  surveys: EventConfig["surveys"];
  findContactByEmail: (email: string) => Contact | undefined;
  onContactClick?: (email: string) => void;
}

function FeedbackResponsesView({ 
  ltfFeedback, 
  workshopFeedback,
  preSurveyFeedback,
  surveys,
  findContactByEmail,
  onContactClick
}: FeedbackResponsesViewProps) {
  const [selectedSurvey, setSelectedSurvey] = useState(surveys[0]?.id || "workshop");

  // Filter surveys that have data
  const availableSurveys = surveys.filter(s => {
    if (s.type === "ltf") return ltfFeedback.length > 0;
    if (s.type === "workshop" || s.type === "post") return workshopFeedback.length > 0;
    if (s.type === "pre") return preSurveyFeedback.length > 0;
    return false;
  });

  return (
    <div className="space-y-4">
      <Tabs value={selectedSurvey} onValueChange={setSelectedSurvey}>
        <TabsList className="bg-secondary/50">
          {availableSurveys.map((survey) => (
            <TabsTrigger key={survey.id} value={survey.id}>
              {survey.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {survey.type === "ltf" ? ltfFeedback.length : 
                 survey.type === "pre" ? preSurveyFeedback.length :
                 workshopFeedback.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {availableSurveys.map((survey) => (
          <TabsContent key={survey.id} value={survey.id} className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {survey.type === "ltf" && ltfFeedback.map((feedback) => (
                  <LTFResponseCard 
                    key={feedback.submissionId} 
                    feedback={feedback}
                    contact={findContactByEmail(feedback.email)}
                    onContactClick={onContactClick}
                  />
                ))}
                {(survey.type === "workshop" || survey.type === "post") && workshopFeedback.map((feedback) => (
                  <WorkshopResponseCard 
                    key={feedback.submissionId} 
                    feedback={feedback}
                    contact={findContactByEmail(feedback.email)}
                    onContactClick={onContactClick}
                  />
                ))}
                {survey.type === "pre" && preSurveyFeedback.map((feedback) => (
                  <PreSurveyResponseCard 
                    key={feedback.submissionId} 
                    feedback={feedback}
                    contact={findContactByEmail(feedback.email)}
                    onContactClick={onContactClick}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function LTFResponseCard({ 
  feedback, 
  contact,
  onContactClick 
}: { 
  feedback: LTFFeedback; 
  contact?: Contact;
  onContactClick?: (email: string) => void;
}) {
  const confidenceGain = feedback.confidenceAfter - feedback.confidenceBefore;

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {feedback.gradeLevel || "Unknown"}
              </Badge>
              <Badge 
                variant={feedback.overallRating >= 4 ? "default" : "secondary"}
                className="gap-1"
              >
                <Star className="h-3 w-3" />
                {feedback.overallRating}/5
              </Badge>
              <Badge 
                variant={confidenceGain > 0 ? "default" : "secondary"}
                className={confidenceGain > 0 ? "bg-emerald-500" : ""}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {confidenceGain > 0 ? "+" : ""}{confidenceGain} confidence
              </Badge>
              {contact && (
                <button
                  onClick={() => onContactClick?.(feedback.email)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View Contact <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {feedback.favoriteActivity && (
              <p className="text-sm">
                <span className="text-muted-foreground">Favorite: </span>
                {feedback.favoriteActivity}
              </p>
            )}

            {feedback.plannedUses.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {feedback.plannedUses.map((use, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {use}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="text-right text-xs text-muted-foreground">
            {new Date(feedback.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkshopResponseCard({ 
  feedback, 
  contact,
  onContactClick 
}: { 
  feedback: WorkshopFeedback; 
  contact?: Contact;
  onContactClick?: (email: string) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {feedback.firstName} {feedback.lastName}
              </span>
              <Badge 
                variant={feedback.recommendLikelihood >= 4 ? "default" : "secondary"}
                className="gap-1"
              >
                <Star className="h-3 w-3" />
                {feedback.recommendLikelihood}/5 recommend
              </Badge>
              {feedback.wouldAttendBuildDay && (
                <Badge className="bg-emerald-500 text-white">
                  Wants Build Day
                </Badge>
              )}
              {contact && (
                <button
                  onClick={() => onContactClick?.(feedback.email)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View Contact <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {feedback.highlightTakeaway && (
              <p className="text-sm italic text-foreground/80">
                "{feedback.highlightTakeaway}"
              </p>
            )}

            {feedback.mindsetAfter && (
              <Badge variant="outline" className="text-xs">
                Mindset: {feedback.mindsetAfter.split("–")[0].trim()}
              </Badge>
            )}
          </div>

          <div className="text-right text-xs text-muted-foreground">
            {new Date(feedback.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreSurveyResponseCard({ 
  feedback, 
  contact,
  onContactClick 
}: { 
  feedback: PreSurveyFeedback; 
  contact?: Contact;
  onContactClick?: (email: string) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {feedback.firstName} {feedback.lastName}
              </span>
              <Badge variant="outline" className="gap-1">
                AI Exp: {feedback.aiExperience}/5
              </Badge>
              <Badge variant="outline" className="gap-1">
                Confidence: {feedback.confidence}/5
              </Badge>
              {feedback.ageRange && (
                <Badge variant="secondary" className="text-xs">
                  {feedback.ageRange}
                </Badge>
              )}
              {contact && (
                <button
                  onClick={() => onContactClick?.(feedback.email)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View Contact <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {feedback.industry && (
              <p className="text-sm">
                <span className="text-muted-foreground">Industry: </span>
                {feedback.industry}
              </p>
            )}

            {feedback.aiApplicationPlans.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {feedback.aiApplicationPlans.slice(0, 3).map((plan, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {plan}
                  </Badge>
                ))}
                {feedback.aiApplicationPlans.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{feedback.aiApplicationPlans.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="text-right text-xs text-muted-foreground">
            {new Date(feedback.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
