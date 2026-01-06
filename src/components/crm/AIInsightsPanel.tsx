import { useState, useEffect } from "react";
import { Contact, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay } from "@/types/contact";
import { getCompletenessScore } from "@/lib/contactCompleteness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  RefreshCw, 
  Lightbulb,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightsPanelProps {
  contacts: Contact[];
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'trend';
  title: string;
  description: string;
  metric?: string;
  icon: React.ReactNode;
}

export function AIInsightsPanel({ contacts }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateInsights = () => {
    setIsGenerating(true);
    
    // Simulate generation delay for effect
    setTimeout(() => {
      const newInsights: Insight[] = [];
      
      // Calculate stats
      const total = contacts.length;
      const withEmail = contacts.filter(c => c.email).length;
      const eventAttendees = contacts.filter(c => c.eventsAttended || c.sept27thReg).length;
      const withFeedback = contacts.filter(c => hasEventFeedback(c)).length;
      const buildDayParticipants = contacts.filter(c => hasBuildDayData(c)).length;
      
      const dec6Count = contacts.filter(c => isDec6Workshop(c)).length;
      const dec13Count = contacts.filter(c => isDec13LTF(c)).length;
      const sept27Count = contacts.filter(c => isSept27BuildDay(c)).length;

      const avgCompleteness = total > 0 
        ? Math.round(contacts.reduce((sum, c) => sum + getCompletenessScore(c), 0) / total) 
        : 0;

      const npsResponses = contacts.filter(c => c.npsScore);
      const promoters = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
      const npsScore = npsResponses.length > 0 
        ? Math.round(((promoters - npsResponses.filter(c => parseInt(c.npsScore) <= 2).length) / npsResponses.length) * 100)
        : null;

      // AI Experience breakdown
      const aiLevels: Record<string, number> = {};
      contacts.forEach(c => {
        if (c.aiExperienceLevel) {
          const level = c.aiExperienceLevel.split(":")[0].trim();
          aiLevels[level] = (aiLevels[level] || 0) + 1;
        }
      });
      const beginners = (aiLevels["Beginner"] || 0) + (aiLevels["None"] || 0);
      const advanced = (aiLevels["Advanced"] || 0) + (aiLevels["Expert"] || 0);

      // Generate insights based on data
      if (npsScore !== null && npsScore >= 50) {
        newInsights.push({
          id: 'nps-high',
          type: 'success',
          title: 'Excellent Program Reception',
          description: `With an NPS of ${npsScore > 0 ? '+' : ''}${npsScore}, your programs are creating strong advocates. ${promoters} participants would actively recommend your events.`,
          metric: `+${npsScore} NPS`,
          icon: <TrendingUp className="h-5 w-5" />,
        });
      }

      if (withFeedback > 0) {
        const feedbackRate = Math.round((withFeedback / eventAttendees) * 100);
        newInsights.push({
          id: 'feedback-rate',
          type: feedbackRate > 50 ? 'success' : 'info',
          title: 'Feedback Collection',
          description: `${feedbackRate}% of event attendees provided feedback. ${feedbackRate > 50 ? 'This high engagement shows participants value sharing their experience.' : 'Consider incentivizing feedback for future events.'}`,
          metric: `${withFeedback} responses`,
          icon: <Lightbulb className="h-5 w-5" />,
        });
      }

      // Event comparison insight
      const events = [
        { name: 'Dec 6 Workshop', count: dec6Count },
        { name: 'Dec 13 LTF', count: dec13Count },
        { name: 'Sept 27 Build Day', count: sept27Count },
      ].filter(e => e.count > 0).sort((a, b) => b.count - a.count);

      if (events.length > 1) {
        newInsights.push({
          id: 'event-comparison',
          type: 'trend',
          title: 'Event Performance',
          description: `${events[0].name} had the highest attendance with ${events[0].count} participants. ${events.length > 1 ? `This is ${Math.round((events[0].count / events[1].count - 1) * 100)}% more than ${events[1].name}.` : ''}`,
          metric: `${events[0].count} attendees`,
          icon: <Users className="h-5 w-5" />,
        });
      }

      // Data quality insight
      if (avgCompleteness < 70) {
        const incomplete = contacts.filter(c => getCompletenessScore(c) < 50).length;
        newInsights.push({
          id: 'data-quality',
          type: 'warning',
          title: 'Data Enrichment Opportunity',
          description: `${incomplete} contacts have less than 50% complete profiles. Enriching this data could improve segmentation and personalization.`,
          metric: `${avgCompleteness}% avg`,
          icon: <AlertCircle className="h-5 w-5" />,
        });
      } else {
        newInsights.push({
          id: 'data-quality-good',
          type: 'success',
          title: 'Strong Data Quality',
          description: `Your CRM maintains ${avgCompleteness}% average data completeness. This enables effective segmentation and outreach.`,
          metric: `${avgCompleteness}% complete`,
          icon: <CheckCircle className="h-5 w-5" />,
        });
      }

      // AI experience insight
      if (beginners > 0 && advanced > 0) {
        const ratio = Math.round((advanced / beginners) * 100);
        newInsights.push({
          id: 'ai-experience',
          type: 'info',
          title: 'AI Skill Distribution',
          description: `Your community has ${beginners} beginners and ${advanced} advanced AI users. This mix is ideal for peer learning and mentorship opportunities.`,
          metric: `${ratio}% ratio`,
          icon: <Zap className="h-5 w-5" />,
        });
      }

      // Build Day insight
      if (buildDayParticipants > 0) {
        const teamsWithProjects = contacts.filter(c => c.teamBuildDescription).length;
        newInsights.push({
          id: 'build-day',
          type: 'success',
          title: 'Build Day Impact',
          description: `${teamsWithProjects} participants documented their team projects. These tangible outcomes demonstrate practical AI application skills.`,
          metric: `${teamsWithProjects} projects`,
          icon: <Sparkles className="h-5 w-5" />,
        });
      }

      setInsights(newInsights);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1500);
  };

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5';
      case 'trend':
        return 'border-blue-500/20 bg-blue-500/5';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-500';
      case 'warning':
        return 'text-amber-500';
      case 'trend':
        return 'text-blue-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Insights
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={isGenerating}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
            {hasGenerated ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasGenerated ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Generate AI Insights</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Analyze your contact data to discover trends, opportunities, and actionable recommendations.
            </p>
            <Button onClick={generateInsights} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Analyzing your data...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={insight.id}
                className={cn(
                  "p-4 rounded-lg border transition-all animate-fade-in",
                  getTypeStyles(insight.type)
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5", getIconColor(insight.type))}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{insight.title}</h4>
                      {insight.metric && (
                        <Badge variant="outline" className="shrink-0">
                          {insight.metric}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
