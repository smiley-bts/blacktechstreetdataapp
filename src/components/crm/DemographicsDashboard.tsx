import { useState } from "react";
import { format } from "date-fns";
import { useDemographics, useCohorts, DEMOGRAPHIC_FIELDS, DemographicFilters } from "@/hooks/useDemographics";
import { EventType, EVENT_TYPE_LABELS, getEventTypeOptions } from "@/types/eventTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CountUp } from "@/components/ui/count-up";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  FileWarning,
  Filter,
  X,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald))",
  "hsl(var(--chart-blue))",
  "hsl(var(--gold))",
  "hsl(var(--chart-purple))",
  "hsl(var(--chart-teal))",
  "hsl(var(--muted-foreground))",
];

export function DemographicsDashboard() {
  const [filters, setFilters] = useState<DemographicFilters>({});
  const [activeTab, setActiveTab] = useState("overview");
  
  const { summary, isLoading, error } = useDemographics(filters);
  const { data: cohorts } = useCohorts();
  const eventTypeOptions = getEventTypeOptions();

  const clearFilters = () => setFilters({});
  const hasFilters = filters.eventType || filters.dateFrom || filters.dateTo || filters.cohortId;

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">Failed to load demographics data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filter Demographics
            </CardTitle>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 gap-1">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Program Type</Label>
              <Select
                value={filters.eventType || "all"}
                onValueChange={(v) => setFilters({ ...filters, eventType: v === "all" ? undefined : v as EventType })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {eventTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Cohort</Label>
              <Select
                value={filters.cohortId || "all"}
                onValueChange={(v) => setFilters({ ...filters, cohortId: v === "all" ? undefined : v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All cohorts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {cohorts?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <CountUp end={summary.totalAttendees} duration={600} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Attendees</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Confirmed attendance only
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <CountUp end={summary.overallCompleteness} duration={600} />%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Data Completeness</p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  summary.overallCompleteness >= 80 ? "bg-emerald-500/10" : 
                  summary.overallCompleteness >= 50 ? "bg-amber-500/10" : "bg-red-500/10"
                )}>
                  {summary.overallCompleteness >= 80 ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <FileWarning className={cn(
                      "h-5 w-5",
                      summary.overallCompleteness >= 50 ? "text-amber-500" : "text-red-500"
                    )} />
                  )}
                </div>
              </div>
              <Progress value={summary.overallCompleteness} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <CountUp end={summary.grantReadiness} duration={600} />%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Grant Readiness</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Grant-required fields complete
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <CountUp end={summary.attendeesWithCompleteData} duration={600} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Complete Profiles</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                All required fields filled
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for detailed breakdowns */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdowns">Breakdowns</TabsTrigger>
          <TabsTrigger value="missing">Missing Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab summary={summary} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="breakdowns" className="mt-4">
          <BreakdownsTab summary={summary} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="missing" className="mt-4">
          <MissingDataTab summary={summary} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[300px]" />;
  }

  // Get key breakdowns for overview
  const ageBreakdown = summary.breakdowns.find((b: any) => b.field === "age_range");
  const locationBreakdown = summary.breakdowns.find((b: any) => b.field === "state");
  const aiLevelBreakdown = summary.breakdowns.find((b: any) => b.field === "ai_experience_level");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Age Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Age Distribution
            <Badge variant="outline" className="text-[10px]">
              {ageBreakdown?.completeness || 0}% complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ageBreakdown?.distribution.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageBreakdown.distribution.slice(0, 6)}
                    dataKey="count"
                    nameKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ value }) => `${value}`}
                    labelLine={false}
                  >
                    {ageBreakdown.distribution.slice(0, 6).map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData label="No age data" />
          )}
        </CardContent>
      </Card>

      {/* Location Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            State Distribution
            <Badge variant="outline" className="text-[10px]">
              {locationBreakdown?.completeness || 0}% complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locationBreakdown?.distribution.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationBreakdown.distribution.slice(0, 5)} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="value"
                    width={60}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData label="No location data" />
          )}
        </CardContent>
      </Card>

      {/* AI Experience Level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            AI Experience Level
            <Badge variant="outline" className="text-[10px]">
              {aiLevelBreakdown?.completeness || 0}% complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiLevelBreakdown?.distribution.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aiLevelBreakdown.distribution.slice(0, 6)}
                    dataKey="count"
                    nameKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {aiLevelBreakdown.distribution.slice(0, 6).map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData label="No AI experience data" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BreakdownsTab({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {summary.breakdowns.map((breakdown: any) => (
        <Card key={breakdown.field}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{breakdown.label}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        breakdown.completeness >= 80
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : breakdown.completeness >= 50
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-red-500/10 text-red-600 border-red-500/30"
                      )}
                    >
                      {breakdown.completeness}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {breakdown.total - breakdown.missing} of {breakdown.total} have data
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {breakdown.distribution.length > 0 ? (
              <div className="space-y-2">
                {breakdown.distribution.slice(0, 5).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 text-muted-foreground">{item.value}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
                {breakdown.distribution.length > 5 && (
                  <p className="text-[10px] text-muted-foreground text-center pt-1">
                    +{breakdown.distribution.length - 5} more values
                  </p>
                )}
              </div>
            ) : (
              <NoData label="No data captured" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MissingDataTab({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-[300px]" />;
  }

  const grantRequiredFields = DEMOGRAPHIC_FIELDS.filter(f => f.grantRequired);
  const missingGrantFields = summary.missingFields.filter((m: any) =>
    grantRequiredFields.some(g => g.field === m.field)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Missing Data Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grant-required missing fields */}
        {missingGrantFields.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
              <FileWarning className="h-4 w-4" />
              Grant-Required Fields Missing
            </h4>
            <div className="space-y-2">
              {missingGrantFields.map((field: any) => (
                <div
                  key={field.field}
                  className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/20"
                >
                  <span className="text-sm">{field.label}</span>
                  <Badge variant="destructive" className="text-xs">
                    {field.missingCount} missing
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All missing fields */}
        <div>
          <h4 className="text-sm font-medium mb-2">All Fields with Missing Data</h4>
          {summary.missingFields.length > 0 ? (
            <div className="space-y-1.5">
              {summary.missingFields.map((field: any) => {
                const percentage = Math.round(
                  (field.missingCount / summary.totalAttendees) * 100
                );
                const isGrantRequired = grantRequiredFields.some(g => g.field === field.field);

                return (
                  <div
                    key={field.field}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm flex-1 truncate">
                      {field.label}
                      {isGrantRequired && (
                        <span className="text-[10px] text-amber-600 ml-1">*grant</span>
                      )}
                    </span>
                    <div className="w-24">
                      <Progress value={100 - percentage} className="h-1.5" />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {field.missingCount} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              All demographic data is complete!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NoData({ label }: { label: string }) {
  return (
    <div className="h-[180px] flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
