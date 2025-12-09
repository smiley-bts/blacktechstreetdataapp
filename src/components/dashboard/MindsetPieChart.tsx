import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface MindsetData {
  name: string;
  value: number;
}

interface MindsetPieChartProps {
  data: MindsetData[];
  title: string;
}

const COLORS = [
  "hsl(160 84% 39%)",
  "hsl(217 91% 60%)",
  "hsl(38 92% 50%)",
  "hsl(330 81% 60%)",
  "hsl(263 70% 58%)",
  "hsl(187 92% 55%)",
];

export function MindsetPieChart({ data, title }: MindsetPieChartProps) {
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
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            dataKey="value"
            strokeWidth={2}
            stroke="hsl(var(--card))"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted-foreground truncate">{item.name}</span>
            <span className="text-foreground font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
