import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Sparkles, TrendingUp, Users, Lightbulb } from "lucide-react";
import { NPSCard } from "./NPSCard";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { MindsetPieChart } from "./MindsetPieChart";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { ConfidenceChart } from "./ConfidenceChart";

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
  beforeMindset: { name: string; value: number }[];
  afterMindset: { name: string; value: number }[];
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

interface ASPIREDashboardProps {
  csvPath?: string;
}

export function ASPIREDashboard({ csvPath }: ASPIREDashboardProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const candidatePaths = csvPath
      ? [csvPath]
      : ["/aspire-feedback-survey.csv"];

    try {
      let csvContent: string | null = null;

      for (const path of candidatePaths) {
        try {
          const response = await fetch(encodeURI(path));
          if (!response.ok) continue;
          csvContent = await response.text();
          break;
        } catch {
          continue;
        }
      }

      if (!csvContent) {
        setError("Unable to load survey data. Please ensure the CSV file is in the public folder.");
        setLoading(false);
        return;
      }

      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const cleanedData = results.data.filter(
            (row) => Object.keys(row as object).length > 0
          ) as Record<string, string>[];
          calculateMetrics(cleanedData);
          setLoading(false);
        },
        error: (err) => {
          setError("Error parsing CSV: " + err.message);
          setLoading(false);
        },
      });
    } catch {
      setError("Unexpected error loading data.");
      setLoading(false);
    }
  };

  const calculateNPS = (responses: Record<string, string>[], questionKey: string) => {
    const scores = responses
      .map((r) => {
        const val = r[questionKey];
        if (!val) return null;
        const match = String(val).trim().match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((v): v is number => v !== null && v >= 0 && v <= 10);

    if (scores.length === 0) {
      return {
        nps: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        total: 0,
        promotersCount: 0,
        passivesCount: 0,
        detractorsCount: 0,
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

  const getPositiveCount = (rows: Record<string, string>[], key: string) => {
    return rows.filter((row) => {
      const val = String(row[key] || "").toLowerCase();
      return (
        val.includes("agree") ||
        val.includes("yes") ||
        val.includes("definitely") ||
        val.includes("strongly")
      );
    }).length;
  };

  const calculateMetrics = (rawData: Record<string, string>[]) => {
    const recommendNPS = calculateNPS(
      rawData,
      "How likely are you to recommend this event to someone else?"
    );

    const beforeMindset = countResponses(
      rawData,
      "Before today's workshop, which of the following best described your mindset about AI?"
    );

    const afterMindset = countResponses(
      rawData,
      "After today, which mindset best describes how you now view AI?"
    );

    const continueUsingCount = getPositiveCount(
      rawData,
      "I plan to continue exploring and using AI tools after today."
    );

    const attendFollowupCount = getPositiveCount(
      rawData,
      "Would you attend a follow-up Build Day to continue pursuing your idea?"
    );

    const applyAICount = getPositiveCount(
      rawData,
      "I feel confident that I can apply AI in at least one part of my daily work or life."
    );

    const confidenceAI = countResponses(
      rawData,
      "How confident do you feel using AI to solve problems or create ideas?"
    );

    const confidenceApply = countResponses(
      rawData,
      "How confident do you feel applying AI tools in your work, life and community now?"
    );

    const toolsUsed: Record<string, number> = {};
    rawData.forEach((row) => {
      const tools = row["Which AI tools did you use today? (Select all that apply)"];
      if (tools) {
        String(tools)
          .split(",")
          .forEach((tool) => {
            const cleaned = tool.trim();
            if (cleaned) toolsUsed[cleaned] = (toolsUsed[cleaned] || 0) + 1;
          });
      }
    });

    const toolsData = Object.entries(toolsUsed)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const heardAbout: Record<string, number> = {};
    rawData.forEach((row) => {
      const response = row["How did you hear about us?"];
      if (response) {
        const cleaned = String(response).trim();
        heardAbout[cleaned] = (heardAbout[cleaned] || 0) + 1;
      }
    });

    const heardAboutData = Object.entries(heardAbout)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const valuableLearning: Record<string, number> = {};
    rawData.forEach((row) => {
      const response = row["What is the most valuable thing you learned today?"];
      if (response) {
        const cleaned = String(response).trim();
        valuableLearning[cleaned] = (valuableLearning[cleaned] || 0) + 1;
      }
    });

    const valuableLearningData = Object.entries(valuableLearning)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    setMetrics({
      recommendNPS,
      beforeMindset,
      afterMindset,
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
          <h2 className="text-lg font-display font-semibold text-foreground mb-2">
            Unable to Load Data
          </h2>
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

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 nps-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              ASPIRE Workshop Analytics
            </h1>
          </div>
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

        {/* Mindset Transformation */}
        <ChartCard title="Mindset Transformation" className="mb-8" delay={400}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MindsetPieChart data={metrics.beforeMindset} title="Before Workshop" />
            <MindsetPieChart data={metrics.afterMindset} title="After Workshop" />
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

        {/* Confidence Levels */}
        <ChartCard title="Confidence Levels" delay={800}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ConfidenceChart
              data={metrics.confidenceAI}
              title="Using AI to Solve Problems"
              color="hsl(160 84% 39%)"
            />
            <ConfidenceChart
              data={metrics.confidenceApply}
              title="Applying AI Tools"
              color="hsl(263 70% 58%)"
            />
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
