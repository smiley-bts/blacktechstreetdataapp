import { useMemo } from "react";
import { Contact, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay, ContactFilter } from "@/types/contact";
import { getCompletenessScore } from "@/lib/contactCompleteness";
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
  const stats = useMemo(() => {
    const total = contacts.length;
    const withEmail = contacts.filter(c => c.email).length;
    const eventAttendees = contacts.filter(c => c.eventsAttended || c.sept27thReg).length;
    const withFeedback = contacts.filter(c => hasEventFeedback(c)).length;
    const buildDayParticipants = contacts.filter(c => hasBuildDayData(c)).length;
    
    // Data quality
    const complete = contacts.filter(c => getCompletenessScore(c) >= 80).length;
    const incomplete = contacts.filter(c => getCompletenessScore(c) < 50).length;
    const avgCompleteness = total > 0 
      ? Math.round(contacts.reduce((sum, c) => sum + getCompletenessScore(c), 0) / total) 
      : 0;

    // NPS calculation
    const npsResponses = contacts.filter(c => c.npsScore);
    const promoters = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
    const detractors = npsResponses.filter(c => parseInt(c.npsScore) <= 2).length;
    const npsScore = npsResponses.length > 0 
      ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
      : null;

    // Event breakdowns
    const dec6Count = contacts.filter(c => isDec6Workshop(c)).length;
    const dec13Count = contacts.filter(c => isDec13LTF(c)).length;
    const sept27Count = contacts.filter(c => isSept27BuildDay(c)).length;

    // AI Experience levels
    const aiLevels: Record<string, number> = {};
    contacts.forEach(c => {
      if (c.aiExperienceLevel) {
        const level = c.aiExperienceLevel.split(":")[0].trim();
        aiLevels[level] = (aiLevels[level] || 0) + 1;
      }
    });

    // Lifecycle stages
    const lifecycleStages: Record<string, number> = {};
    contacts.forEach(c => {
      if (c.lifecycleStage) {
        lifecycleStages[c.lifecycleStage] = (lifecycleStages[c.lifecycleStage] || 0) + 1;
      }
    });

    return {
      total,
      withEmail,
      eventAttendees,
      withFeedback,
      buildDayParticipants,
      complete,
      incomplete,
      avgCompleteness,
      npsScore,
      npsResponses: npsResponses.length,
      promoters,
      detractors,
      dec6Count,
      dec13Count,
      sept27Count,
      aiLevels,
      lifecycleStages,
    };
  }, [contacts]);

  const eventData = [
    { name: "Sept 27 Build Day", value: stats.sept27Count },
    { name: "Dec 6 Workshop", value: stats.dec6Count },
    { name: "Dec 13 LTF", value: stats.dec13Count },
  ].filter(d => d.value > 0);

  const aiLevelData = Object.entries(stats.aiLevels)
    .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + "..." : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const lifecycleData = Object.entries(stats.lifecycleStages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const kpiCards = [
    {
      label: "Total Contacts",
      value: stats.total.toLocaleString(),
      icon: Users,
      description: `${stats.withEmail.toLocaleString()} with email`,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Event Attendees",
      value: stats.eventAttendees.toLocaleString(),
      icon: Calendar,
      description: `${Math.round((stats.eventAttendees / stats.total) * 100)}% of contacts`,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      label: "NPS Score",
      value: stats.npsScore !== null ? `${stats.npsScore > 0 ? '+' : ''}${stats.npsScore}` : "N/A",
      icon: TrendingUp,
      description: stats.npsResponses > 0 ? `${stats.npsResponses} responses` : "No responses",
      gradient: stats.npsScore && stats.npsScore >= 50 ? "from-emerald-500 to-green-600" : "from-slate-500 to-gray-600",
    },
    {
      label: "Data Quality",
      value: `${stats.avgCompleteness}%`,
      icon: Target,
      description: `${stats.complete} complete, ${stats.incomplete} need attention`,
      gradient: stats.avgCompleteness >= 70 ? "from-emerald-500 to-teal-600" : "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 group">
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
              `bg-gradient-to-br ${kpi.gradient}`
            )} />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br",
                  kpi.gradient
                )}>
                  <kpi.icon className="h-5 w-5 text-white" />
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
          <CardContent>
            {eventData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={eventData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
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
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
                  <p className="font-medium text-foreground">{stats.complete} Complete Profiles</p>
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
                  <p className="font-medium text-foreground">{stats.incomplete} Need Attention</p>
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
                  <p className="font-medium text-foreground">{stats.withFeedback} Feedback Submissions</p>
                  <p className="text-xs text-muted-foreground">{stats.buildDayParticipants} with Build Day projects - click to view</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>

              {/* NPS Breakdown - clickable */}
              {stats.npsScore !== null && (
                <button 
                  onClick={() => onNavigateToContacts?.({ hasFeedback: true })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border hover:opacity-90 transition-all text-left group",
                    stats.npsScore >= 50 
                      ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" 
                      : stats.npsScore >= 0 
                        ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                        : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                  )}
                >
                  <TrendingUp className={cn(
                    "h-5 w-5 shrink-0",
                    stats.npsScore >= 50 ? "text-emerald-500" : stats.npsScore >= 0 ? "text-amber-500" : "text-red-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{stats.promoters} Promoters vs {stats.detractors} Detractors</p>
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
