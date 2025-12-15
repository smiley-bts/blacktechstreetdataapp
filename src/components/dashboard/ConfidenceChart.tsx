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

interface ConfidenceData {
  name: string;
  value: number;
}

interface ConfidenceChartProps {
  data: ConfidenceData[];
  title: string;
  color?: string;
}

// Map numeric values to readable labels
const confidenceLevelLabels: Record<string, string> = {
  "1": "Not Confident",
  "2": "Slightly Confident",
  "3": "Somewhat Confident",
  "4": "Confident",
  "5": "Very Confident",
};

const confidenceLevelOrder = ["1", "2", "3", "4", "5"];

export function ConfidenceChart({
  data,
  title,
  color = "hsl(160 84% 39%)",
}: ConfidenceChartProps) {
  // Normalize and aggregate data by confidence level
  const normalizedData = confidenceLevelOrder.map(level => {
    const total = data
      .filter(d => d.name.trim() === level)
      .reduce((sum, d) => sum + d.value, 0);
    
    return {
      name: confidenceLevelLabels[level],
      value: total,
    };
  });

  const hasData = normalizedData.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={normalizedData} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 14, fontWeight: 600 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
            }}
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40}>
            <LabelList dataKey="value" position="top" fill="hsl(var(--foreground))" fontSize={14} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
