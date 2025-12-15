import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export function ConfidenceChart({
  data,
  title,
  color = "hsl(160 84% 39%)",
}: ConfidenceChartProps) {
  if (data.length === 0) {
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
        <BarChart data={data} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 14, fontWeight: 500 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 16, fontWeight: 600 }}
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
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
