import { useCSVDashboardMetrics } from "@/hooks/useCSVDashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export function AttendanceFunnelChart() {
  const metrics = useCSVDashboardMetrics();

  if (metrics.loading) {
    return <Skeleton className="h-80" />;
  }

  const chartData = metrics.events.map(e => ({
    name: e.name,
    Registrants: e.registrants,
    Attendees: e.attendees,
    rate: e.rate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Registrants vs Attendees
        </CardTitle>
        <CardDescription>Conversion from registration to actual attendance per event</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={110} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend />
            <Bar dataKey="Registrants" fill="hsl(45, 93%, 47%)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Attendees" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-4 text-sm text-muted-foreground justify-center">
          {metrics.events.map(e => (
            <span key={e.name}>{e.name}: <span className="font-semibold text-foreground">{e.rate}%</span></span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
