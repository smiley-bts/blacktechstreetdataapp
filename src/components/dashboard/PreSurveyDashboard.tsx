import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { ConfidenceChart } from "./ConfidenceChart";
import { Users, Briefcase, GraduationCap, Smartphone } from "lucide-react";

interface PreSurveyData {
  age: string;
  education: string;
  industry: string;
  aiConfidence: string;
  deviceAccess: string;
  aiToolsUsed: string;
  learningGoals: string;
}

interface Metrics {
  totalResponses: number;
  ageDistribution: { name: string; value: number }[];
  educationLevels: { name: string; value: number }[];
  industryBreakdown: { name: string; value: number }[];
  aiConfidenceLevels: { name: string; value: number }[];
  deviceAccess: { name: string; value: number }[];
  aiToolsUsed: { name: string; value: number }[];
}

export function PreSurveyDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/aspire-pre-survey.csv");
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, string>[];
          calculateMetrics(data);
        },
        error: (err: Error) => {
          setError(`Failed to parse CSV: ${err.message}`);
          setLoading(false);
        },
      });
    } catch (err) {
      setError("Failed to load pre-survey data");
      setLoading(false);
    }
  };

  const countResponses = (data: Record<string, string>[], field: string): { name: string; value: number }[] => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const value = row[field]?.trim();
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const calculateMetrics = (data: Record<string, string>[]) => {
    // Get the column names from the first row to identify field mappings
    const headers = Object.keys(data[0] || {});
    
    // Find relevant columns (these may vary based on actual CSV structure)
    const ageField = headers.find(h => h.toLowerCase().includes("age") || h.toLowerCase().includes("old")) || "";
    const educationField = headers.find(h => h.toLowerCase().includes("education") || h.toLowerCase().includes("school") || h.toLowerCase().includes("grade")) || "";
    const industryField = headers.find(h => h.toLowerCase().includes("industry") || h.toLowerCase().includes("work") || h.toLowerCase().includes("occupation")) || "";
    const confidenceField = headers.find(h => h.toLowerCase().includes("confidence") || h.toLowerCase().includes("comfortable")) || "";
    const deviceField = headers.find(h => h.toLowerCase().includes("device") || h.toLowerCase().includes("computer") || h.toLowerCase().includes("access")) || "";
    const toolsField = headers.find(h => h.toLowerCase().includes("tool") || h.toLowerCase().includes("ai") && h.toLowerCase().includes("used")) || "";

    const calculatedMetrics: Metrics = {
      totalResponses: data.length,
      ageDistribution: ageField ? countResponses(data, ageField) : [],
      educationLevels: educationField ? countResponses(data, educationField) : [],
      industryBreakdown: industryField ? countResponses(data, industryField) : [],
      aiConfidenceLevels: confidenceField ? countResponses(data, confidenceField) : [],
      deviceAccess: deviceField ? countResponses(data, deviceField) : [],
      aiToolsUsed: toolsField ? countResponses(data, toolsField) : [],
    };

    setMetrics(calculatedMetrics);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalResponses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Education Categories</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.educationLevels.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industries</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.industryBreakdown.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Types</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deviceAccess.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {metrics.ageDistribution.length > 0 && (
          <ChartCard title="Age Distribution">
            <HorizontalBarChart data={metrics.ageDistribution} color="hsl(var(--primary))" />
          </ChartCard>
        )}

        {metrics.educationLevels.length > 0 && (
          <ChartCard title="Education Levels">
            <HorizontalBarChart data={metrics.educationLevels} color="hsl(160 84% 39%)" />
          </ChartCard>
        )}

        {metrics.industryBreakdown.length > 0 && (
          <ChartCard title="Industry Breakdown">
            <HorizontalBarChart data={metrics.industryBreakdown} color="hsl(200 80% 50%)" />
          </ChartCard>
        )}

        {metrics.aiConfidenceLevels.length > 0 && (
          <ChartCard title="AI Confidence (Pre-Workshop)">
            <ConfidenceChart data={metrics.aiConfidenceLevels} title="" color="hsl(280 70% 50%)" />
          </ChartCard>
        )}

        {metrics.deviceAccess.length > 0 && (
          <ChartCard title="Device Access">
            <HorizontalBarChart data={metrics.deviceAccess} color="hsl(30 80% 55%)" />
          </ChartCard>
        )}

        {metrics.aiToolsUsed.length > 0 && (
          <ChartCard title="AI Tools Previously Used">
            <HorizontalBarChart data={metrics.aiToolsUsed} color="hsl(340 75% 55%)" />
          </ChartCard>
        )}
      </div>
    </div>
  );
}
