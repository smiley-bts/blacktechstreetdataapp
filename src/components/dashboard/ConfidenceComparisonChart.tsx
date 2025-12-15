import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

// Map confidence levels to a simplified scale
const confidenceLevels = [
  { key: "not", label: "Not Confident", shortLabel: "Not\nConfident" },
  { key: "slightly", label: "Slightly Confident", shortLabel: "Slightly" },
  { key: "somewhat", label: "Somewhat Confident", shortLabel: "Somewhat" },
  { key: "confident", label: "Confident", shortLabel: "Confident" },
  { key: "very", label: "Very Confident", shortLabel: "Very\nConfident" },
];

function matchConfidenceLevel(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes("not confident") || lower.includes("not at all")) return "not";
  if (lower.includes("slightly")) return "slightly";
  if (lower.includes("somewhat")) return "somewhat";
  if (lower.includes("very")) return "very";
  if (lower.includes("confident")) return "confident";
  return null;
}

export function ConfidenceComparisonChart({
  beforeData,
  afterData,
}: ConfidenceComparisonChartProps) {
  // Build normalized data
  const chartData = confidenceLevels.map(level => {
    const beforeMatch = beforeData.find(d => matchConfidenceLevel(d.name) === level.key);
    const afterMatch = afterData.find(d => matchConfidenceLevel(d.name) === level.key);
    
    return {
      name: level.label,
      shortLabel: level.shortLabel,
      before: beforeMatch?.value || 0,
      after: afterMatch?.value || 0,
    };
  });

  // Calculate totals for showing the shift
  const totalBefore = beforeData.reduce((sum, d) => sum + d.value, 0);
  const totalAfter = afterData.reduce((sum, d) => sum + d.value, 0);
  
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

  if (chartData.every(d => d.before === 0 && d.after === 0)) {
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
