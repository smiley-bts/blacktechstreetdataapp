import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Users, UserCheck, BarChart3 } from "lucide-react";
import { useSignupDemographics, EventKey, DemographicCategory } from "@/hooks/useSignupDemographics";

interface Props {
  eventKey: EventKey;
  eventName: string;
}

const REGISTRANT_COLOR = "hsl(45, 93%, 47%)"; // amber
const ATTENDEE_COLOR = "hsl(160, 84%, 39%)"; // emerald

function ComparisonBarChart({ category }: { category: DemographicCategory }) {
  // Merge registrant and attendee values into combined chart data
  const chartData = useMemo(() => {
    const allValues = new Set<string>();
    category.registrants.forEach(r => allValues.add(r.value));
    category.attendees.forEach(a => allValues.add(a.value));

    const regMap = new Map(category.registrants.map(r => [r.value, r]));
    const attMap = new Map(category.attendees.map(a => [a.value, a]));

    return Array.from(allValues)
      .map(value => ({
        name: value.length > 30 ? value.slice(0, 28) + "…" : value,
        fullName: value,
        Registrants: regMap.get(value)?.pct || 0,
        Attendees: attMap.get(value)?.pct || 0,
        regCount: regMap.get(value)?.count || 0,
        attCount: attMap.get(value)?.count || 0,
      }))
      .sort((a, b) => b.Registrants - a.Registrants)
      .slice(0, 10); // top 10
  }, [category]);

  const chartHeight = Math.max(250, chartData.length * 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} fontSize={12} stroke="hsl(var(--muted-foreground))" />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          fontSize={11}
          tick={{ fill: "hsl(var(--foreground))" }}
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          formatter={(value: number, name: string, props: any) => {
            const count = name === "Registrants" ? props.payload.regCount : props.payload.attCount;
            return [`${value}% (${count})`, name];
          }}
          labelFormatter={(label: string, payload: any[]) => payload?.[0]?.payload?.fullName || label}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "hsl(var(--foreground))" }}
        />
        <Bar dataKey="Registrants" fill={REGISTRANT_COLOR} radius={[0, 4, 4, 0]} barSize={14} />
        <Bar dataKey="Attendees" fill={ATTENDEE_COLOR} radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DemographicComparisonCharts({ eventKey, eventName }: Props) {
  const { categories, registrantCount, attendeeCount, loading } = useSignupDemographics(eventKey);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Registrants vs Attendees — Demographics
        </CardTitle>
        <CardDescription className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: REGISTRANT_COLOR }} />
            <Users className="h-3.5 w-3.5" />
            Registrants: <strong>{registrantCount}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: ATTENDEE_COLOR }} />
            <UserCheck className="h-3.5 w-3.5" />
            Attendees: <strong>{attendeeCount}</strong>
          </span>
          <Badge variant="outline">
            {attendeeCount > 0 && registrantCount > 0
              ? `${Math.round((attendeeCount / registrantCount) * 100)}% attendance rate`
              : "N/A"}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]?.label || ""} className="w-full">
          <TabsList className="flex-wrap h-auto gap-1">
            {categories.map(cat => (
              <TabsTrigger key={cat.label} value={cat.label} className="text-xs sm:text-sm">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map(cat => (
            <TabsContent key={cat.label} value={cat.label} className="mt-4">
              <ComparisonBarChart category={cat} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
