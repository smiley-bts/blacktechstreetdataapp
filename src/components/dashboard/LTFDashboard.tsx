import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { TrendingUp, Users, Lightbulb, ChevronDown, ChevronUp, Search, GraduationCap } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { ConfidenceChart } from "./ConfidenceChart";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LTFMetrics {
  avgOverallRating: number;
  avgEngagement: number;
  avgContentClarity: number;
  avgConfidenceSharing: number;
  personalStatementPct: number;
  futureInterestPct: number;
  wantsFutureProgramsPct: number;
  confidenceBefore: { name: string; value: number }[];
  confidenceAfter: { name: string; value: number }[];
  gradeDistribution: { name: string; value: number }[];
  futureUsePlans: { name: string; value: number }[];
  mostHelpful: { name: string; value: number }[];
  totalResponses: number;
}

interface LTFParticipant {
  submissionId: string;
  email: string;
  grade: string;
  responses: Record<string, string>;
}

export function LTFDashboard() {
  const [metrics, setMetrics] = useState<LTFMetrics | null>(null);
  const [participants, setParticipants] = useState<LTFParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openParticipants, setOpenParticipants] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const toggleParticipant = (id: string) => {
    setOpenParticipants(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const loadData = async () => {
    try {
      const response = await fetch("/aspire-ltf-feedback.csv");
      if (!response.ok) {
        setError("Unable to load LTF survey data.");
        setLoading(false);
        return;
      }

      const content = await response.text();
      const data = await new Promise<Record<string, string>[]>((resolve, reject) => {
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as Record<string, string>[]),
          error: (err) => reject(err),
        });
      });

      const cleanedData = data.filter((row) => 
        Object.keys(row).length > 0 && row["Submission ID"]
      );

      const participantList: LTFParticipant[] = cleanedData.map((row) => ({
        submissionId: row["Submission ID"] || "",
        email: row["Email"] || "",
        grade: row["Which grade are you currently in? (Optional)"] || "",
        responses: row,
      }));

      setParticipants(participantList);
      calculateMetrics(cleanedData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unexpected error loading LTF data.");
      setLoading(false);
    }
  };

  const extractRating = (value: string | undefined): number | null => {
    if (!value) return null;
    const match = String(value).trim().match(/^(\d)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const countResponses = (rows: Record<string, string>[], key: string) => {
    const counts: Record<string, number> = {};
    rows.forEach((row) => {
      const val = row[key];
      if (val && String(val).trim()) {
        const cleaned = String(val).trim();
        counts[cleaned] = (counts[cleaned] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const countMultiResponses = (rows: Record<string, string>[], key: string) => {
    const counts: Record<string, number> = {};
    rows.forEach((row) => {
      const val = row[key];
      if (val) {
        String(val).split(",").forEach((item) => {
          const cleaned = item.trim();
          if (cleaned) counts[cleaned] = (counts[cleaned] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const calculateMetrics = (rawData: Record<string, string>[]) => {
    // Calculate averages
    const overallRatings = rawData.map(r => extractRating(r["Overall, how would you rate your experience in the ASPIRE: Lead the Future with AI workshop?"])).filter((v): v is number => v !== null);
    const engagementRatings = rawData.map(r => extractRating(r["The workshop was engaging and held my attention."])).filter((v): v is number => v !== null);
    const clarityRatings = rawData.map(r => extractRating(r["The content was explained in a way I could understand."])).filter((v): v is number => v !== null);
    const confidenceSharingRatings = rawData.map(r => extractRating(r["The workshop helped me feel more confident sharing my ideas and personal story."])).filter((v): v is number => v !== null);

    const avgOverallRating = overallRatings.length > 0 ? overallRatings.reduce((a, b) => a + b, 0) / overallRatings.length : 0;
    const avgEngagement = engagementRatings.length > 0 ? engagementRatings.reduce((a, b) => a + b, 0) / engagementRatings.length : 0;
    const avgContentClarity = clarityRatings.length > 0 ? clarityRatings.reduce((a, b) => a + b, 0) / clarityRatings.length : 0;
    const avgConfidenceSharing = confidenceSharingRatings.length > 0 ? confidenceSharingRatings.reduce((a, b) => a + b, 0) / confidenceSharingRatings.length : 0;

    // Percentages
    const personalStatementCount = rawData.filter(r => r["I left the workshop with a personal statement or story that I am proud of."]?.toLowerCase() === "yes").length;
    const futureInterestCount = rawData.filter(r => {
      const val = extractRating(r["After this workshop, how interested are you in learning more about AI or technology?"]);
      return val !== null && val >= 4;
    }).length;
    const wantsFutureCount = rawData.filter(r => r["Would you like to hear about future Black Tech Street ASPIRE programs?"]?.toLowerCase() === "yes").length;

    // Confidence before/after
    const confidenceBefore = countResponses(rawData, "BEFORE today's workshop, how confident were you in using AI tools like ChatGPT?");
    const confidenceAfter = countResponses(rawData, "AFTER today's workshop, how confident do you feel using AI tools like ChatGPT?");

    // Grade distribution
    const gradeDistribution = countResponses(rawData, "Which grade are you currently in? (Optional)").filter(g => g.name);

    // Future use plans
    const futureUsePlans = countMultiResponses(rawData, "Which of the following do you plan to use what your learned today for in the next 3-6 months?");

    // Most helpful
    const mostHelpful = countResponses(rawData, "What part of the workshop was most helpful for you?");

    setMetrics({
      avgOverallRating,
      avgEngagement,
      avgContentClarity,
      avgConfidenceSharing,
      personalStatementPct: Math.round((personalStatementCount / rawData.length) * 100),
      futureInterestPct: Math.round((futureInterestCount / rawData.length) * 100),
      wantsFutureProgramsPct: Math.round((wantsFutureCount / rawData.length) * 100),
      confidenceBefore,
      confidenceAfter,
      gradeDistribution,
      futureUsePlans,
      mostHelpful,
      totalResponses: rawData.length,
    });
  };

  const renderAnswerRow = (label: string, value: string | undefined) => {
    if (!value || !value.trim()) return null;
    return (
      <div className="py-2 border-b border-border/50 last:border-0">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    );
  };

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const query = searchQuery.toLowerCase();
    return participants.filter(p => 
      p.email.toLowerCase().includes(query) ||
      p.grade.toLowerCase().includes(query) ||
      p.submissionId.toLowerCase().includes(query)
    );
  }, [participants, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading LTF survey data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="glass-card rounded-xl p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-2">Unable to Load Data</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Processing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Feedback from {metrics.totalResponses} student participants
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Rating"
          value={metrics.avgOverallRating.toFixed(1)}
          subtitle="out of 5"
          icon={TrendingUp}
          variant="blue"
          delay={100}
        />
        <MetricCard
          title="Engagement"
          value={metrics.avgEngagement.toFixed(1)}
          subtitle="Workshop attention"
          icon={Lightbulb}
          variant="purple"
          delay={200}
        />
        <MetricCard
          title="Content Clarity"
          value={metrics.avgContentClarity.toFixed(1)}
          subtitle="Easy to understand"
          icon={Users}
          variant="amber"
          delay={300}
        />
        <MetricCard
          title="Personal Statement"
          value={`${metrics.personalStatementPct}%`}
          subtitle="Left proud of their story"
          icon={GraduationCap}
          variant="blue"
          delay={400}
        />
      </div>

      {/* Confidence Before vs After */}
      <ChartCard title="Confidence: Before vs After Workshop" delay={500}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ConfidenceChart 
            data={metrics.confidenceBefore} 
            title="Before Workshop" 
            color="hsl(0 72% 51%)" 
          />
          <ConfidenceChart 
            data={metrics.confidenceAfter} 
            title="After Workshop" 
            color="hsl(160 84% 39%)" 
          />
        </div>
      </ChartCard>

      {/* Grade Distribution */}
      {metrics.gradeDistribution.length > 0 && (
        <ChartCard title="Grade Distribution" delay={600}>
          <HorizontalBarChart data={metrics.gradeDistribution} color="hsl(263 70% 58%)" />
        </ChartCard>
      )}

      {/* Future Use Plans */}
      {metrics.futureUsePlans.length > 0 && (
        <ChartCard title="How Students Plan to Use What They Learned" delay={700}>
          <HorizontalBarChart data={metrics.futureUsePlans} color="hsl(217 91% 60%)" />
        </ChartCard>
      )}

      {/* Most Helpful Part */}
      {metrics.mostHelpful.length > 0 && (
        <ChartCard title="Most Helpful Part of Workshop" delay={800}>
          <HorizontalBarChart data={metrics.mostHelpful} color="hsl(38 92% 50%)" />
        </ChartCard>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Future Interest"
          value={`${metrics.futureInterestPct}%`}
          subtitle="Want to learn more about AI"
          icon={Lightbulb}
          variant="purple"
          delay={850}
        />
        <MetricCard
          title="Want Future Programs"
          value={`${metrics.wantsFutureProgramsPct}%`}
          subtitle="Interested in ASPIRE updates"
          icon={Users}
          variant="amber"
          delay={900}
        />
      </div>

      {/* Individual Responses */}
      <ChartCard title={`Individual Student Responses (${participants.length} total)`} delay={950}>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by email or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {filteredParticipants.length} of {participants.length} participants
            </p>
          )}
        </div>

        <div className="space-y-2">
          {filteredParticipants.map((p, idx) => (
            <Collapsible
              key={p.submissionId}
              open={openParticipants.has(p.submissionId)}
              onOpenChange={() => toggleParticipant(p.submissionId)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">
                        Student #{idx + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.grade || "Grade not specified"} {p.email && `• ${p.email}`}
                      </div>
                    </div>
                  </div>
                  {openParticipants.has(p.submissionId) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-card border border-border rounded-lg mt-2 space-y-1">
                  {renderAnswerRow("Overall Rating", p.responses["Overall, how would you rate your experience in the ASPIRE: Lead the Future with AI workshop?"])}
                  {renderAnswerRow("Engagement", p.responses["The workshop was engaging and held my attention."])}
                  {renderAnswerRow("Content Clarity", p.responses["The content was explained in a way I could understand."])}
                  {renderAnswerRow("Confidence Before", p.responses["BEFORE today's workshop, how confident were you in using AI tools like ChatGPT?"])}
                  {renderAnswerRow("Confidence After", p.responses["AFTER today's workshop, how confident do you feel using AI tools like ChatGPT?"])}
                  {renderAnswerRow("AI Understanding", p.responses["After this workshop, how well do you understand what artificial intelligence (AI) is?"])}
                  {renderAnswerRow("Understands AI Bias", p.responses["I understand that AI can sometimes give biased or incorrect information."])}
                  {renderAnswerRow("Responsible AI Use", p.responses["Which statement best describes responsible AI use?"])}
                  {renderAnswerRow("Confidence Sharing Ideas", p.responses["The workshop helped me feel more confident sharing my ideas and personal story."])}
                  {renderAnswerRow("Personal Statement", p.responses["I left the workshop with a personal statement or story that I am proud of."])}
                  {renderAnswerRow("Future Use Plans", p.responses["Which of the following do you plan to use what your learned today for in the next 3-6 months?"])}
                  {renderAnswerRow("Future Interest", p.responses["After this workshop, how interested are you in learning more about AI or technology?"])}
                  {renderAnswerRow("Most Helpful Part", p.responses["What part of the workshop was most helpful for you?"])}
                  {renderAnswerRow("Favorite Moment", p.responses["What was your favorite moment or activity from today's workshop?"])}
                  {renderAnswerRow("Improvement Suggestions", p.responses["Is there anything you would change or add to improve this workshop?"])}
                  {renderAnswerRow("Wants Future Programs", p.responses["Would you like to hear about future Black Tech Street ASPIRE programs?"])}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
