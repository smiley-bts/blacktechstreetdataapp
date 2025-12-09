import { useState, useEffect } from "react";
import Papa from "papaparse";
import { TrendingUp, Users, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import btsLogo from "@/assets/black-tech-street-logo.png";
import { NPSCard } from "./NPSCard";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { ConfidenceChart } from "./ConfidenceChart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Metrics {
  recommendNPS: {
    nps: number;
    promoters: number;
    passives: number;
    detractors: number;
    total: number;
    promotersCount: number;
    passivesCount: number;
    detractorsCount: number;
  };
  continueUsingPct: number;
  attendFollowupPct: number;
  applyAIPct: number;
  confidenceAI: { name: string; value: number }[];
  confidenceApply: { name: string; value: number }[];
  toolsData: { name: string; value: number }[];
  heardAboutData: { name: string; value: number }[];
  valuableLearningData: { name: string; value: number }[];
  totalResponses: number;
}

interface ParticipantData {
  email: string;
  firstName: string;
  lastName: string;
  postSurvey: Record<string, string>;
  preSurvey: Record<string, string> | null;
  hasPreSurvey: boolean;
}

export function ASPIREDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openParticipants, setOpenParticipants] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const normalizeEmail = (email: string | undefined): string => {
    if (!email) return "";
    return String(email).toLowerCase().trim();
  };

  const toggleParticipant = (email: string) => {
    setOpenParticipants(prev => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  };

  const loadData = async () => {
    try {
      const [postResponse, preResponse] = await Promise.all([
        fetch("/aspire-feedback-survey.csv"),
        fetch("/aspire-pre-survey.csv")
      ]);

      if (!postResponse.ok || !preResponse.ok) {
        setError("Unable to load survey data files.");
        setLoading(false);
        return;
      }

      const [postContent, preContent] = await Promise.all([
        postResponse.text(),
        preResponse.text()
      ]);

      const postData = await new Promise<Record<string, string>[]>((resolve, reject) => {
        Papa.parse(postContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as Record<string, string>[]),
          error: (err) => reject(err),
        });
      });

      const preData = await new Promise<Record<string, string>[]>((resolve, reject) => {
        Papa.parse(preContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as Record<string, string>[]),
          error: (err) => reject(err),
        });
      });

      const cleanedPostData = postData.filter((row) => 
        Object.keys(row).length > 0 && row["What's your first name?"]
      );
      const cleanedPreData = preData.filter((row) => 
        Object.keys(row).length > 0 && row["What's your first name?"]
      );

      // Create a map of pre-survey data by email
      const preByEmail = new Map<string, Record<string, string>>();
      cleanedPreData.forEach((row) => {
        const email = normalizeEmail(row["What's your email?"]);
        if (email) {
          preByEmail.set(email, row);
        }
      });

      // Build participant list from post-survey
      const participantList: ParticipantData[] = cleanedPostData.map((postRow) => {
        const email = normalizeEmail(postRow["What's your email?"]);
        const preSurvey = email ? preByEmail.get(email) || null : null;
        
        return {
          email,
          firstName: postRow["What's your first name?"] || "",
          lastName: postRow["What's your last name?"] || "",
          postSurvey: postRow,
          preSurvey,
          hasPreSurvey: !!preSurvey,
        };
      });

      setParticipants(participantList);
      calculateMetrics(cleanedPostData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unexpected error loading data.");
      setLoading(false);
    }
  };

  const calculateNPS = (responses: Record<string, string>[], questionKey: string) => {
    const scaleMapping: Record<number, number> = {
      5: 10, 4: 8, 3: 6, 2: 4, 1: 2,
    };

    const scores = responses
      .map((r) => {
        const val = r[questionKey];
        if (!val) return null;
        const match = String(val).trim().match(/^(\d)/);
        if (!match) return null;
        const rawScore = parseInt(match[1], 10);
        return scaleMapping[rawScore] ?? null;
      })
      .filter((v): v is number => v !== null);

    if (scores.length === 0) {
      return {
        nps: 0, promoters: 0, passives: 0, detractors: 0,
        total: 0, promotersCount: 0, passivesCount: 0, detractorsCount: 0,
      };
    }

    const promoters = scores.filter((s) => s >= 9).length;
    const passives = scores.filter((s) => s >= 7 && s <= 8).length;
    const detractors = scores.filter((s) => s <= 6).length;
    const total = scores.length;
    const nps = ((promoters - detractors) / total) * 100;

    return {
      nps: Math.round(nps),
      promoters: Math.round((promoters / total) * 100),
      passives: Math.round((passives / total) * 100),
      detractors: Math.round((detractors / total) * 100),
      total,
      promotersCount: promoters,
      passivesCount: passives,
      detractorsCount: detractors,
    };
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

  const getPositiveCount = (rows: Record<string, string>[], keySubstring: string) => {
    return rows.filter((row) => {
      const matchingKey = Object.keys(row).find(k => k.includes(keySubstring));
      if (!matchingKey) return false;
      const val = String(row[matchingKey] || "").toLowerCase();
      return (
        val.includes("agree") || val.includes("yes") ||
        val.includes("definitely") || val.includes("strongly") ||
        val.includes("confident") || val.includes("5 -")
      );
    }).length;
  };

  const calculateMetrics = (rawData: Record<string, string>[]) => {
    const recommendNPS = calculateNPS(rawData, "How likely are you to recommend this event to someone else?");

    const continueUsingCount = getPositiveCount(rawData, "I plan to continue exploring");
    const attendFollowupCount = getPositiveCount(rawData, "Would you attend a follow-up");
    const applyAICount = getPositiveCount(rawData, "I feel confident that I can apply AI");

    const confidenceAI = countResponses(rawData, "How confident do you feel using AI to solve problems or create ideas?");
    const confidenceApply = countResponses(rawData, "How confident do you feel applying AI tools in your work, life and community now?");

    const toolsUsed: Record<string, number> = {};
    rawData.forEach((row) => {
      const tools = row["Which AI tools did you use today? (Select all that apply)"];
      if (tools) {
        String(tools).split(",").forEach((tool) => {
          const cleaned = tool.trim();
          if (cleaned) toolsUsed[cleaned] = (toolsUsed[cleaned] || 0) + 1;
        });
      }
    });
    const toolsData = Object.entries(toolsUsed).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const heardAbout: Record<string, number> = {};
    rawData.forEach((row) => {
      const response = row["How did you hear about us?"];
      if (response) {
        const cleaned = String(response).trim();
        heardAbout[cleaned] = (heardAbout[cleaned] || 0) + 1;
      }
    });
    const heardAboutData = Object.entries(heardAbout).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const valuableLearning: Record<string, number> = {};
    rawData.forEach((row) => {
      const response = row["What is the most valuable thing you learned today?"];
      if (response) {
        const cleaned = String(response).trim();
        valuableLearning[cleaned] = (valuableLearning[cleaned] || 0) + 1;
      }
    });
    const valuableLearningData = Object.entries(valuableLearning).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    setMetrics({
      recommendNPS,
      continueUsingPct: Math.round((continueUsingCount / rawData.length) * 100),
      attendFollowupPct: Math.round((attendFollowupCount / rawData.length) * 100),
      applyAIPct: Math.round((applyAICount / rawData.length) * 100),
      confidenceAI,
      confidenceApply,
      toolsData,
      heardAboutData,
      valuableLearningData,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading survey data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Processing data...</p>
      </div>
    );
  }

  const matchedCount = participants.filter(p => p.hasPreSurvey).length;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <img src={btsLogo} alt="Black Tech Street" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">ASPIRE Workshop Analytics</h1>
          <p className="text-muted-foreground">
            Feedback insights from {metrics.totalResponses} workshop participants
          </p>
        </header>

        {/* NPS Card */}
        <NPSCard data={metrics.recommendNPS} className="mb-8" />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            title="Continue Using AI"
            value={`${metrics.continueUsingPct}%`}
            subtitle="Plan to keep exploring AI tools"
            icon={TrendingUp}
            variant="blue"
            delay={100}
          />
          <MetricCard
            title="Attend Follow-up"
            value={`${metrics.attendFollowupPct}%`}
            subtitle="Would attend Build Day"
            icon={Users}
            variant="purple"
            delay={200}
          />
          <MetricCard
            title="Can Apply AI"
            value={`${metrics.applyAIPct}%`}
            subtitle="Confident applying AI to work"
            icon={Lightbulb}
            variant="amber"
            delay={300}
          />
        </div>

        {/* Confidence Levels */}
        <ChartCard title="Post-Workshop Confidence Levels" className="mb-8" delay={400}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ConfidenceChart data={metrics.confidenceAI} title="Using AI to Solve Problems" color="hsl(160 84% 39%)" />
            <ConfidenceChart data={metrics.confidenceApply} title="Applying AI Tools" color="hsl(263 70% 58%)" />
          </div>
        </ChartCard>

        {/* AI Tools Used */}
        {metrics.toolsData.length > 0 && (
          <ChartCard title="AI Tools Used" className="mb-8" delay={500}>
            <HorizontalBarChart data={metrics.toolsData} color="hsl(217 91% 60%)" />
          </ChartCard>
        )}

        {/* How They Heard About Us */}
        {metrics.heardAboutData.length > 0 && (
          <ChartCard title="How Did You Hear About Us?" className="mb-8" delay={600}>
            <HorizontalBarChart data={metrics.heardAboutData} color="hsl(330 81% 60%)" />
          </ChartCard>
        )}

        {/* Most Valuable Learning */}
        {metrics.valuableLearningData.length > 0 && (
          <ChartCard title="Most Valuable Thing Learned" className="mb-8" delay={700}>
            <HorizontalBarChart data={metrics.valuableLearningData} color="hsl(38 92% 50%)" />
          </ChartCard>
        )}

        {/* Individual Participant Responses */}
        <ChartCard title={`Individual Participant Responses (${participants.length} total)`} delay={800}>
          <div className="space-y-2">
            {participants.map((p, idx) => (
              <Collapsible
                key={p.email || idx}
                open={openParticipants.has(p.email)}
                onOpenChange={() => toggleParticipant(p.email)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {idx + 1}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-foreground">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </div>
                      {p.hasPreSurvey && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full">
                          Has Pre-Survey
                        </span>
                      )}
                    </div>
                    {openParticipants.has(p.email) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 bg-card border border-border rounded-lg mt-2">
                    {p.hasPreSurvey && p.preSurvey && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-primary mb-3 pb-2 border-b border-primary/20">
                          Pre-Workshop Registration
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {renderAnswerRow("Age Range", p.preSurvey["What is your age range?"])}
                          {renderAnswerRow("Industry", p.preSurvey["What best describes your current industry?"])}
                          {renderAnswerRow("Role", p.preSurvey["What best describes your current role?"])}
                          {renderAnswerRow("AI Experience Level (Before)", p.preSurvey["Which best describes your current level of experience using AI tools?"])}
                          {renderAnswerRow("Confidence: Solving (Before)", p.preSurvey["How confident do you feel using AI to solve problems or create ideas?"])}
                          {renderAnswerRow("Confidence: Applying (Before)", p.preSurvey["How confident do you feel applying AI tools in your work, life and community?"])}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-3 pb-2 border-b border-primary/20">
                        Post-Workshop Feedback
                      </h4>
                      <div className="space-y-1">
                        {renderAnswerRow("Mindset Before", p.postSurvey["Before today's workshop, which of the following best described your mindset about AI?"])}
                        {renderAnswerRow("Mindset After", p.postSurvey["After today, which mindset best describes how you now view AI?"])}
                        {renderAnswerRow("Confidence: Solving Problems", p.postSurvey["How confident do you feel using AI to solve problems or create ideas?"])}
                        {renderAnswerRow("Confidence: Applying Tools", p.postSurvey["How confident do you feel applying AI tools in your work, life and community now?"])}
                        {renderAnswerRow("AI Experience Level", p.postSurvey["How would you describe your AI experience level now, after today's workshop?"])}
                        {renderAnswerRow("Can Apply AI", p.postSurvey["I feel confident that I can apply AI in at least one part of my daily work or life."])}
                        {renderAnswerRow("AI Tools Used", p.postSurvey["Which AI tools did you use today? (Select all that apply)"])}
                        {renderAnswerRow("Most Valuable Learning", p.postSurvey["What is the most valuable thing you learned today?"])}
                        {renderAnswerRow("Confidence: Guiding AI", p.postSurvey["How confident do you feel guiding and shaping AI outputs?"])}
                        {renderAnswerRow("Prepared for Responsible Use", p.postSurvey["I feel prepared to use AI responsibly (with ethics, critical thinking, and community impact)."])}
                        {renderAnswerRow("Who Should Address Bias", p.postSurvey["If an AI tool produces harmful or biased results, who should address it?"])}
                        {renderAnswerRow("Can See Real Ways to Use AI", p.postSurvey["I can see real ways to use AI in my work, life, or community after today."])}
                        {renderAnswerRow("Space Welcoming", p.postSurvey["Do you feel this space was welcoming to all skill levels?"])}
                        {renderAnswerRow("Recommend Event", p.postSurvey["How likely are you to recommend this event to someone else?"])}
                        {renderAnswerRow("Continue Using AI", p.postSurvey["I plan to continue exploring and using AI tools after today."])}
                        {renderAnswerRow("Attend Follow-up", p.postSurvey["Would you attend a follow-up Build Day to continue pursuing your idea?"])}
                        {renderAnswerRow("Who Else Should Attend", p.postSurvey["Who else should be in this room next time?\n"])}
                        {renderAnswerRow("Improvement Suggestions", p.postSurvey["What's one thing we can improve for the next workshop? "])}
                        {renderAnswerRow("Highlight/Takeaway", p.postSurvey["Please share a highlight or takeaway from your experience today."])}
                        {renderAnswerRow("Permission to Share Quote", p.postSurvey["Do you give us permission to share your quote in promotional materials for ASPIRE & Black Tech Street?"])}
                        {renderAnswerRow("Volunteer Interest", p.postSurvey["Would you like to volunteer at future Black Tech Street & ASPIRE events?"])}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground text-center">
              <span className="font-medium">{matchedCount}</span> of {participants.length} participants have matching pre-registration data
            </div>
          </div>
        </ChartCard>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>ASPIRE Workshop Feedback Dashboard</p>
        </footer>
      </div>
    </div>
  );
}