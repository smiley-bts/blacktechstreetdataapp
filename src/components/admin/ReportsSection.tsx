import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useFeedback } from '@/hooks/useFeedback';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ReportsSection() {
  const { contacts } = useContacts();
  const { workshopFeedback, preSurveyFeedback, buildDayFeedback, ltfFeedback } = useFeedback();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const logActivity = async (action: string, details?: Record<string, unknown>) => {
    try {
      await supabase.rpc('log_activity', {
        _action: action,
        _details: details ? JSON.stringify(details) : null,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: 'No data',
        description: 'There is no data to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportContacts = async () => {
    setIsExporting('contacts');
    exportToCSV(contacts || [], 'contacts_export');
    await logActivity('export_contacts', { count: contacts?.length || 0 });
    toast({
      title: 'Export Complete',
      description: `Exported ${contacts?.length || 0} contacts`,
    });
    setIsExporting(null);
  };

  const handleExportFeedback = async () => {
    setIsExporting('feedback');
    const allFeedback = [
      ...(workshopFeedback || []).map(f => ({ ...f, type: 'workshop' })),
    ];
    exportToCSV(allFeedback, 'feedback_export');
    await logActivity('export_feedback', { count: allFeedback.length });
    toast({
      title: 'Export Complete',
      description: `Exported ${allFeedback.length} feedback entries`,
    });
    setIsExporting(null);
  };

  const handleExportPreSurvey = async () => {
    setIsExporting('presurvey');
    exportToCSV(preSurveyFeedback || [], 'presurvey_export');
    await logActivity('export_presurvey', { count: preSurveyFeedback?.length || 0 });
    toast({
      title: 'Export Complete',
      description: `Exported ${preSurveyFeedback?.length || 0} pre-survey entries`,
    });
    setIsExporting(null);
  };

  const handleExportBuildDay = async () => {
    setIsExporting('buildday');
    exportToCSV(buildDayFeedback || [], 'buildday_export');
    await logActivity('export_buildday', { count: buildDayFeedback?.length || 0 });
    toast({
      title: 'Export Complete',
      description: `Exported ${buildDayFeedback?.length || 0} build day entries`,
    });
    setIsExporting(null);
  };

  const handleExportLTF = async () => {
    setIsExporting('ltf');
    exportToCSV(ltfFeedback || [], 'ltf_export');
    await logActivity('export_ltf', { count: ltfFeedback?.length || 0 });
    toast({
      title: 'Export Complete',
      description: `Exported ${ltfFeedback?.length || 0} LTF entries`,
    });
    setIsExporting(null);
  };

  const reports = [
    {
      id: 'contacts',
      title: 'Contact Export',
      description: 'Export all contacts with their details',
      icon: Users,
      count: contacts?.length || 0,
      onExport: handleExportContacts,
    },
    {
      id: 'feedback',
      title: 'Workshop Feedback',
      description: 'Export ASPIRE workshop feedback responses',
      icon: MessageSquare,
      count: workshopFeedback?.length || 0,
      onExport: handleExportFeedback,
    },
    {
      id: 'presurvey',
      title: 'Pre-Survey Data',
      description: 'Export pre-program survey responses',
      icon: BarChart3,
      count: preSurveyFeedback?.length || 0,
      onExport: handleExportPreSurvey,
    },
    {
      id: 'buildday',
      title: 'Build Day Feedback',
      description: 'Export build day feedback data',
      icon: FileText,
      count: buildDayFeedback?.length || 0,
      onExport: handleExportBuildDay,
    },
    {
      id: 'ltf',
      title: 'LTF Feedback',
      description: 'Export Learn to Fly feedback',
      icon: FileText,
      count: ltfFeedback?.length || 0,
      onExport: handleExportLTF,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Reports
          </CardTitle>
          <CardDescription>
            Export data as CSV files for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <report.icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{report.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <p className="text-xs text-muted-foreground">{report.count} records</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={report.onExport}
                    disabled={isExporting === report.id}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting === report.id ? 'Exporting...' : 'Export CSV'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
