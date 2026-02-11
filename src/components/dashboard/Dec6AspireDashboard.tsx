import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { MetricCard } from "./MetricCard";
import { Users, UserCheck, MapPin, Brain, Heart, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// -- constants --

const RACE_COLUMNS: Record<string, string> = {
  "What's your racial identity? (Black or African American)": "Black or African American",
  "What's your racial identity? (White or Caucasian)": "White or Caucasian",
  "What's your racial identity? (American Indian or Alaskan Native)": "American Indian / Alaskan Native",
  "What's your racial identity? (Asian)": "Asian",
  "What's your racial identity? (Native Hawaiian or Pacific Islander)": "Native Hawaiian / Pacific Islander",
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
  EMAIL: "What\u2019s your email?",
};

const CHART_COLORS = {
  primary: "hsl(160, 84%, 45%)",
  blue: "hsl(217, 91%, 65%)",
  purple: "hsl(280, 80%, 60%)",
  amber: "hsl(38, 92%, 55%)",
  pink: "hsl(330, 81%, 65%)",
  emerald: "hsl(160, 84%, 45%)",
  cyan: "hsl(187, 92%, 60%)",
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.blue,
  CHART_COLORS.amber,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.cyan,
  "#f97316",
  "#a78bfa",
];

// -- helpers --

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

function mergeCountFields(rows: any[], ...fields: string[]): { name: string; value: number }[] {
  const all = fields.flatMap((f) => countField(rows, f));
  return all.reduce((acc, item) => {
    const existing = acc.find((a) => a.name === item.name);
    if (existing) existing.value += item.value;
    else acc.push({ ...item });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);
}

function avgConfidence(rows: any[], field: string): number {
  let sum = 0, count = 0;
  rows.forEach((r) => {
    const num = parseInt(r[field]);
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

interface AttendanceSummary {
  uniqueRegistrants: number;
  uniqueParticipants: number;
  attendanceRate: number;
  participantEmails: Set<string>;
}

function parseAttendanceData(data: any[]): AttendanceSummary {
  const byEmail = new Map<string, { checkedIn: boolean }>();
  data.forEach((row) => {
    const email = (row["Email"] || "").trim().toLowerCase();
    if (!email) return;
    const checkIns = parseInt(row["Total check-ins"] || "0") || 0;
    const existing = byEmail.get(email);
    if (existing) {
      if (checkIns > 0) existing.checkedIn = true;
    } else {
      byEmail.set(email, { checkedIn: checkIns > 0 });
    }
  });

  const participantEmails = new Set<string>();
  byEmail.forEach((v, k) => { if (v.checkedIn) participantEmails.add(k); });

  const uniqueRegistrants = byEmail.size;
  const uniqueParticipants = participantEmails.size;
  const attendanceRate = uniqueRegistrants > 0 ? Math.round((uniqueParticipants / uniqueRegistrants) * 100) : 0;

  return { uniqueRegistrants, uniqueParticipants, attendanceRate, participantEmails };
}

// -- sub-components --

function DemographicCharts({ rows, label }: { rows: any[]; label: string }) {
  const total = rows.length;
  const raceData = getRaceBreakdown(rows);
  const ageData = countField(rows, COL.AGE);
  const educationData = countField(rows, COL.EDUCATION);
  const industryData = mergeCountFields(rows, COL.INDUSTRY, COL.INDUSTRY2);
  const roleData = countField(rows, COL.ROLE);
  const aiLevelData = mergeCountFields(rows, COL.AI_LEVEL, COL.AI_LEVEL2);
  const incomeData = countField(rows, COL.INCOME);

  const raceBarData = raceData.map((d) => ({
    name: d.name,
    value: total > 0 ? Math.round((d.value / total) * 100) : 0,
  }));

  if (total === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No {label.toLowerCase()} data available for demographics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Race */}
      <ChartCard title={`Racial Identity — ${label} (${total})`}>
        <div className="grid md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={raceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}>
                {raceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(220, 20%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 98%)" }} itemStyle={{ color: "hsl(210, 40%, 98%)" }} />
              <Legend wrapperStyle={{ color: "hsl(210, 40%, 98%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div>
            <HorizontalBarChart data={raceBarData} color={CHART_COLORS.primary} />
            <p className="text-xs text-muted-foreground mt-3">
              * Multiple selections allowed. Percentages may exceed 100%.
            </p>
          </div>
        </div>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Age Range">
          <HorizontalBarChart data={ageData} color={CHART_COLORS.blue} />
        </ChartCard>
        <ChartCard title="Education Level">
          <HorizontalBarChart data={educationData} color={CHART_COLORS.amber} />
        </ChartCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Industry">
          <HorizontalBarChart data={industryData} color={CHART_COLORS.purple} />
        </ChartCard>
        <ChartCard title="Current Role">
          <HorizontalBarChart data={roleData} color={CHART_COLORS.pink} />
        </ChartCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="AI Experience Level">
          <HorizontalBarChart data={aiLevelData} color={CHART_COLORS.cyan} />
        </ChartCard>
        <ChartCard title="Household Income">
          <HorizontalBarChart data={incomeData} color={CHART_COLORS.blue} />
        </ChartCard>
      </div>
    </div>
  );
}

// -- main dashboard --

export function Dec6AspireDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

  useEffect(() => {
    const loadReg = fetch(`/aspire-dec6-registration.csv?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.text())
      .then((text) => Papa.parse(text, { header: true, skipEmptyLines: true }).data as any[]);

    const loadAtt = fetch(`/aspire-dec6-attendance.xlsx?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        const wb = XLSX.read(buf, { type: "array" });
        return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[];
      });

    Promise.all([loadReg, loadAtt]).then(([regData, attData]) => {
      setRows(regData);
      setAttendance(parseAttendanceData(attData));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading dashboard…</div>;

  const avgSolve = avgConfidence(rows, COL.CONFIDENCE_SOLVE);
  const avgApply = avgConfidence(rows, COL.CONFIDENCE_APPLY);

  // Find the email column dynamically (handles smart quotes in headers)
  const emailKey = rows.length > 0
    ? Object.keys(rows[0]).find((k) => k.toLowerCase().includes("email")) || COL.EMAIL
    : COL.EMAIL;

  // Deduplicate all registration rows by email (keep first occurrence)
  const deduplicatedRows = (() => {
    const seen = new Set<string>();
    return rows.filter((r) => {
      const email = (r[emailKey] || "").trim().toLowerCase();
      if (!email || seen.has(email)) return false;
      seen.add(email);
      return true;
    });
  })();

  // Filter deduplicated rows to only those whose email appears in participants
  const participantRows = attendance
    ? deduplicatedRows.filter((r) => {
        const email = (r[emailKey] || "").trim().toLowerCase();
        return email && attendance.participantEmails.has(email);
      })
    : [];

  const registrantCount = deduplicatedRows.length;
  const participantCount = participantRows.length;
  const attRate = registrantCount > 0 ? Math.round((participantCount / registrantCount) * 100) : 0;

  const comparisonData = [
    { name: "Registrants", value: registrantCount },
    { name: "Participants", value: participantCount },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard icon={Users} title="Registrants" value={registrantCount} delay={0} />
        <MetricCard icon={UserCheck} title="Participants" value={participantCount} delay={100} />
        <MetricCard icon={BarChart3} title="Attendance Rate" value={`${attRate}%`} delay={200} />
        <MetricCard icon={Brain} title="Avg Confidence (Solve)" value={avgSolve} subtitle="/5" delay={300} />
        <MetricCard icon={Heart} title="Avg Confidence (Apply)" value={avgApply} subtitle="/5" delay={400} />
      </div>

      {/* Registrants vs Participants bar chart */}
      <ChartCard title="Registrants vs Participants (Checked In)">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(210, 40%, 98%)", fontSize: 14 }} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 20%, 10%)", border: "1px solid hsl(220, 15%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 98%)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                <Cell fill={CHART_COLORS.blue} />
                <Cell fill={CHART_COLORS.primary} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-4 text-center md:text-left">
            <div>
              <p className="text-3xl font-bold text-foreground">{participantCount}</p>
              <p className="text-sm text-muted-foreground">of {registrantCount} registrants checked in</p>
            </div>
            <div className="inline-block rounded-lg px-4 py-2" style={{ background: "hsla(160, 84%, 45%, 0.12)" }}>
              <p className="text-2xl font-bold" style={{ color: CHART_COLORS.primary }}>{attRate}%</p>
              <p className="text-xs text-muted-foreground">Attendance Rate</p>
            </div>
          </div>
        </div>
      </ChartCard>

      {/* Demographics with tabs: All Registrants / Participants Only */}
      <Tabs defaultValue="participants" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-xl font-display font-semibold text-foreground">Demographics</h2>
          <TabsList>
            <TabsTrigger value="participants">Participants ({participantRows.length})</TabsTrigger>
            <TabsTrigger value="registrants">All Registrants ({deduplicatedRows.length})</TabsTrigger>
          </TabsList>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Demographics shown for registrants who completed the survey. Walk-in participants without a registration form are not included.
        </p>
        <TabsContent value="participants">
          <DemographicCharts rows={participantRows} label="Participants" />
        </TabsContent>
        <TabsContent value="registrants">
          <DemographicCharts rows={deduplicatedRows} label="Registrants" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
