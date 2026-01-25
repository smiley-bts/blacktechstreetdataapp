import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  MousePointer,
  Filter,
  Search,
  Download,
  Clock,
  Eye,
  Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Json } from '@/integrations/supabase/types';

interface AnalyticsLog {
  id: string;
  action: string;
  details: Json;
  created_at: string;
}

interface EventCount {
  event_type: string;
  count: number;
}

interface DailyCount {
  date: string;
  count: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const eventLabels: Record<string, string> = {
  crm_tab_switch: 'Tab Navigation',
  crm_filter_apply: 'Filter Applied',
  crm_search_query: 'Search Query',
  crm_contact_view: 'Contact Viewed',
  crm_export_action: 'Export',
  crm_print_action: 'Print',
  crm_sync_action: 'Sync',
  crm_dedup_action: 'Deduplication',
  crm_import_action: 'Import',
  crm_presentation_mode: 'Presentation Mode',
  crm_session_start: 'Session Start',
  crm_session_end: 'Session End',
};

const eventIcons: Record<string, typeof BarChart3> = {
  crm_tab_switch: Layers,
  crm_filter_apply: Filter,
  crm_search_query: Search,
  crm_contact_view: Eye,
  crm_export_action: Download,
  crm_session_start: Clock,
  crm_session_end: Clock,
};

export function CRMUsageAnalytics() {
  const [logs, setLogs] = useState<AnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), daysAgo)).toISOString();
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .like('action', 'crm_%')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch CRM analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Aggregate event counts
  const eventCounts = useMemo((): EventCount[] => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([event_type, count]) => ({ event_type, count }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // Daily usage trend
  const dailyTrend = useMemo((): DailyCount[] => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const date = format(new Date(log.created_at), 'MMM d');
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .reverse()
      .slice(-14); // Last 14 days with data
  }, [logs]);

  // Tab usage breakdown
  const tabUsage = useMemo(() => {
    const tabCounts: Record<string, number> = {};
    logs
      .filter(log => log.action === 'crm_tab_switch')
      .forEach(log => {
        if (log.details && typeof log.details === 'object' && !Array.isArray(log.details)) {
          const details = log.details as Record<string, unknown>;
          const tab = details.tab as string || 'unknown';
          tabCounts[tab] = (tabCounts[tab] || 0) + 1;
        }
      });
    return Object.entries(tabCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // Average session duration
  const avgSessionDuration = useMemo(() => {
    const sessionEnds = logs.filter(log => log.action === 'crm_session_end');
    if (sessionEnds.length === 0) return null;
    
    let totalDuration = 0;
    let validSessions = 0;
    
    sessionEnds.forEach(log => {
      if (log.details && typeof log.details === 'object' && !Array.isArray(log.details)) {
        const details = log.details as Record<string, unknown>;
        const duration = details.duration_seconds as number;
        if (duration && duration > 0 && duration < 7200) { // Max 2 hours
          totalDuration += duration;
          validSessions++;
        }
      }
    });
    
    return validSessions > 0 ? Math.round(totalDuration / validSessions) : null;
  }, [logs]);

  // Most viewed contacts
  const topContacts = useMemo(() => {
    const contactCounts: Record<string, number> = {};
    logs
      .filter(log => log.action === 'crm_contact_view')
      .forEach(log => {
        if (log.details && typeof log.details === 'object' && !Array.isArray(log.details)) {
          const details = log.details as Record<string, unknown>;
          const contactId = details.contact_id as string || 'unknown';
          contactCounts[contactId] = (contactCounts[contactId] || 0) + 1;
        }
      });
    return Object.entries(contactCounts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  // Summary stats
  const stats = useMemo(() => ({
    totalEvents: logs.length,
    uniqueSessions: logs.filter(l => l.action === 'crm_session_start').length,
    totalSearches: logs.filter(l => l.action === 'crm_search_query').length,
    totalExports: logs.filter(l => l.action === 'crm_export_action').length,
    totalContactViews: logs.filter(l => l.action === 'crm_contact_view').length,
  }), [logs]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              CRM Usage Analytics
            </CardTitle>
            <CardDescription>
              Understand how your team uses the CRM
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as '7d' | '30d' | '90d')}>
              <TabsList className="h-8">
                <TabsTrigger value="7d" className="text-xs px-2">7 days</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs px-2">30 days</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs px-2">90 days</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAnalytics} 
              disabled={loading}
              className="border-border"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No CRM usage data yet</p>
            <p className="text-sm text-muted-foreground">Usage stats will appear as admins interact with the CRM</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <MousePointer className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total Events</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stats.totalEvents.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-chart-2" />
                  <span className="text-xs text-muted-foreground">Sessions</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stats.uniqueSessions}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="h-4 w-4 text-chart-3" />
                  <span className="text-xs text-muted-foreground">Searches</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stats.totalSearches}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-chart-4" />
                  <span className="text-xs text-muted-foreground">Contact Views</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stats.totalContactViews}</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-5/10 border border-chart-5/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-chart-5" />
                  <span className="text-xs text-muted-foreground">Avg Session</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {avgSessionDuration ? formatDuration(avgSessionDuration) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Trend */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Daily Activity Trend
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTrend}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tab Usage Pie */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Tab Usage Distribution
                </h4>
                {tabUsage.length > 0 ? (
                  <div className="h-48 flex items-center">
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie
                          data={tabUsage}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {tabUsage.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1">
                      {tabUsage.slice(0, 5).map((tab, index) => (
                        <div key={tab.name} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="capitalize text-muted-foreground">{tab.name}</span>
                          <span className="font-medium text-foreground ml-auto">{tab.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    No tab navigation data yet
                  </div>
                )}
              </div>
            </div>

            {/* Event Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Event Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {eventCounts.slice(0, 8).map(({ event_type, count }) => {
                  const Icon = eventIcons[event_type] || BarChart3;
                  return (
                    <div 
                      key={event_type}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/60"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {eventLabels[event_type] || event_type.replace('crm_', '').replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm font-semibold text-foreground">{count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Viewed Contacts */}
            {topContacts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Most Viewed Contacts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topContacts.map(({ id, count }) => (
                    <Badge key={id} variant="secondary" className="font-mono text-xs">
                      {id.slice(0, 8)}... ({count} views)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
