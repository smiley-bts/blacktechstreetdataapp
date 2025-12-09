import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Sparkles, TrendingUp, Users, Lightbulb, UserCheck } from "lucide-react";
import { NPSCard } from "./NPSCard";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { ConfidenceChart } from "./ConfidenceChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  beforeConfidenceSolving: { name: string; value: number }[];
  afterConfidenceSolving: { name: string; value: number }[];
  beforeConfidenceApplying: { name: string; value: number }[];
  afterConfidenceApplying: { name: string; value: number }[];
  continueUsingPct: number;
  attendFollowupPct: number;
  applyAIPct: number;
  confidenceAI: { name: string; value: number }[];
  confidenceApply: { name: string; value: number }[];
  toolsData: { name: string; value: number }[];
  heardAboutData: { name: string; value: number }[];
  valuableLearningData: { name: string; value: number }[];
  totalResponses: number;
  matchedParticipants: number;
  avgConfidenceChangeSolving: number;
  avgConfidenceChangeApplying: number;
}

interface MatchedParticipant {
  email: string;
  firstName: string;
  lastName: string;
  preConfidenceSolving: number;
  postConfidenceSolving: number;
  preConfidenceApplying: number;
  postConfidenceApplying: number;
  changeSolving: number;
  changeApplying: number;
}

export function ASPIREDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [matchedParticipants, setMatchedParticipants] = useState<MatchedParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const parseConfidenceLevel = (value: string | undefined): number => {
    if (!value) return 0;
    const match = String(value).match(/^(\d)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const normalizeEmail = (email: string | undefined): string => {
    if (!email) return "";
    return String(email).toLowerCase().trim();
  };

  const loadData = async () => {
    try {
      // Load both CSV files
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

      // Parse both CSVs
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

      // Clean and filter data
      const cleanedPostData = postData.filter((row) => 
        Object.keys(row).length > 0 && row["What's your first name?"]
      );
      const cleanedPreData = preData.filter((row) => 
        Object.keys(row).length > 0 && row["What's your first name?"]
      );

      console.log(`Post-survey entries: ${cleanedPostData.length}`);
      console.log(`Pre-survey entries: ${cleanedPreData.length}`);

      // Create a map of pre-survey data by email
      const preByEmail = new Map<string, Record<string, string>>();
      cleanedPreData.forEach((row) => {
        const email = normalizeEmail(row["What's your email?"]);
        if (email) {
          preByEmail.set(email, row);
        }
      });

      console.log(`Pre-survey emails mapped: ${preByEmail.size}`);

      // Match participants by email
      const matched: MatchedParticipant[] = [];
      cleanedPostData.forEach((postRow) => {
        const email = normalizeEmail(postRow["What's your email?"]);
        
        if (email && preByEmail.has(email)) {
          const preRow = preByEmail.get(email)!;
          
          const preConfidenceSolving = parseConfidenceLevel(
            preRow["How confident do you feel using AI to solve problems or create ideas?"]
          );
          const postConfidenceSolving = parseConfidenceLevel(
            postRow["How confident do you feel using AI to solve problems or create ideas?"]
          );
          const preConfidenceApplying = parseConfidenceLevel(
            preRow["How confident do you feel applying AI tools in your work, life and community?"]
          );
          const postConfidenceApplying = parseConfidenceLevel(
            postRow["How confident do you feel applying AI tools in your work, life and community now?"]
          );

          matched.push({
            email,
            firstName: postRow["What's your first name?"] || "",
            lastName: postRow["What's your last name?"] || "",
            preConfidenceSolving,
            postConfidenceSolving,
            preConfidenceApplying,
            postConfidenceApplying,
            changeSolving: postConfidenceSolving - preConfidenceSolving,
            changeApplying: postConfidenceApplying - preConfidenceApplying,
          });
        }
      });

      console.log(`Matched participants: ${matched.length}`);
      
      // Log unmatched for debugging
      const matchedEmails = new Set(matched.map(m => m.email));
      cleanedPostData.forEach((postRow) => {
        const email = normalizeEmail(postRow["What's your email?"]);
        if (email && !matchedEmails.has(email)) {
          console.log(`Unmatched post-survey email: ${email}`);
        }
      });

      setMatchedParticipants(matched);
      calculateMetrics(cleanedPostData, matched);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unexpected error loading data.");
      setLoading(false);
    }
  };

  const calculateNPS = (responses: Record<string, string>[], questionKey: string) => {
    // The survey uses 1-5 scale with text like "5 - Extremely Likely"
    // We need to convert: 5 = 10 (Promoter), 4 = 8 (Passive), 3 = 6 (Detractor), 2 = 4 (Detractor), 1 = 2 (Detractor)
    const scaleMapping: Record<number, number> = {
      5: 10,  // Extremely Likely -> Promoter
      4: 8,   // Likely -> Passive
      3: 6,   // Neutral -> Detractor
      2: 4,   // Unlikely -> Detractor
      1: 2,   // Not Likely -> Detractor
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

  const getPositiveCount = (rows: Record<string, string>[], keySubstring: string) => {
    return rows.filter((row) => {
      // Find the matching key (partial match for flexibility)
      const matchingKey = Object.keys(row).find(k => k.includes(keySubstring));
      if (!matchingKey) return false;
      const val = String(row[matchingKey] || "").toLowerCase();
      return (
        val.includes("agree") ||
        val.includes("yes") ||
        val.includes("definitely") ||
        val.includes("strongly") ||
        val.includes("confident") ||
        val.includes("5 -")
      );
    }).length;
  };

  const calculateMetrics = (rawData: Record<string, string>[], matched: MatchedParticipant[]) => {
    const recommendNPS = calculateNPS(
      rawData,
      "How likely are you to recommend this event to someone else?"
    );

    // Calculate before/after confidence from matched participants
    const confidenceLevels = ["1 - Not Confident", "2 - A Little Confident", "3 - Somewhat Confident", "4 - Confident", "5 - Extremely Confident"];
    
    const beforeConfidenceSolving: Record<string, number> = {};
    const afterConfidenceSolving: Record<string, number> = {};
    const beforeConfidenceApplying: Record<string, number> = {};
    const afterConfidenceApplying: Record<string, number> = {};
    
    confidenceLevels.forEach(level => {
      beforeConfidenceSolving[level] = 0;
      afterConfidenceSolving[level] = 0;
      beforeConfidenceApplying[level] = 0;
      afterConfidenceApplying[level] = 0;
    });

    let totalChangeSolving = 0;
    let totalChangeApplying = 0;
    let validMatchCount = 0;

    matched.forEach((p) => {
      if (p.preConfidenceSolving >= 1 && p.preConfidenceSolving <= 5) {
        beforeConfidenceSolving[confidenceLevels[p.preConfidenceSolving - 1]]++;
      }
      if (p.postConfidenceSolving >= 1 && p.postConfidenceSolving <= 5) {
        afterConfidenceSolving[confidenceLevels[p.postConfidenceSolving - 1]]++;
      }
      if (p.preConfidenceApplying >= 1 && p.preConfidenceApplying <= 5) {
        beforeConfidenceApplying[confidenceLevels[p.preConfidenceApplying - 1]]++;
      }
      if (p.postConfidenceApplying >= 1 && p.postConfidenceApplying <= 5) {
        afterConfidenceApplying[confidenceLevels[p.postConfidenceApplying - 1]]++;
      }
      
      if (p.preConfidenceSolving > 0 && p.postConfidenceSolving > 0) {
        totalChangeSolving += p.changeSolving;
        totalChangeApplying += p.changeApplying;
        validMatchCount++;
      }
    });

    const avgConfidenceChangeSolving = validMatchCount > 0 ? totalChangeSolving / validMatchCount : 0;
    const avgConfidenceChangeApplying = validMatchCount > 0 ? totalChangeApplying / validMatchCount : 0;

    const continueUsingCount = getPositiveCount(
      rawData,
      "I plan to continue exploring"
    );

    const attendFollowupCount = getPositiveCount(
      rawData,
      "Would you attend a follow-up"
    );

    const applyAICount = getPositiveCount(
      rawData,
      "I feel confident that I can apply AI"
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
      beforeConfidenceSolving: Object.entries(beforeConfidenceSolving)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0),
      afterConfidenceSolving: Object.entries(afterConfidenceSolving)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0),
      beforeConfidenceApplying: Object.entries(beforeConfidenceApplying)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0),
      afterConfidenceApplying: Object.entries(afterConfidenceApplying)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0),
      continueUsingPct: Math.round((continueUsingCount / rawData.length) * 100),
      attendFollowupPct: Math.round((attendFollowupCount / rawData.length) * 100),
      applyAIPct: Math.round((applyAICount / rawData.length) * 100),
      confidenceAI,
      confidenceApply,
      toolsData,
      heardAboutData,
      valuableLearningData,
      totalResponses: rawData.length,
      matchedParticipants: matched.length,
      avgConfidenceChangeSolving,
      avgConfidenceChangeApplying,
    });
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-emerald-500 font-semibold">+{change}</span>;
    if (change < 0) return <span className="text-red-500 font-semibold">{change}</span>;
    return <span className="text-muted-foreground">0</span>;
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
            Feedback insights from {metrics.totalResponses} workshop participants • {metrics.matchedParticipants} matched pre/post responses
          </p>
        </header>

        {/* NPS Card */}
        <NPSCard data={metrics.recommendNPS} className="mb-8" />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Matched Participants"
            value={`${metrics.matchedParticipants}`}
            subtitle="Completed both surveys"
            icon={UserCheck}
            variant="green"
            delay={50}
          />
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

        {/* Individual Participant Journey Table */}
        <ChartCard 
          title={`Individual Participant Journeys (${matchedParticipants.length} matched)`} 
          className="mb-8" 
          delay={350}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Pre: Solving</TableHead>
                  <TableHead className="text-center">Post: Solving</TableHead>
                  <TableHead className="text-center">Change</TableHead>
                  <TableHead className="text-center">Pre: Applying</TableHead>
                  <TableHead className="text-center">Post: Applying</TableHead>
                  <TableHead className="text-center">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchedParticipants.map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {p.firstName} {p.lastName}
                    </TableCell>
                    <TableCell className="text-center">{p.preConfidenceSolving || '-'}</TableCell>
                    <TableCell className="text-center">{p.postConfidenceSolving || '-'}</TableCell>
                    <TableCell className="text-center">{getChangeIndicator(p.changeSolving)}</TableCell>
                    <TableCell className="text-center">{p.preConfidenceApplying || '-'}</TableCell>
                    <TableCell className="text-center">{p.postConfidenceApplying || '-'}</TableCell>
                    <TableCell className="text-center">{getChangeIndicator(p.changeApplying)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex gap-6 text-sm text-muted-foreground justify-center">
            <div>
              <span className="font-medium">Avg Change (Solving):</span>{" "}
              <span className={metrics.avgConfidenceChangeSolving >= 0 ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>
                {metrics.avgConfidenceChangeSolving >= 0 ? '+' : ''}{metrics.avgConfidenceChangeSolving.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="font-medium">Avg Change (Applying):</span>{" "}
              <span className={metrics.avgConfidenceChangeApplying >= 0 ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>
                {metrics.avgConfidenceChangeApplying >= 0 ? '+' : ''}{metrics.avgConfidenceChangeApplying.toFixed(2)}
              </span>
            </div>
          </div>
        </ChartCard>

        {/* Confidence Transformation - Using AI to Solve Problems */}
        <ChartCard 
          title={`Confidence: Using AI to Solve Problems`} 
          className="mb-8" 
          delay={400}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ConfidenceChart
              data={metrics.beforeConfidenceSolving}
              title="Before Workshop"
              color="hsl(220 14% 50%)"
            />
            <ConfidenceChart
              data={metrics.afterConfidenceSolving}
              title="After Workshop"
              color="hsl(160 84% 39%)"
            />
          </div>
        </ChartCard>

        {/* Confidence Transformation - Applying AI Tools */}
        <ChartCard 
          title={`Confidence: Applying AI Tools`} 
          className="mb-8" 
          delay={500}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ConfidenceChart
              data={metrics.beforeConfidenceApplying}
              title="Before Workshop"
              color="hsl(220 14% 50%)"
            />
            <ConfidenceChart
              data={metrics.afterConfidenceApplying}
              title="After Workshop"
              color="hsl(263 70% 58%)"
            />
          </div>
        </ChartCard>

        {/* AI Tools Used */}
        {metrics.toolsData.length > 0 && (
          <ChartCard title="AI Tools Used" className="mb-8" delay={600}>
            <HorizontalBarChart data={metrics.toolsData} color="hsl(217 91% 60%)" />
          </ChartCard>
        )}

        {/* How They Heard About Us */}
        {metrics.heardAboutData.length > 0 && (
          <ChartCard title="How Did You Hear About Us?" className="mb-8" delay={700}>
            <HorizontalBarChart data={metrics.heardAboutData} color="hsl(330 81% 60%)" />
          </ChartCard>
        )}

        {/* Most Valuable Learning */}
        {metrics.valuableLearningData.length > 0 && (
          <ChartCard title="Most Valuable Thing Learned" className="mb-8" delay={800}>
            <HorizontalBarChart data={metrics.valuableLearningData} color="hsl(38 92% 50%)" />
          </ChartCard>
        )}

        {/* All Confidence Levels (Post-Survey) */}
        <ChartCard title="Post-Workshop Confidence Levels (All Respondents)" delay={900}>
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