import { useMemo } from "react";
import { Contact, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay } from "@/types/contact";
import { getCompletenessScore } from "@/lib/contactCompleteness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Target,
  Brain,
  Star,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Quote,
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
import btsLogo from "@/assets/black-tech-street-logo.png";

interface ExecutiveReportGeneratorProps {
  contacts: Contact[];
  feedbackQuotes?: string[];
  projectNames?: string[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-blue))", "hsl(var(--chart-purple))", "hsl(var(--gold))", "hsl(var(--chart-teal))"];

export function ExecutiveReportGenerator({ contacts, feedbackQuotes = [], projectNames = [] }: ExecutiveReportGeneratorProps) {
  const stats = useMemo(() => {
    const total = contacts.length;
    const withEmail = contacts.filter(c => c.email).length;
    const eventAttendees = contacts.filter(c => c.eventsAttended || c.sept27thReg).length;
    const withFeedback = contacts.filter(c => hasEventFeedback(c)).length;
    const buildDayParticipants = contacts.filter(c => hasBuildDayData(c)).length;
    
    const complete = contacts.filter(c => getCompletenessScore(c) >= 80).length;
    const incomplete = contacts.filter(c => getCompletenessScore(c) < 50).length;
    const avgCompleteness = total > 0 
      ? Math.round(contacts.reduce((sum, c) => sum + getCompletenessScore(c), 0) / total) 
      : 0;

    const npsResponses = contacts.filter(c => c.npsScore);
    const promoters = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
    const detractors = npsResponses.filter(c => parseInt(c.npsScore) <= 2).length;
    const npsScore = npsResponses.length > 0 
      ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
      : null;

    const dec6Count = contacts.filter(c => isDec6Workshop(c)).length;
    const dec13Count = contacts.filter(c => isDec13LTF(c)).length;
    const sept27Count = contacts.filter(c => isSept27BuildDay(c)).length;

    const aiLevels: Record<string, number> = {};
    contacts.forEach(c => {
      if (c.aiExperienceLevel) {
        const level = c.aiExperienceLevel.split(":")[0].trim();
        aiLevels[level] = (aiLevels[level] || 0) + 1;
      }
    });

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

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - matching dashboard style */}
      <header className="print:break-inside-avoid">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/50 to-accent/10 border border-border/50 p-4 sm:p-6 print:rounded-lg print:p-4">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 print:hidden" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 print:hidden" />
          
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md print:hidden" />
                  <div className="relative bg-background/80 backdrop-blur-sm rounded-xl p-2 sm:p-2.5 border border-border/50 shadow-sm print:bg-white print:border-gray-200">
                    <img src={btsLogo} alt="Black Tech Street" className="h-8 sm:h-10 w-auto" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text print:text-black">
                    Executive Impact Report
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <FileText className="h-3.5 w-3.5" />
                    Generated {currentDate}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{stats.total.toLocaleString()} Contacts</p>
                <p className="text-xs text-muted-foreground">ASPIRE Program Data</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Cards - matching dashboard layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 print:gap-2 print:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden border-border/50 print:border-gray-200">
            <div className={cn(
              "absolute inset-0 opacity-10 print:opacity-5",
              `bg-gradient-to-br ${kpi.gradient}`
            )} />
            <CardContent className="p-3 sm:p-6 relative z-10 print:p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate print:text-gray-600">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 sm:mt-1 print:text-xl print:text-black">{kpi.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate print:text-gray-500">{kpi.description}</p>
                </div>
                <div className={cn(
                  "p-2 sm:p-3 rounded-xl bg-gradient-to-br shrink-0 ml-2 print:p-2",
                  kpi.gradient
                )}>
                  <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white print:h-4 print:w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 print:break-inside-avoid">
        {/* Event Participation */}
        <Card className="border-border/50 print:border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 print:text-base">
              <PieChartIcon className="h-5 w-5 text-primary print:h-4 print:w-4" />
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
        <Card className="border-border/50 print:border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 print:text-base">
              <Brain className="h-5 w-5 text-primary print:h-4 print:w-4" />
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

      {/* Lifecycle & Quick Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4 print:break-inside-avoid">
        {/* Lifecycle Stages */}
        <Card className="border-border/50 print:border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 print:text-base">
              <BarChart3 className="h-5 w-5 text-primary print:h-4 print:w-4" />
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
        <Card className="border-border/50 print:border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 print:text-base">
              <Star className="h-5 w-5 text-primary print:h-4 print:w-4" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 print:bg-green-50 print:border-green-200">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground print:text-black">{stats.complete} Complete Profiles</p>
                  <p className="text-xs text-muted-foreground print:text-gray-600">80%+ data completeness</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 print:bg-amber-50 print:border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground print:text-black">{stats.incomplete} Need Attention</p>
                  <p className="text-xs text-muted-foreground print:text-gray-600">Less than 50% complete</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 print:bg-blue-50 print:border-blue-200">
                <Brain className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground print:text-black">{stats.withFeedback} Feedback Submissions</p>
                  <p className="text-xs text-muted-foreground print:text-gray-600">{stats.buildDayParticipants} with Build Day projects</p>
                </div>
              </div>

              {stats.npsScore !== null && (
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  stats.npsScore >= 50 
                    ? "bg-emerald-500/10 border-emerald-500/20 print:bg-green-50 print:border-green-200" 
                    : stats.npsScore >= 0 
                      ? "bg-amber-500/10 border-amber-500/20 print:bg-amber-50 print:border-amber-200"
                      : "bg-red-500/10 border-red-500/20 print:bg-red-50 print:border-red-200"
                )}>
                  <TrendingUp className={cn(
                    "h-5 w-5 shrink-0",
                    stats.npsScore >= 50 ? "text-emerald-500" : stats.npsScore >= 0 ? "text-amber-500" : "text-red-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground print:text-black">{stats.promoters} Promoters vs {stats.detractors} Detractors</p>
                    <p className="text-xs text-muted-foreground print:text-gray-600">NPS Score: {stats.npsScore > 0 ? '+' : ''}{stats.npsScore}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Section */}
      {feedbackQuotes.length > 0 && (
        <Card className="border-border/50 print:border-gray-200 print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 print:text-base">
              <Quote className="h-5 w-5 text-primary print:h-4 print:w-4" />
              Participant Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
              {feedbackQuotes.slice(0, 4).map((quote, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30 print:bg-gray-50 print:border-gray-200"
                >
                  <p className="text-sm italic text-foreground/90 print:text-gray-800">"{quote}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Build Day Projects */}
      {projectNames.length > 0 && (
        <Card className="border-border/50 print:border-gray-200 print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 print:text-base">
              <Star className="h-5 w-5 text-primary print:h-4 print:w-4" />
              Build Day Projects Highlight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {projectNames.slice(0, 12).map((name, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-foreground print:bg-blue-50 print:border-blue-200 print:text-blue-800"
                >
                  {name}
                </span>
              ))}
              {projectNames.length > 12 && (
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground print:bg-gray-100 print:text-gray-600">
                  +{projectNames.length - 12} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <footer className="pt-4 border-t border-border/50 print:border-gray-200 print:pt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground print:text-gray-500">
          <p>Black Tech Street CRM - ASPIRE Program</p>
          <p>Confidential - Internal Use Only</p>
        </div>
      </footer>
    </div>
  );
}

export function openExecutiveReport(contacts: Contact[], feedbackQuotes: string[] = [], projectNames: string[] = []) {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    alert('Please allow popups to generate the report');
    return;
  }

  const stats = {
    total: contacts.length,
    withEmail: contacts.filter(c => c.email).length,
    eventAttendees: contacts.filter(c => c.eventsAttended || c.sept27thReg).length,
    withFeedback: contacts.filter(c => hasEventFeedback(c)).length,
    buildDayParticipants: contacts.filter(c => hasBuildDayData(c)).length,
    complete: contacts.filter(c => getCompletenessScore(c) >= 80).length,
    incomplete: contacts.filter(c => getCompletenessScore(c) < 50).length,
    avgCompleteness: contacts.length > 0 
      ? Math.round(contacts.reduce((sum, c) => sum + getCompletenessScore(c), 0) / contacts.length) 
      : 0,
    dec6Count: contacts.filter(c => isDec6Workshop(c)).length,
    dec13Count: contacts.filter(c => isDec13LTF(c)).length,
    sept27Count: contacts.filter(c => isSept27BuildDay(c)).length,
  };

  const npsResponses = contacts.filter(c => c.npsScore);
  const promoters = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
  const detractors = npsResponses.filter(c => parseInt(c.npsScore) <= 2).length;
  const npsScore = npsResponses.length > 0 
    ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
    : null;

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Executive Impact Report - Black Tech Street</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #1e293b;
      padding: 32px;
      min-height: 100vh;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.05) 50%, rgba(236, 72, 153, 0.08) 100%);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 24px 32px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .logo-section { display: flex; align-items: center; gap: 16px; }
    .logo-box {
      background: white;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 12px;
      padding: 10px 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .logo-box img { height: 36px; width: auto; }
    .header h1 { 
      font-size: 28px; 
      font-weight: 700; 
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 4px;
    }
    .header .subtitle { font-size: 14px; color: #64748b; display: flex; align-items: center; gap: 6px; }
    .header-stats { text-align: right; }
    .header-stats .count { font-size: 18px; font-weight: 600; color: #1e293b; }
    .header-stats .label { font-size: 12px; color: #64748b; }
    
    /* KPI Cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      background: white;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.08;
    }
    .kpi-card.blue::before { background: linear-gradient(135deg, #3b82f6, #6366f1); }
    .kpi-card.amber::before { background: linear-gradient(135deg, #f59e0b, #ea580c); }
    .kpi-card.emerald::before { background: linear-gradient(135deg, #10b981, #059669); }
    .kpi-card.slate::before { background: linear-gradient(135deg, #64748b, #475569); }
    .kpi-content { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; }
    .kpi-label { font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
    .kpi-value { font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .kpi-desc { font-size: 11px; color: #94a3b8; }
    .kpi-icon { 
      width: 44px; 
      height: 44px; 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: white;
      font-size: 20px;
    }
    .kpi-icon.blue { background: linear-gradient(135deg, #3b82f6, #6366f1); }
    .kpi-icon.amber { background: linear-gradient(135deg, #f59e0b, #ea580c); }
    .kpi-icon.emerald { background: linear-gradient(135deg, #10b981, #059669); }
    .kpi-icon.slate { background: linear-gradient(135deg, #64748b, #475569); }
    
    /* Charts Section */
    .charts-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 24px; }
    .chart-card {
      background: white;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      padding: 20px;
    }
    .chart-title { 
      font-size: 16px; 
      font-weight: 600; 
      color: #1e293b; 
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chart-title svg { color: #3b82f6; }
    
    /* Event Stats */
    .event-list { display: flex; flex-direction: column; gap: 12px; }
    .event-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.03));
      border-radius: 8px;
    }
    .event-dot { width: 12px; height: 12px; border-radius: 50%; }
    .event-dot.primary { background: #3b82f6; }
    .event-dot.blue { background: #0ea5e9; }
    .event-dot.purple { background: #8b5cf6; }
    .event-name { flex: 1; font-size: 14px; color: #334155; }
    .event-count { font-size: 18px; font-weight: 600; color: #1e293b; }
    
    /* Insights */
    .insight-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .insight-item.emerald { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
    .insight-item.amber { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); }
    .insight-item.primary { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
    .insight-icon { font-size: 20px; }
    .insight-icon.emerald { color: #10b981; }
    .insight-icon.amber { color: #f59e0b; }
    .insight-icon.primary { color: #3b82f6; }
    .insight-text { flex: 1; }
    .insight-text strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
    .insight-text span { font-size: 12px; color: #64748b; }
    
    /* Quotes */
    .quotes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .quote-card {
      padding: 16px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(236, 72, 153, 0.04));
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 8px;
      font-style: italic;
      font-size: 14px;
      color: #475569;
      line-height: 1.5;
    }
    
    /* Projects */
    .projects-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .project-tag {
      padding: 8px 14px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #3b82f6;
    }
    
    /* Footer */
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #94a3b8;
    }
    
    @media print {
      body { padding: 16px; background: white; }
      .header, .kpi-card, .chart-card { box-shadow: none; }
      .kpi-grid { gap: 8px; }
      .charts-row { gap: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-box">
            <img src="${btsLogo}" alt="Black Tech Street" />
          </div>
          <div>
            <h1>Executive Impact Report</h1>
            <p class="subtitle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              Generated ${currentDate}
            </p>
          </div>
        </div>
        <div class="header-stats">
          <p class="count">${stats.total.toLocaleString()} Contacts</p>
          <p class="label">ASPIRE Program Data</p>
        </div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card blue">
        <div class="kpi-content">
          <div>
            <p class="kpi-label">Total Contacts</p>
            <p class="kpi-value">${stats.total.toLocaleString()}</p>
            <p class="kpi-desc">${stats.withEmail.toLocaleString()} with email</p>
          </div>
          <div class="kpi-icon blue">👥</div>
        </div>
      </div>
      <div class="kpi-card amber">
        <div class="kpi-content">
          <div>
            <p class="kpi-label">Event Attendees</p>
            <p class="kpi-value">${stats.eventAttendees.toLocaleString()}</p>
            <p class="kpi-desc">${Math.round((stats.eventAttendees / stats.total) * 100)}% of contacts</p>
          </div>
          <div class="kpi-icon amber">📅</div>
        </div>
      </div>
      <div class="kpi-card ${npsScore && npsScore >= 50 ? 'emerald' : 'slate'}">
        <div class="kpi-content">
          <div>
            <p class="kpi-label">NPS Score</p>
            <p class="kpi-value">${npsScore !== null ? (npsScore > 0 ? '+' : '') + npsScore : 'N/A'}</p>
            <p class="kpi-desc">${npsResponses.length} responses</p>
          </div>
          <div class="kpi-icon ${npsScore && npsScore >= 50 ? 'emerald' : 'slate'}">📈</div>
        </div>
      </div>
      <div class="kpi-card ${stats.avgCompleteness >= 70 ? 'emerald' : 'amber'}">
        <div class="kpi-content">
          <div>
            <p class="kpi-label">Data Quality</p>
            <p class="kpi-value">${stats.avgCompleteness}%</p>
            <p class="kpi-desc">${stats.complete} complete, ${stats.incomplete} need attention</p>
          </div>
          <div class="kpi-icon ${stats.avgCompleteness >= 70 ? 'emerald' : 'amber'}">🎯</div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <h3 class="chart-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          Event Participation
        </h3>
        <div class="event-list">
          <div class="event-item">
            <div class="event-dot primary"></div>
            <span class="event-name">Sept 27 Build Day</span>
            <span class="event-count">${stats.sept27Count}</span>
          </div>
          <div class="event-item">
            <div class="event-dot blue"></div>
            <span class="event-name">Dec 6 Workshop</span>
            <span class="event-count">${stats.dec6Count}</span>
          </div>
          <div class="event-item">
            <div class="event-dot purple"></div>
            <span class="event-name">Dec 13 LTF</span>
            <span class="event-count">${stats.dec13Count}</span>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          Quick Insights
        </h3>
        <div class="insight-item emerald">
          <span class="insight-icon emerald">✓</span>
          <div class="insight-text">
            <strong>${stats.complete} Complete Profiles</strong>
            <span>80%+ data completeness</span>
          </div>
        </div>
        <div class="insight-item amber">
          <span class="insight-icon amber">⚠</span>
          <div class="insight-text">
            <strong>${stats.incomplete} Need Attention</strong>
            <span>Less than 50% complete</span>
          </div>
        </div>
        <div class="insight-item primary">
          <span class="insight-icon primary">💡</span>
          <div class="insight-text">
            <strong>${stats.withFeedback} Feedback Submissions</strong>
            <span>${stats.buildDayParticipants} with Build Day projects</span>
          </div>
        </div>
      </div>
    </div>

    ${feedbackQuotes.length > 0 ? `
    <div class="chart-card" style="margin-bottom: 24px;">
      <h3 class="chart-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        Participant Testimonials
      </h3>
      <div class="quotes-grid">
        ${feedbackQuotes.slice(0, 4).map(q => `<div class="quote-card">"${q}"</div>`).join('')}
      </div>
    </div>
    ` : ''}

    ${projectNames.length > 0 ? `
    <div class="chart-card" style="margin-bottom: 24px;">
      <h3 class="chart-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Build Day Projects Highlight
      </h3>
      <div class="projects-wrap">
        ${projectNames.slice(0, 12).map(p => `<span class="project-tag">${p}</span>`).join('')}
        ${projectNames.length > 12 ? `<span class="project-tag" style="background: #f1f5f9; color: #64748b; border-color: #e2e8f0;">+${projectNames.length - 12} more</span>` : ''}
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p>Black Tech Street CRM - ASPIRE Program</p>
      <p>Confidential - Internal Use Only</p>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}