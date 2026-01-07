import { Contact, ContactFilter } from "@/types/contact";
import { useContactMetrics } from "@/hooks/useContactMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Star, 
  Brain, 
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryProps {
  contacts: Contact[];
  onNavigateToContacts?: (filters: Partial<ContactFilter>) => void;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-blue))", "hsl(var(--chart-purple))", "hsl(var(--gold))", "hsl(var(--chart-teal))"];

export function ExecutiveSummary({ contacts, onNavigateToContacts }: ExecutiveSummaryProps) {
  const metrics = useContactMetrics(contacts);

  const eventData = [
    { name: "Sept 27 Build Day", value: metrics.sept27BuildDay },
    { name: "Dec 6 Workshop", value: metrics.dec6Workshop },
    { name: "Dec 13 LTF", value: metrics.dec13LTF },
  ].filter(d => d.value > 0);

  const aiLevelData = Object.entries(metrics.aiLevels)
    .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + "..." : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const lifecycleData = Object.entries(metrics.lifecycleStages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const kpiCards = [
    {
      label: "Total Contacts",
      value: metrics.total.toLocaleString(),
      icon: Users,
      description: `${metrics.withEmail.toLocaleString()} with email`,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Event Registered",
      value: metrics.eventRegistered.toLocaleString(),
      icon: Calendar,
      description: `${Math.round((metrics.eventRegistered / metrics.total) * 100)}% of contacts`,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      label: "Actually Attended",
      value: metrics.eventActuallyAttended.toLocaleString(),
      icon: UserCheck,
      description: metrics.eventRegistered > 0 
        ? `${Math.round((metrics.eventActuallyAttended / metrics.eventRegistered) * 100)}% show rate`
        : "No registrations",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "NPS Score",
      value: metrics.npsScore !== null ? `${metrics.npsScore > 0 ? '+' : ''}${metrics.npsScore}` : "N/A",
      icon: TrendingUp,
      description: metrics.npsResponses > 0 ? `${metrics.npsResponses} responses` : "No responses",
      gradient: metrics.npsScore && metrics.npsScore >= 50 ? "from-emerald-500 to-green-600" : "from-slate-500 to-gray-600",
    },
    {
      label: "Data Quality",
      value: `${metrics.avgCompleteness}%`,
      icon: Target,
      description: `${metrics.complete} complete, ${metrics.incomplete} need attention`,
      gradient: metrics.avgCompleteness >= 70 ? "from-emerald-500 to-teal-600" : "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 group">
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
              `bg-gradient-to-br ${kpi.gradient}`
            )} />
            <CardContent className="p-3 sm:p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 sm:mt-1">{kpi.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{kpi.description}</p>
                </div>
                <div className={cn(
                  "p-2 sm:p-3 rounded-xl bg-gradient-to-br shrink-0 ml-2",
                  kpi.gradient
                )}>
                  <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Participation */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Event Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            {eventData.length > 0 ? (
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={eventData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ value }) => `${value}`}
                      labelLine={false}
                    >
                      {eventData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: '4px', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '8px' }}
                      formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No event data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Experience Breakdown */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Experience Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiLevelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={aiLevelData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No AI experience data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle & Quality Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lifecycle Stages */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Contact Lifecycle Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lifecycleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={lifecycleData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--chart-blue))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No lifecycle data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Complete Profiles - clickable */}
              <button 
                onClick={() => onNavigateToContacts?.({ search: "" })}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-left group"
              >
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{metrics.complete} Complete Profiles</p>
                  <p className="text-xs text-muted-foreground">80%+ data completeness - click to view high-quality contacts</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
              
              {/* Need Attention - clickable */}
              <button 
                onClick={() => onNavigateToContacts?.({ search: "" })}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-left group"
              >
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{metrics.incomplete} Need Attention</p>
                  <p className="text-xs text-muted-foreground">Less than 50% complete - click to review and enrich</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>

              {/* Feedback Submissions - clickable */}
              <button 
                onClick={() => onNavigateToContacts?.({ hasFeedback: true })}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-left group"
              >
                <Brain className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{metrics.withFeedback} Feedback Submissions</p>
                  <p className="text-xs text-muted-foreground">{metrics.buildDayParticipants} with Build Day projects - click to view</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>

              {/* NPS Breakdown - clickable */}
              {metrics.npsScore !== null && (
                <button 
                  onClick={() => onNavigateToContacts?.({ hasFeedback: true })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border hover:opacity-90 transition-all text-left group",
                    metrics.npsScore >= 50 
                      ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" 
                      : metrics.npsScore >= 0 
                        ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                        : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                  )}
                >
                  <TrendingUp className={cn(
                    "h-5 w-5 shrink-0",
                    metrics.npsScore >= 50 ? "text-emerald-500" : metrics.npsScore >= 0 ? "text-amber-500" : "text-red-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{metrics.promoters} Promoters vs {metrics.detractors} Detractors</p>
                    <p className="text-xs text-muted-foreground">NPS breakdown - click to see feedback details</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
