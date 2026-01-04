import { useState } from "react";
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
  GraduationCap
} from "lucide-react";
import { LTFFeedback, WorkshopFeedback } from "@/types/feedback";
import { Contact } from "@/types/contact";

interface FeedbackDashboardProps {
  contacts: Contact[];
  onContactClick?: (email: string) => void;
}

export function FeedbackDashboard({ contacts, onContactClick }: FeedbackDashboardProps) {
  const { ltfFeedback, workshopFeedback, ltfSummary, workshopSummary, loading, error } = useFeedback();
  const [view, setView] = useState<"summary" | "responses">("summary");
  const [selectedEvent, setSelectedEvent] = useState<"ltf" | "workshop">("ltf");

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

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView("summary")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "summary" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            Summary Dashboard
          </button>
          <button
            onClick={() => setView("responses")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "responses" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            Individual Responses
          </button>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Dec 13 LTF: {ltfFeedback.length}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Dec 6 Workshop: {workshopFeedback.length}
          </Badge>
        </div>
      </div>

      {view === "summary" ? (
        <FeedbackSummaryView 
          ltfSummary={ltfSummary}
          workshopSummary={workshopSummary}
          ltfFeedback={ltfFeedback}
          workshopFeedback={workshopFeedback}
        />
      ) : (
        <FeedbackResponsesView
          ltfFeedback={ltfFeedback}
          workshopFeedback={workshopFeedback}
          selectedEvent={selectedEvent}
          onEventChange={setSelectedEvent}
          findContactByEmail={findContactByEmail}
          onContactClick={onContactClick}
        />
      )}
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
  ltfFeedback: LTFFeedback[];
  workshopFeedback: WorkshopFeedback[];
}

function FeedbackSummaryView({ ltfSummary, workshopSummary, ltfFeedback, workshopFeedback }: FeedbackSummaryViewProps) {
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

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ltfSummary.totalResponses + workshopSummary.totalResponses}</p>
                <p className="text-xs text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ltfSummary.averageRating.toFixed(1)}/5</p>
                <p className="text-xs text-muted-foreground">Avg LTF Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+{ltfSummary.averageConfidenceGain.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Confidence Gain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workshopSummary.wouldAttendBuildDayRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Want Build Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
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
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / ltfFeedback.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Mindset Shift */}
        <Card>
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
      </div>

      {/* Notable Quotes */}
      {notableQuotes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Quote className="h-4 w-4" />
              Participant Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {notableQuotes.map((feedback, i) => (
                <div key={i} className="p-4 bg-secondary/30 rounded-lg border border-border/50">
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
  selectedEvent: "ltf" | "workshop";
  onEventChange: (event: "ltf" | "workshop") => void;
  findContactByEmail: (email: string) => Contact | undefined;
  onContactClick?: (email: string) => void;
}

function FeedbackResponsesView({ 
  ltfFeedback, 
  workshopFeedback, 
  selectedEvent, 
  onEventChange,
  findContactByEmail,
  onContactClick
}: FeedbackResponsesViewProps) {
  return (
    <div className="space-y-4">
      <Tabs value={selectedEvent} onValueChange={(v) => onEventChange(v as "ltf" | "workshop")}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="ltf">Lead the Future (Dec 13)</TabsTrigger>
          <TabsTrigger value="workshop">ASPIRE Workshop (Dec 6)</TabsTrigger>
        </TabsList>

        <TabsContent value="ltf" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {ltfFeedback.map((feedback) => (
                <LTFResponseCard 
                  key={feedback.submissionId} 
                  feedback={feedback}
                  contact={findContactByEmail(feedback.email)}
                  onContactClick={onContactClick}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="workshop" className="mt-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {workshopFeedback.map((feedback) => (
                <WorkshopResponseCard 
                  key={feedback.submissionId} 
                  feedback={feedback}
                  contact={findContactByEmail(feedback.email)}
                  onContactClick={onContactClick}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
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
    <Card className="hover:shadow-md transition-shadow">
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
    <Card className="hover:shadow-md transition-shadow">
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

            <div className="flex flex-wrap gap-1">
              {feedback.toolsUsed.map((tool, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            {new Date(feedback.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
