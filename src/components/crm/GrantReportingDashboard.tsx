import { useState, useRef } from "react";
import { useGrantReporting, exportReportAsCSV, exportReportAsJSON, DateRange } from "@/hooks/useGrantReporting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  TrendingUp,
  Download,
  Calendar,
  FileText,
  Printer,
  ClipboardList,
  ThumbsUp,
  FolderArchive,
  PieChartIcon,
  BarChart3,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--emerald))",
  "hsl(var(--chart-blue))",
  "hsl(var(--gold))",
  "hsl(var(--chart-purple))",
];

export function GrantReportingDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const { report, isLoading, error, refetch } = useGrantReporting(dateRange);
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = () => {
    if (!report) return;
    const csv = exportReportAsCSV(report);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grant-report-${dateRange.from}-to-${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!report) return;
    const json = exportReportAsJSON(report);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grant-report-${dateRange.from}-to-${dateRange.to}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to generate report</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="print:hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Report Period
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <FileText className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="h-9 w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="h-9 w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable Report */}
      <div ref={printRef} className="print:p-8">
        {/* Report Header */}
        <div className="mb-6 print:mb-8">
          <h1 className="text-2xl font-bold text-foreground">Grant Progress Report</h1>
          <p className="text-muted-foreground">
            {format(new Date(dateRange.from), "MMMM d, yyyy")} – {format(new Date(dateRange.to), "MMMM d, yyyy")}
          </p>
          {report && (
            <p className="text-xs text-muted-foreground mt-1">
              Generated: {format(new Date(report.generatedAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[100px]" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[100px]" />
              ))}
            </div>
          </div>
        ) : report ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                icon={<Users className="h-5 w-5 text-primary" />}
                value={report.totalUniqueAttendees}
                label="Unique Attendees"
                description="Confirmed attendance"
              />
              <MetricCard
                icon={<ClipboardList className="h-5 w-5 text-emerald-500" />}
                value={report.surveys.totalResponses}
                label="Survey Responses"
                description={`${report.surveys.completionRate}% completion`}
              />
              <MetricCard
                icon={<ThumbsUp className="h-5 w-5 text-primary" />}
                value={report.surveys.npsScore}
                label="NPS Score"
                description="Net Promoter Score"
                valueClassName={report.surveys.npsScore >= 50 ? "text-emerald-500" : ""}
              />
              <MetricCard
                icon={<FolderArchive className="h-5 w-5 text-purple-500" />}
                value={report.projects.total}
                label="Projects"
                description={`${report.projects.winners} winners`}
              />
            </div>

            {/* Attendance by Program */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Attendance by Program Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.attendanceByProgram.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.attendanceByProgram} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={120}
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip />
                          <Bar dataKey="uniqueAttendees" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {report.attendanceByProgram.map((p, i) => (
                        <div key={p.programType} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="text-sm">{p.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{p.uniqueAttendees}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({p.events} events)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No attendance data</p>
                )}
              </CardContent>
            </Card>

            {/* Engagement Depth & Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Engagement Depth */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Engagement Depth Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.engagementDepth.map((e) => (
                      <div key={e.tier}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{e.label}</span>
                          <span className="font-medium">
                            {e.count} ({e.percentage}%)
                          </span>
                        </div>
                        <Progress value={e.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {report.engagementDepth.find((e) => e.tier === "high")?.count || 0} highly engaged participants (4+ events)
                  </p>
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-primary" />
                    Demographics Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Completeness</span>
                      <Badge variant="outline">{report.demographics.completeness}%</Badge>
                    </div>
                    <Progress value={report.demographics.completeness} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grant Readiness</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          report.demographics.grantReadiness >= 80
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : report.demographics.grantReadiness >= 50
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              : "bg-red-500/10 text-red-600 border-red-500/30"
                        )}
                      >
                        {report.demographics.grantReadiness}%
                      </Badge>
                    </div>
                    <Progress value={report.demographics.grantReadiness} className="h-2" />

                    <Separator />

                    <div>
                      <p className="text-xs font-medium mb-2">Top Age Ranges</p>
                      <div className="space-y-1">
                        {report.demographics.ageBreakdown.slice(0, 3).map((a) => (
                          <div key={a.value} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{a.value}</span>
                            <span>{a.count} ({a.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Survey Metrics */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Survey Metrics Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <SurveyMetricBox
                    label="Responses"
                    value={report.surveys.totalResponses}
                  />
                  <SurveyMetricBox
                    label="NPS Score"
                    value={report.surveys.npsScore}
                    className={report.surveys.npsScore >= 50 ? "text-emerald-500" : ""}
                  />
                  <SurveyMetricBox
                    label="Weighted NPS"
                    value={report.surveys.weightedNpsScore}
                    className={report.surveys.weightedNpsScore >= 50 ? "text-emerald-500" : ""}
                  />
                  <SurveyMetricBox
                    label="Confidence Gain"
                    value={`+${report.surveys.confidenceGain.toFixed(1)}`}
                    className="text-emerald-500"
                  />
                  <SurveyMetricBox
                    label="Completion Rate"
                    value={`${report.surveys.completionRate}%`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Projects Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderArchive className="h-4 w-4 text-primary" />
                  Projects Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <SurveyMetricBox label="Total Projects" value={report.projects.total} />
                  <SurveyMetricBox label="Winners" value={report.projects.winners} className="text-gold" />
                  <SurveyMetricBox label="At Risk" value={report.projects.atRisk} className="text-amber-500" />
                  <SurveyMetricBox label="Archived" value={report.projects.archived} />
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  description,
  valueClassName,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  description?: string;
  valueClassName?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn("text-3xl font-bold", valueClassName)}>
              <CountUp end={value} duration={600} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
        </div>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SurveyMetricBox({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <p className={cn("text-2xl font-bold", className)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
