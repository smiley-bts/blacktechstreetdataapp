import { useState } from "react";
import { useSurveyMetrics, useSurveyCompletion } from "@/hooks/useSurveyMetrics";
import { SurveyFilters, SURVEY_TEMPLATES, SurveyTemplate, AGE_RANGE_GROUPS } from "@/types/surveyTypes";
import { EVENT_TYPE_LABELS, getEventTypeOptions } from "@/types/eventTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  ClipboardList,
  Users,
  TrendingUp,
  Filter,
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  Scale,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NPS_COLORS = {
  promoters: "hsl(var(--emerald))",
  passives: "hsl(var(--gold))",
  detractors: "hsl(var(--destructive))",
};

const TIER_COLORS = {
  champion: "hsl(var(--primary))",
  high: "hsl(var(--emerald))",
  medium: "hsl(var(--gold))",
  low: "hsl(var(--muted-foreground))",
};

export function SurveyDashboard() {
  const [filters, setFilters] = useState<SurveyFilters>({});
  const [activeTab, setActiveTab] = useState("overview");

  const { responses, metrics, isLoading, error } = useSurveyMetrics(filters);
  const surveyCompletion = useSurveyCompletion();
  const eventTypeOptions = getEventTypeOptions();

  const clearFilters = () => setFilters({});
  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to load survey data</p>
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
              Filter Survey Results
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Survey Template</Label>
              <Select
                value={filters.template || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, template: v === "all" ? undefined : (v as SurveyTemplate) })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {Object.values(SURVEY_TEMPLATES).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Program Type</Label>
              <Select
                value={filters.eventType || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, eventType: v === "all" ? undefined : v })
                }
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
              <Label className="text-xs">Age Group</Label>
              <Select
                value={filters.ageRange || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, ageRange: v === "all" ? undefined : v })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="youth">Youth (K-12)</SelectItem>
                  <SelectItem value="youngAdult">Young Adult (18-24)</SelectItem>
                  <SelectItem value="adult">Adult (25-44)</SelectItem>
                  <SelectItem value="seniorAdult">Senior Adult (45+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Engagement Level</Label>
              <Select
                value={filters.engagementTier || "all"}
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    engagementTier: v === "all" ? undefined : (v as any),
                  })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="champion">Champions (5+ events)</SelectItem>
                  <SelectItem value="high">High (3-4 events)</SelectItem>
                  <SelectItem value="medium">Medium (2 events)</SelectItem>
                  <SelectItem value="low">Low (1 event)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Min Events Attended</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={filters.minEventsAttended || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minEventsAttended: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Any"
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
                    <CountUp end={metrics.totalResponses} duration={600} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Survey Responses</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                {metrics.uniqueRespondents} unique respondents
              </p>
            </CardContent>
          </Card>

          <NPSCard nps={metrics.npsScore} breakdown={metrics.npsBreakdown} />

          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    <CountUp end={metrics.weightedNpsScore} duration={600} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Weighted NPS</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Scale className="h-5 w-5 text-purple-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        NPS weighted by engagement level. Champions count 2x,
                        high engagement 1.5x, low engagement 0.5x.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Engagement-weighted score
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-emerald-500">
                    +<CountUp end={metrics.confidenceGain} duration={600} decimals={1} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Confidence Gain</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                {metrics.averageConfidenceBefore.toFixed(1)} → {metrics.averageConfidenceAfter.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="engagement">By Engagement</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab metrics={metrics} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="completion" className="mt-4">
          <CompletionTab data={surveyCompletion} isLoading={surveyCompletion.isLoading} />
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <EngagementTab metrics={metrics} responses={responses} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <ResponsesTab responses={responses} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NPSCard({
  nps,
  breakdown,
}: {
  nps: number;
  breakdown: { promoters: number; passives: number; detractors: number };
}) {
  const total = breakdown.promoters + breakdown.passives + breakdown.detractors;
  const data = [
    { name: "Promoters", value: breakdown.promoters, fill: NPS_COLORS.promoters },
    { name: "Passives", value: breakdown.passives, fill: NPS_COLORS.passives },
    { name: "Detractors", value: breakdown.detractors, fill: NPS_COLORS.detractors },
  ];

  return (
    <Card className="border-border/50">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p
              className={cn(
                "text-3xl font-bold",
                nps >= 50 ? "text-emerald-500" : nps >= 0 ? "text-amber-500" : "text-destructive"
              )}
            >
              <CountUp end={nps} duration={600} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Net Promoter Score</p>
          </div>
          <div className="w-12 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={12}
                  outerRadius={20}
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex gap-2 mt-2 text-[10px]">
          <span className="text-emerald-500">{breakdown.promoters} promoters</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-amber-500">{breakdown.passives} passives</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-destructive">{breakdown.detractors} detractors</span>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ metrics, isLoading }: { metrics: any; isLoading: boolean }) {
  if (isLoading) return <Skeleton className="h-[300px]" />;

  const templateData = Object.entries(metrics.byTemplate)
    .filter(([_, count]) => (count as number) > 0)
    .map(([template, count]) => ({
      name: SURVEY_TEMPLATES[template as SurveyTemplate]?.label || template,
      value: count as number,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Responses by Survey Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={templateData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Key Metrics Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow
            label="Average Rating"
            value={metrics.averageRating}
            max={5}
            suffix="/5"
            icon={<Star className="h-4 w-4 text-gold" />}
          />
          <MetricRow
            label="Weighted Avg Rating"
            value={metrics.weightedAverageRating}
            max={5}
            suffix="/5"
            icon={<Scale className="h-4 w-4 text-purple-500" />}
          />
          <MetricRow
            label="Survey Completion Rate"
            value={metrics.surveyCompletionRate}
            max={100}
            suffix="%"
            icon={<ClipboardList className="h-4 w-4 text-primary" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricRow({
  label,
  value,
  max,
  suffix,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  icon: React.ReactNode;
}) {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">
            {value.toFixed(1)}
            {suffix}
          </span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
    </div>
  );
}

function CompletionTab({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) return <Skeleton className="h-[300px]" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Survey Completion Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">
                <CountUp end={data.completionRate} duration={600} />%
              </p>
              <p className="text-sm text-muted-foreground">
                of attendees completed surveys
              </p>
            </div>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-center">
                <p className="text-2xl font-semibold">{data.totalAttendees}</p>
                <p className="text-muted-foreground">Total Attendees</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-emerald-500">
                  {data.surveyedAttendees}
                </p>
                <p className="text-muted-foreground">Surveyed</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              + {data.csvSurveyResponses} additional CSV survey responses
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Completion by Program Type</CardTitle>
        </CardHeader>
        <CardContent>
          {data.byEventType.length > 0 ? (
            <div className="space-y-3">
              {data.byEventType.map((item: any) => (
                <div key={item.eventType} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">
                      {EVENT_TYPE_LABELS[item.eventType as keyof typeof EVENT_TYPE_LABELS] ||
                        item.eventType}
                    </span>
                    <span className="text-muted-foreground">
                      {item.surveyed}/{item.attended} ({item.rate}%)
                    </span>
                  </div>
                  <Progress value={item.rate} className="h-1.5" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attendance data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EngagementTab({
  metrics,
  responses,
  isLoading,
}: {
  metrics: any;
  responses: any[];
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton className="h-[300px]" />;

  const tierData = Object.entries(metrics.byEngagementTier)
    .map(([tier, count]) => ({
      tier,
      count: count as number,
      fill: TIER_COLORS[tier as keyof typeof TIER_COLORS] || TIER_COLORS.low,
    }))
    .sort((a, b) => {
      const order = ["champion", "high", "medium", "low"];
      return order.indexOf(a.tier) - order.indexOf(b.tier);
    });

  // Calculate NPS by tier
  const npsByTier = (() => {
    const tiers = ["champion", "high", "medium", "low"];
    return tiers.map((tier) => {
      const tierResponses = responses.filter(
        (r) => r.engagementTier === tier && r.npsScore !== null
      );
      const scores = tierResponses.map((r) => r.npsScore!);
      const promoters = scores.filter((s) => s >= 9).length;
      const detractors = scores.filter((s) => s < 7).length;
      const nps = scores.length > 0
        ? Math.round(((promoters - detractors) / scores.length) * 100)
        : 0;

      return { tier, nps, count: tierResponses.length };
    });
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Responses by Engagement Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierData}>
                <XAxis
                  dataKey="tier"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <YAxis hide />
                <RechartsTooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tierData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">NPS by Engagement Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {npsByTier.map(({ tier, nps, count }) => (
              <div key={tier} className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="w-20 justify-center capitalize"
                  style={{
                    borderColor: TIER_COLORS[tier as keyof typeof TIER_COLORS],
                    color: TIER_COLORS[tier as keyof typeof TIER_COLORS],
                  }}
                >
                  {tier}
                </Badge>
                <div className="flex-1">
                  <Progress
                    value={Math.max(0, nps + 100) / 2}
                    className="h-2"
                  />
                </div>
                <span
                  className={cn(
                    "font-medium w-12 text-right",
                    nps >= 50 ? "text-emerald-500" : nps >= 0 ? "text-amber-500" : "text-destructive"
                  )}
                >
                  {nps}
                </span>
                <span className="text-xs text-muted-foreground w-16">
                  ({count} resp.)
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Higher engagement correlates with higher NPS scores
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ResponsesTab({
  responses,
  isLoading,
}: {
  responses: any[];
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton className="h-[400px]" />;

  const recentResponses = responses.slice(0, 20);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Recent Responses
          <Badge variant="outline">{responses.length} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {recentResponses.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-lg border border-border/50 bg-card/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.eventName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.npsScore !== null && (
                    <Badge
                      variant={r.npsScore >= 9 ? "default" : r.npsScore >= 7 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      NPS: {r.npsScore}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-xs capitalize"
                    style={{
                      borderColor: TIER_COLORS[r.engagementTier as keyof typeof TIER_COLORS],
                    }}
                  >
                    {r.engagementTier}
                  </Badge>
                </div>
              </div>
              {r.favoriteAspect && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  {r.favoriteAspect}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
