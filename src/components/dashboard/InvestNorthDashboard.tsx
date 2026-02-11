import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { TrendingUp, Users, Lightbulb, ChevronDown, ChevronUp, Search, Target, Brain, BookOpen, Heart } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { NPSCard } from "./NPSCard";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Column name constants from the CSV
const COL = {
  FIRST_NAME: "What's your first name?",
  LAST_NAME: "What's your last name?",
  EMAIL: "What's your email?",
  SATISFIED: "I was satisfied with the ASPIRE session I attended.",
  AI_COMMUNITY: "The session helped me understand how AI tools like Chat GPT can support community-driven work.",
  FACILITATORS: "The facilitators explained concepts clearly.",
  SUPPORTED: "I felt supported during the group activity.",
  PROMPTING: "The AI exercise helped me understand how to write more effective prompts.",
  INSTRUCTIONS: "The activity instructions were clear and easy to follow.",
  PILLARS: "The session helped me see how AI could support InvestNorth's pillars (housing, general wealth, community wellness, youth development).",
  CONFIDENT: "After the session, I feel confident using AI as a thought partner.",
  PREPARED: "I feel prepared to apply what I learned about prompting in my work.",
  LIKELY_USE: "I am likely to use ChatGPT or AI prompting techniques in my work with InvestNorth.",
  NPS: "How likely are you to recommend an ASPIRE training to a colleague or partner?",
  HIGHLIGHT: "Please share one highlight or takeaway from your experience during the session.",
  TOPICS: "What AI topics or skills would you like to learn more about?",
  FUTURE: "Would you like to hear about future Black Tech Street ASPIRE programs?",
  IMPROVE: "What is one thing that would have improved your experience during the session?",
};

interface NPSData {
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
  promotersCount: number;
  passivesCount: number;
  detractorsCount: number;
}

interface Metrics {
  avgSatisfied: number;
  avgAICommunity: number;
  avgFacilitators: number;
  avgSupported: number;
  avgPrompting: number;
  avgInstructions: number;
  avgPillars: number;
  avgConfident: number;
  avgPrepared: number;
  avgLikelyUse: number;
  futureInterestPct: number;
  topicInterests: { name: string; value: number }[];
  totalResponses: number;
  nps: NPSData;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  responses: Record<string, string>;
}

const LIKERT_LABELS: { key: string; label: string }[] = [
  { key: "avgSatisfied", label: "Session Satisfaction" },
  { key: "avgAICommunity", label: "AI for Community Work" },
  { key: "avgFacilitators", label: "Facilitator Clarity" },
  { key: "avgSupported", label: "Felt Supported" },
  { key: "avgPrompting", label: "Prompting Skills" },
  { key: "avgInstructions", label: "Instruction Clarity" },
  { key: "avgPillars", label: "AI × InvestNorth Pillars" },
  { key: "avgConfident", label: "AI Confidence" },
  { key: "avgPrepared", label: "Prepared to Apply" },
  { key: "avgLikelyUse", label: "Likely to Use AI" },
];

export function InvestNorthDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const loadData = async () => {
    try {
      const response = await fetch(`/investnorth-feedback.csv?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) {
        setError("Unable to load feedback data.");
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

      const cleanedData = data.filter((row) => Object.keys(row).length > 0 && row["Submitted at"]);

      const participantList: Participant[] = cleanedData.map((row, idx) => ({
        id: `participant-${idx}`,
        name: `${row[COL.FIRST_NAME] || ""} ${row[COL.LAST_NAME] || ""}`.trim(),
        email: row[COL.EMAIL] || "",
        responses: row,
      }));

      setParticipants(participantList);
      calculateMetrics(cleanedData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unexpected error loading data.");
      setLoading(false);
    }
  };

  const extractRating = (value: string | undefined): number | null => {
    if (!value) return null;
    const match = String(value).trim().match(/^(\d)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const avg = (rows: Record<string, string>[], key: string): number => {
    const vals = rows.map(r => extractRating(r[key])).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const calculateMetrics = (rawData: Record<string, string>[]) => {
    // NPS from recommendation question (1-5 scale: 5=Promoter, 4=Passive, 1-3=Detractor)
    const npsRatings = rawData.map(r => extractRating(r[COL.NPS])).filter((v): v is number => v !== null);
    let promotersCount = 0, passivesCount = 0, detractorsCount = 0;
    npsRatings.forEach(r => {
      if (r === 5) promotersCount++;
      else if (r === 4) passivesCount++;
      else detractorsCount++;
    });
    const total = npsRatings.length;
    const promotersPct = total > 0 ? Math.round((promotersCount / total) * 100) : 0;
    const passivesPct = total > 0 ? Math.round((passivesCount / total) * 100) : 0;
    const detractorsPct = total > 0 ? Math.round((detractorsCount / total) * 100) : 0;

    // Topic interests (comma-separated multi-select)
    const topicCounts: Record<string, number> = {};
    rawData.forEach(row => {
      const val = row[COL.TOPICS];
      if (val) {
        val.split(",").forEach(item => {
          const cleaned = item.trim();
          if (cleaned) topicCounts[cleaned] = (topicCounts[cleaned] || 0) + 1;
        });
      }
    });
    const topicInterests = Object.entries(topicCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const futureCount = rawData.filter(r => r[COL.FUTURE]?.toLowerCase() === "yes").length;

    setMetrics({
      avgSatisfied: avg(rawData, COL.SATISFIED),
      avgAICommunity: avg(rawData, COL.AI_COMMUNITY),
      avgFacilitators: avg(rawData, COL.FACILITATORS),
      avgSupported: avg(rawData, COL.SUPPORTED),
      avgPrompting: avg(rawData, COL.PROMPTING),
      avgInstructions: avg(rawData, COL.INSTRUCTIONS),
      avgPillars: avg(rawData, COL.PILLARS),
      avgConfident: avg(rawData, COL.CONFIDENT),
      avgPrepared: avg(rawData, COL.PREPARED),
      avgLikelyUse: avg(rawData, COL.LIKELY_USE),
      futureInterestPct: Math.round((futureCount / rawData.length) * 100),
      topicInterests,
      totalResponses: rawData.length,
      nps: {
        nps: promotersPct - detractorsPct,
        promoters: promotersPct,
        passives: passivesPct,
        detractors: detractorsPct,
        total,
        promotersCount,
        passivesCount,
        detractorsCount,
      },
    });
  };

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const query = searchQuery.toLowerCase();
    return participants.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query)
    );
  }, [participants, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading feedback data...</p>
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

  // Top 4 metric cards
  const topMetrics = [
    { title: "Session Satisfaction", value: metrics.avgSatisfied, icon: TrendingUp, variant: "blue" as const, subtitle: "out of 5" },
    { title: "Facilitator Clarity", value: metrics.avgFacilitators, icon: BookOpen, variant: "purple" as const, subtitle: "out of 5" },
    { title: "AI Confidence", value: metrics.avgConfident, icon: Brain, variant: "amber" as const, subtitle: "out of 5" },
    { title: "Prompting Skills", value: metrics.avgPrompting, icon: Target, variant: "blue" as const, subtitle: "out of 5" },
  ];

  // All 10 Likert averages for the bar chart
  const likertBarData = LIKERT_LABELS.map(({ key, label }) => ({
    name: label,
    value: parseFloat((metrics[key as keyof Metrics] as number).toFixed(2)),
  }));

  const QUESTION_LABELS: { col: string; label: string }[] = [
    { col: COL.SATISFIED, label: "Session Satisfaction" },
    { col: COL.AI_COMMUNITY, label: "AI for Community Work" },
    { col: COL.FACILITATORS, label: "Facilitator Clarity" },
    { col: COL.SUPPORTED, label: "Felt Supported" },
    { col: COL.PROMPTING, label: "Prompting Skills" },
    { col: COL.INSTRUCTIONS, label: "Instruction Clarity" },
    { col: COL.PILLARS, label: "AI × InvestNorth Pillars" },
    { col: COL.CONFIDENT, label: "AI Confidence" },
    { col: COL.PREPARED, label: "Prepared to Apply" },
    { col: COL.LIKELY_USE, label: "Likely to Use AI" },
    { col: COL.NPS, label: "Recommend ASPIRE" },
    { col: COL.HIGHLIGHT, label: "Highlight / Takeaway" },
    { col: COL.TOPICS, label: "Topics to Learn More" },
    { col: COL.FUTURE, label: "Want Future Programs" },
    { col: COL.IMPROVE, label: "Improvement Suggestion" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Feedback from {metrics.totalResponses} participants
        </p>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {topMetrics.map((m, i) => (
          <MetricCard
            key={m.title}
            title={m.title}
            value={m.value.toFixed(1)}
            subtitle={m.subtitle}
            icon={m.icon}
            variant={m.variant}
            delay={(i + 1) * 100}
          />
        ))}
      </div>

      {/* NPS */}
      <NPSCard data={metrics.nps} className="animate-fade-in" />

      {/* All Likert Averages */}
      <ChartCard title="Average Ratings Across All Questions (out of 5)" delay={500}>
        <HorizontalBarChart data={likertBarData} color="hsl(217 91% 60%)" />
      </ChartCard>

      {/* Topic interests */}
      {metrics.topicInterests.length > 0 && (
        <ChartCard title="AI Topics Participants Want to Learn More About" delay={600}>
          <HorizontalBarChart data={metrics.topicInterests} color="hsl(263 70% 58%)" />
        </ChartCard>
      )}

      {/* Future interest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Want Future Programs"
          value={`${metrics.futureInterestPct}%`}
          subtitle="Interested in future ASPIRE programs"
          icon={Heart}
          variant="purple"
          delay={700}
        />
        <MetricCard
          title="Avg Prepared to Apply"
          value={metrics.avgPrepared.toFixed(1)}
          subtitle="out of 5"
          icon={Lightbulb}
          variant="amber"
          delay={750}
        />
      </div>

      {/* Individual responses */}
      <ChartCard title={`Individual Responses (${participants.length} total)`} delay={800}>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
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
              key={p.id}
              open={openParticipants.has(p.id)}
              onOpenChange={() => toggleParticipant(p.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">{p.name || `Participant #${idx + 1}`}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </div>
                  </div>
                  {openParticipants.has(p.id) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-muted/30 rounded-b-lg border-t border-border/50 space-y-1">
                  {QUESTION_LABELS.map(({ col, label }) => {
                    const val = p.responses[col];
                    if (!val || !val.trim()) return null;
                    return (
                      <div key={col} className="py-2 border-b border-border/50 last:border-0">
                        <div className="text-xs text-muted-foreground mb-1">{label}</div>
                        <div className="text-sm text-foreground">{val}</div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
