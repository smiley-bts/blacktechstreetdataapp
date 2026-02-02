import { format } from "date-fns";
import { useCohortAnalysis } from "@/hooks/useParticipantEngagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import { Calendar, TrendingUp, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CohortAnalysisChartProps {
  compact?: boolean;
}

export function CohortAnalysisChart({ compact = false }: CohortAnalysisChartProps) {
  const { data: cohorts, isLoading, error } = useCohortAnalysis();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !cohorts || cohorts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Cohort Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No cohort data available. Import attendance records to see cohort analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format cohorts for chart
  const chartData = cohorts.map((c) => ({
    month: format(new Date(c.month + "-01"), "MMM yy"),
    fullMonth: format(new Date(c.month + "-01"), "MMMM yyyy"),
    newParticipants: c.newParticipants,
    returnedParticipants: c.returnedParticipants,
    retentionRate: c.retentionRate,
    avgEvents: c.avgAttendancesPerPerson,
  }));

  // Calculate totals
  const totalNew = cohorts.reduce((sum, c) => sum + c.newParticipants, 0);
  const totalReturned = cohorts.reduce((sum, c) => sum + c.returnedParticipants, 0);
  const avgRetention = cohorts.length > 0
    ? Math.round(cohorts.reduce((sum, c) => sum + c.retentionRate, 0) / cohorts.length)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Cohort Analysis
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p className="text-xs">
                    Cohorts are grouped by the month of each participant's first event. 
                    Retention shows % who returned for additional events.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          {!compact && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-muted-foreground">New</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-muted-foreground">Returned</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        {!compact && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-2xl font-bold text-primary">{totalNew}</p>
              <p className="text-[10px] text-muted-foreground">Total New</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-600">{totalReturned}</p>
              <p className="text-[10px] text-muted-foreground">Returned</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-2xl font-bold text-amber-600">{avgRetention}%</p>
              <p className="text-[10px] text-muted-foreground">Avg Retention</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className={cn("w-full", compact ? "h-[180px]" : "h-[250px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullMonth || label;
                }}
              />
              <Bar 
                yAxisId="left"
                dataKey="newParticipants" 
                name="New Participants"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                stackId="stack"
              />
              <Bar 
                yAxisId="left"
                dataKey="returnedParticipants" 
                name="Returned"
                fill="hsl(var(--emerald))" 
                radius={[4, 4, 0, 0]}
                stackId="stack"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="retentionRate" 
                name="Retention %"
                stroke="hsl(var(--gold))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--gold))', r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Cohort table (non-compact only) */}
        {!compact && cohorts.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 font-medium">Cohort</th>
                  <th className="text-right p-2 font-medium">New</th>
                  <th className="text-right p-2 font-medium">Returned</th>
                  <th className="text-right p-2 font-medium">Retention</th>
                  <th className="text-right p-2 font-medium">Avg Events</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.slice(-6).reverse().map((cohort) => (
                  <tr key={cohort.month} className="border-t border-border/50">
                    <td className="p-2">
                      {format(new Date(cohort.month + "-01"), "MMMM yyyy")}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {cohort.newParticipants}
                    </td>
                    <td className="p-2 text-right text-emerald-600">
                      {cohort.returnedParticipants}
                    </td>
                    <td className="p-2 text-right">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          cohort.retentionRate >= 50 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : cohort.retentionRate >= 25
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              : "bg-slate-500/10 text-slate-600 border-slate-500/30"
                        )}
                      >
                        {cohort.retentionRate}%
                      </Badge>
                    </td>
                    <td className="p-2 text-right text-muted-foreground">
                      {cohort.avgAttendancesPerPerson}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
