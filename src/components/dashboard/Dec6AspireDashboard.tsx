import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ChartCard } from "./ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { MetricCard } from "./MetricCard";
import { Users, UserCheck, MapPin, Brain, Heart, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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

interface AttendanceRow {
  firstName: string;
  lastName: string;
  email: string;
  totalCheckIns: number;
  checkedIn: boolean;
  organization: string;
}

function parseAttendanceData(data: any[]): { uniqueRegistrants: number; uniqueParticipants: number; attendanceRate: number } {
  // Deduplicate by email (lowercase)
  const byEmail = new Map<string, AttendanceRow>();
  data.forEach((row) => {
    const email = (row["Email"] || "").trim().toLowerCase();
    if (!email) return;
    const checkIns = parseInt(row["Total check-ins"] || "0") || 0;
    const existing = byEmail.get(email);
    if (existing) {
      // Keep the one with higher check-ins
      if (checkIns > existing.totalCheckIns) {
        existing.totalCheckIns = checkIns;
        existing.checkedIn = checkIns > 0;
      } else if (!existing.checkedIn && checkIns > 0) {
        existing.checkedIn = true;
        existing.totalCheckIns = checkIns;
      }
    } else {
      byEmail.set(email, {
        firstName: row["First name"] || "",
        lastName: row["Last name"] || "",
        email,
        totalCheckIns: checkIns,
        checkedIn: checkIns > 0,
        organization: row["Organization"] || "",
      });
    }
  });

  const uniqueRegistrants = byEmail.size;
  const uniqueParticipants = Array.from(byEmail.values()).filter((r) => r.checkedIn).length;
  const attendanceRate = uniqueRegistrants > 0 ? Math.round((uniqueParticipants / uniqueRegistrants) * 100) : 0;

  return { uniqueRegistrants, uniqueParticipants, attendanceRate };
}

export function Dec6AspireDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<{ uniqueRegistrants: number; uniqueParticipants: number; attendanceRate: number } | null>(null);

  useEffect(() => {
    // Load both CSV (registration) and XLSX (attendance) in parallel
    const loadRegistration = fetch(`/aspire-dec6-registration.csv?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.text())
      .then((text) => {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        return result.data as any[];
      });

    const loadAttendance = fetch(`/aspire-dec6-attendance.xlsx?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(sheet) as any[];
      });

    Promise.all([loadRegistration, loadAttendance]).then(([regData, attData]) => {
      setRows(regData);
      setAttendance(parseAttendanceData(attData));
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

  const comparisonData = attendance ? [
    { name: "Registrants", value: attendance.uniqueRegistrants },
    { name: "Participants", value: attendance.uniqueParticipants },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard icon={Users} title="Registrants" value={attendance?.uniqueRegistrants ?? total} delay={0} />
        <MetricCard icon={UserCheck} title="Participants" value={attendance?.uniqueParticipants ?? 0} delay={100} />
        <MetricCard icon={BarChart3} title="Attendance Rate" value={`${attendance?.attendanceRate ?? 0}%`} delay={200} />
        <MetricCard icon={Brain} title="Avg Confidence (Solve)" value={avgSolve} subtitle="/5" delay={300} />
        <MetricCard icon={Heart} title="Avg Confidence (Apply)" value={avgApply} subtitle="/5" delay={400} />
      </div>

      {/* Registrants vs Participants */}
      {attendance && (
        <ChartCard title="Registrants vs Participants (Checked In)" delay={450}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 14 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  <Cell fill="hsl(var(--chart-2))" />
                  <Cell fill="hsl(var(--primary))" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-4 text-center md:text-left">
              <div>
                <p className="text-3xl font-bold text-foreground">{attendance.uniqueParticipants}</p>
                <p className="text-sm text-muted-foreground">of {attendance.uniqueRegistrants} registrants checked in</p>
              </div>
              <div className="inline-block bg-primary/10 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-primary">{attendance.attendanceRate}%</p>
                <p className="text-xs text-muted-foreground">Attendance Rate</p>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* Race / Ethnicity - Featured */}
      <ChartCard title="Racial Identity Breakdown" delay={500}>
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
            <HorizontalBarChart data={raceBarData} color="hsl(var(--primary))" />
            <p className="text-xs text-muted-foreground mt-3">
              * Participants may select multiple racial identities. Percentages may exceed 100%.
            </p>
          </div>
        </div>
      </ChartCard>

      {/* Age Range */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Age Range" delay={600}>
          <HorizontalBarChart data={ageData} color="hsl(var(--chart-2))" />
        </ChartCard>
        <ChartCard title="Education Level" delay={700}>
          <HorizontalBarChart data={educationData} color="hsl(var(--chart-3))" />
        </ChartCard>
      </div>

      {/* Industry & Role */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Industry" delay={800}>
          <HorizontalBarChart data={industryData} color="hsl(var(--chart-4))" />
        </ChartCard>
        <ChartCard title="Current Role" delay={900}>
          <HorizontalBarChart data={roleData} color="hsl(var(--chart-5))" />
        </ChartCard>
      </div>

      {/* AI Experience & Income */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="AI Experience Level" delay={1000}>
          <HorizontalBarChart data={aiLevelData} color="hsl(var(--primary))" />
        </ChartCard>
        <ChartCard title="Household Income" delay={1100}>
          <HorizontalBarChart data={incomeData} color="hsl(var(--chart-2))" />
        </ChartCard>
      </div>
    </div>
  );
}
