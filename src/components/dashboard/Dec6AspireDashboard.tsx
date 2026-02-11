import { useEffect, useState } from "react";
import Papa from "papaparse";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { MetricCard } from "./MetricCard";
import { Users, MapPin, GraduationCap, Briefcase, Brain, Heart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const RACE_COLUMNS: Record<string, string> = {
  "What's your racial identity? (Black or African American)": "Black or African American",
  "What's your racial identity? (White or Caucasian)": "White or Caucasian",
  "What's your racial identity? (American Indian or Alaskan Native)": "American Indian or Alaskan Native",
  "What's your racial identity? (Asian)": "Asian",
  "What's your racial identity? (Native Hawaiian or Pacific Islander)": "Native Hawaiian or Pacific Islander",
  "What's your racial identity? (Hispanic or Latino)": "Hispanic or Latino",
  "What's your racial identity? (Other)": "Other",
};

const COL = {
  AGE: "What is your age range?",
  EDUCATION: "What's the highest level of education you've completed?",
  INDUSTRY: "What best describes your current industry?",
  INDUSTRY2: "What best describes your current industry? (2)",
  ROLE: "What best describes your current role?",
  AI_LEVEL: "Which best describes your current level of experience using AI tools?",
  AI_LEVEL2: "Which best describes your current level of experience using AI tools? (2)",
  CONFIDENCE_SOLVE: "How confident do you feel using AI to solve problems or create ideas?",
  CONFIDENCE_APPLY: "How confident do you feel applying AI tools in your work, life and community?",
  ZIP: "What's your ZIP code?",
  INCOME: "Which of the following ranges best describes your total household income before taxes last year?\n",
  TSHIRT: "What's your t-shirt size?",
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#60a5fa",
  "#f97316",
  "#a78bfa",
];

function countField(rows: any[], field: string): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    const val = (r[field] || "").trim();
    if (val) counts.set(val, (counts.get(val) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function avgConfidence(rows: any[], field: string): number {
  let sum = 0, count = 0;
  rows.forEach((r) => {
    const val = r[field];
    if (!val) return;
    const num = parseInt(val);
    if (!isNaN(num)) { sum += num; count++; }
  });
  return count ? +(sum / count).toFixed(1) : 0;
}

function getRaceBreakdown(rows: any[]): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    Object.entries(RACE_COLUMNS).forEach(([col, label]) => {
      if ((r[col] || "").toLowerCase() === "true") {
        counts.set(label, (counts.get(label) || 0) + 1);
      }
    });
  });
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function Dec6AspireDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/aspire-dec6-registration.csv?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        setRows(result.data as any[]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading dashboard…</div>;

  const total = rows.length;
  const raceData = getRaceBreakdown(rows);
  const ageData = countField(rows, COL.AGE);
  const educationData = countField(rows, COL.EDUCATION);
  const industryData = countField(rows, COL.INDUSTRY).concat(countField(rows, COL.INDUSTRY2)).reduce((acc, item) => {
    const existing = acc.find(a => a.name === item.name);
    if (existing) existing.value += item.value;
    else acc.push({ ...item });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);
  const roleData = countField(rows, COL.ROLE);
  const aiLevelData = countField(rows, COL.AI_LEVEL).concat(countField(rows, COL.AI_LEVEL2)).reduce((acc, item) => {
    const existing = acc.find(a => a.name === item.name);
    if (existing) existing.value += item.value;
    else acc.push({ ...item });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);
  const incomeData = countField(rows, COL.INCOME);
  const avgSolve = avgConfidence(rows, COL.CONFIDENCE_SOLVE);
  const avgApply = avgConfidence(rows, COL.CONFIDENCE_APPLY);

  const raceBarData = raceData.map((d) => ({
    name: d.name,
    value: Math.round((d.value / total) * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Users} title="Registrants" value={total} delay={0} />
        <MetricCard icon={Brain} title="Avg Confidence (Problem Solving)" value={avgSolve} subtitle="/5" delay={100} />
        <MetricCard icon={Heart} title="Avg Confidence (Apply AI)" value={avgApply} subtitle="/5" delay={200} />
        <MetricCard icon={MapPin} title="Unique ZIP Codes" value={new Set(rows.map(r => r[COL.ZIP]).filter(Boolean)).size} delay={300} />
      </div>

      {/* Race / Ethnicity - Featured */}
      <ChartCard title="Racial Identity Breakdown" delay={400}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={raceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {raceData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <HorizontalBarChart
              data={raceBarData}
              color="hsl(var(--primary))"
            />
            <p className="text-xs text-muted-foreground mt-3">
              * Participants may select multiple racial identities. Percentages may exceed 100%.
            </p>
          </div>
        </div>
      </ChartCard>

      {/* Age Range */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Age Range" delay={500}>
          <HorizontalBarChart
            data={ageData}
            color="hsl(var(--chart-2))"
          />
        </ChartCard>

        <ChartCard title="Education Level" delay={600}>
          <HorizontalBarChart
            data={educationData}
            color="hsl(var(--chart-3))"
          />
        </ChartCard>
      </div>

      {/* Industry & Role */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Industry" delay={700}>
          <HorizontalBarChart
            data={industryData}
            color="hsl(var(--chart-4))"
          />
        </ChartCard>

        <ChartCard title="Current Role" delay={800}>
          <HorizontalBarChart
            data={roleData}
            color="hsl(var(--chart-5))"
          />
        </ChartCard>
      </div>

      {/* AI Experience & Income */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="AI Experience Level" delay={900}>
          <HorizontalBarChart
            data={aiLevelData}
            color="hsl(var(--primary))"
          />
        </ChartCard>

        <ChartCard title="Household Income" delay={1000}>
          <HorizontalBarChart
            data={incomeData}
            color="hsl(var(--chart-2))"
          />
        </ChartCard>
      </div>
    </div>
  );
}
