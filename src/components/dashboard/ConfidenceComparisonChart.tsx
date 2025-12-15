import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface ConfidenceLevel {
  name: string;
  value: number;
}

interface ConfidenceComparisonChartProps {
  beforeData: ConfidenceLevel[];
  afterData: ConfidenceLevel[];
}

// Map confidence levels (handles both numeric 1-5 and text labels)
const confidenceLevels = [
  { key: "1", label: "Not Confident", numericMatch: ["1"] },
  { key: "2", label: "Slightly Confident", numericMatch: ["2"] },
  { key: "3", label: "Somewhat Confident", numericMatch: ["3"] },
  { key: "4", label: "Confident", numericMatch: ["4"] },
  { key: "5", label: "Very Confident", numericMatch: ["5"] },
];

function matchConfidenceLevel(name: string): string | null {
  const trimmed = name.trim();
  
  // Check for numeric values first (1-5)
  if (/^[1-5]$/.test(trimmed)) {
    return trimmed;
  }
  
  // Check for text-based labels
  const lower = trimmed.toLowerCase();
  if (lower.includes("not confident") || lower.includes("not at all")) return "1";
  if (lower.includes("slightly")) return "2";
  if (lower.includes("somewhat")) return "3";
  if (lower.includes("very")) return "5";
  if (lower.includes("confident")) return "4";
  
  return null;
}

export function ConfidenceComparisonChart({
  beforeData,
  afterData,
}: ConfidenceComparisonChartProps) {
  // Build normalized data
  const chartData = confidenceLevels.map(level => {
    const beforeTotal = beforeData
      .filter(d => matchConfidenceLevel(d.name) === level.key)
      .reduce((sum, d) => sum + d.value, 0);
    const afterTotal = afterData
      .filter(d => matchConfidenceLevel(d.name) === level.key)
      .reduce((sum, d) => sum + d.value, 0);
    
    return {
      name: level.label,
      before: beforeTotal,
      after: afterTotal,
    };
  });

  // Calculate totals for showing the shift
  const totalBefore = chartData.reduce((sum, d) => sum + d.before, 0);
  const totalAfter = chartData.reduce((sum, d) => sum + d.after, 0);
  
  // Calculate high confidence (Confident + Very Confident) percentages
  const highConfBefore = chartData
    .filter(d => d.name === "Confident" || d.name === "Very Confident")
    .reduce((sum, d) => sum + d.before, 0);
  const highConfAfter = chartData
    .filter(d => d.name === "Confident" || d.name === "Very Confident")
    .reduce((sum, d) => sum + d.after, 0);
  
  const highConfBeforePct = totalBefore > 0 ? Math.round((highConfBefore / totalBefore) * 100) : 0;
  const highConfAfterPct = totalAfter > 0 ? Math.round((highConfAfter / totalAfter) * 100) : 0;
  const improvement = highConfAfterPct - highConfBeforePct;

  const hasData = chartData.some(d => d.before > 0 || d.after > 0);

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No comparison data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary insight */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-lg font-medium text-foreground">
          High confidence increased from{" "}
          <span className="text-2xl font-bold text-red-500">{highConfBeforePct}%</span>
          {" "}to{" "}
          <span className="text-2xl font-bold text-emerald-500">{highConfAfterPct}%</span>
          {improvement > 0 && (
            <span className="text-emerald-500 ml-2">(+{improvement}%)</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Students rating themselves "Confident" or "Very Confident"
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-500" />
          <span className="text-base font-medium text-foreground">Before Workshop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-500" />
          <span className="text-base font-medium text-foreground">After Workshop</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, bottom: 20, left: 10, right: 10 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 14, fontWeight: 600 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(var(--foreground))", fontSize: 16, fontWeight: 600 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            label={{ 
              value: "Students", 
              angle: -90, 
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 14, fontWeight: 500 }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
            }}
            cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
            formatter={(value: number, name: string) => [
              `${value} students`,
              name === "before" ? "Before Workshop" : "After Workshop"
            ]}
          />
          <Bar 
            dataKey="before" 
            fill="hsl(0 72% 51%)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={60}
          >
            <LabelList 
              dataKey="before" 
              position="top" 
              fill="hsl(var(--foreground))"
              fontSize={16}
              fontWeight={700}
            />
          </Bar>
          <Bar 
            dataKey="after" 
            fill="hsl(160 84% 39%)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={60}
          >
            <LabelList 
              dataKey="after" 
              position="top" 
              fill="hsl(var(--foreground))"
              fontSize={16}
              fontWeight={700}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
