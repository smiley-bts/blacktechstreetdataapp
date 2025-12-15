import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ConfidenceLevel {
  name: string;
  value: number;
}

interface ConfidenceComparisonChartProps {
  beforeData: ConfidenceLevel[];
  afterData: ConfidenceLevel[];
}

export function ConfidenceComparisonChart({
  beforeData,
  afterData,
}: ConfidenceComparisonChartProps) {
  // Merge before and after data by confidence level name
  const allNames = new Set([
    ...beforeData.map(d => d.name),
    ...afterData.map(d => d.name),
  ]);

  const chartData = Array.from(allNames).map(name => ({
    name: name.length > 25 ? name.substring(0, 25) + "..." : name,
    fullName: name,
    before: beforeData.find(d => d.name === name)?.value || 0,
    after: afterData.find(d => d.name === name)?.value || 0,
  }));

  // Sort by confidence level if possible (1-5 scale descriptions)
  const confidenceOrder = ["Not confident at all", "Slightly confident", "Somewhat confident", "Confident", "Very confident"];
  chartData.sort((a, b) => {
    const aIdx = confidenceOrder.findIndex(c => a.fullName.toLowerCase().includes(c.toLowerCase()));
    const bIdx = confidenceOrder.findIndex(c => b.fullName.toLowerCase().includes(c.toLowerCase()));
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    return 0;
  });

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No comparison data available</p>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ bottom: 80, left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={100}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            interval={0}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 14, fontWeight: 600 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            label={{ 
              value: "Responses", 
              angle: -90, 
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
            formatter={(value: number, name: string) => [
              `${value} responses`,
              name === "before" ? "Before Workshop" : "After Workshop"
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Legend 
            formatter={(value) => value === "before" ? "Before Workshop" : "After Workshop"}
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Bar dataKey="before" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} maxBarSize={50} />
          <Bar dataKey="after" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
