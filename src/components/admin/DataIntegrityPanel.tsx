import { useState } from "react";
import {
  useDataIntegrity,
  exportAllData,
  downloadAsJSON,
  downloadAsCSV,
  DataIntegrityIssue,
  IssueSeverity,
} from "@/hooks/useDataIntegrity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  RefreshCw,
  Download,
  Database,
  FileJson,
  FileSpreadsheet,
  Shield,
  Users,
  Calendar,
  ClipboardList,
  PieChart,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SEVERITY_CONFIG: Record<IssueSeverity, { icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
};

const CATEGORY_ICONS: Record<string, typeof Users> = {
  duplicates: Users,
  attendance: Calendar,
  surveys: ClipboardList,
  demographics: PieChart,
  data_quality: Database,
};

export function DataIntegrityPanel() {
  const { data: integrity, isLoading, refetch, isRefetching } = useDataIntegrity();
  const [exporting, setExporting] = useState(false);
  const [wiping, setWiping] = useState(false);

  const handleWipeAllData = async () => {
    setWiping(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const response = await supabase.functions.invoke("wipe-crm-data", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        toast.error(`Wipe failed: ${response.error.message}`);
        return;
      }

      const result = response.data;
      if (result.success) {
        const total = Object.values(result.deleted as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
        toast.success(`Wiped ${total} records across all CRM tables`);
        refetch();
      } else {
        toast.error(result.error || "Wipe failed");
      }
    } catch (error) {
      toast.error("Wipe failed unexpectedly");
    } finally {
      setWiping(false);
    }
  };

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const data = await exportAllData();
      downloadAsJSON(data, `bts-data-export-${format(new Date(), "yyyy-MM-dd")}.json`);
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async (table: string) => {
    setExporting(true);
    try {
      const data = await exportAllData();
      const tableData = data[table as keyof typeof data];
      if (Array.isArray(tableData)) {
        downloadAsCSV(tableData, `bts-${table}-${format(new Date(), "yyyy-MM-dd")}.csv`);
        toast.success(`${table} exported`);
      }
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const healthScore = integrity
    ? Math.max(0, 100 - (integrity.criticalCount * 20 + integrity.warningCount * 5))
    : 0;

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Data Health Score
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", isRefetching && "animate-spin")} />
              Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-16" />
          ) : integrity ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Health</span>
                    <span
                      className={cn(
                        "font-medium",
                        healthScore >= 80 ? "text-emerald-500" :
                        healthScore >= 50 ? "text-amber-500" : "text-destructive"
                      )}
                    >
                      {healthScore}%
                    </span>
                  </div>
                  <Progress
                    value={healthScore}
                    className={cn(
                      "h-3",
                      healthScore >= 80 ? "[&>div]:bg-emerald-500" :
                      healthScore >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-destructive"
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <IssueBadge severity="critical" count={integrity.criticalCount} />
                  <IssueBadge severity="warning" count={integrity.warningCount} />
                  <IssueBadge severity="info" count={integrity.infoCount} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Last checked: {format(new Date(integrity.lastChecked), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to check data integrity</p>
          )}
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Data Issues ({integrity?.totalIssues || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : integrity && integrity.issues.length > 0 ? (
            <Accordion type="multiple" className="space-y-2">
              {integrity.issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </Accordion>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-medium text-emerald-600">All checks passed!</p>
              <p className="text-sm text-muted-foreground">No data integrity issues detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Data Export & Portability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Export all data in portable formats for backup or migration to other systems like Notion.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Full Export */}
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Full Database Export</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Complete JSON export with all tables, relationships, and metadata.
              </p>
              <Button
                onClick={handleExportJSON}
                disabled={exporting}
                className="w-full"
              >
                {exporting ? "Exporting..." : "Export as JSON"}
              </Button>
            </div>

            {/* Individual Tables */}
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <h4 className="font-medium">Individual CSV Exports</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Export specific tables as CSV for spreadsheet compatibility.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("participants")}
                  disabled={exporting}
                >
                  Participants
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("attendance")}
                  disabled={exporting}
                >
                  Attendance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("projects")}
                  disabled={exporting}
                >
                  Projects
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("emails")}
                  disabled={exporting}
                >
                  Emails
                </Button>
              </div>
            </div>
          </div>

          {/* Schema Info */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <h5 className="text-sm font-medium mb-2">Data Model for Portability</h5>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="font-medium">participants</p>
                <p className="text-muted-foreground">Unique individuals (stable IDs)</p>
              </div>
              <div>
                <p className="font-medium">participant_emails</p>
                <p className="text-muted-foreground">Multiple emails per person</p>
              </div>
              <div>
                <p className="font-medium">event_attendance</p>
                <p className="text-muted-foreground">Event ↔ Participant links</p>
              </div>
              <div>
                <p className="font-medium">project_archives</p>
                <p className="text-muted-foreground">Preserved project work</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone: Wipe All Data */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete all contact and attendee data from every CRM table. Project archives will NOT be affected. 
            <strong> Make sure you export a backup first!</strong>
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={wiping}>
                <Trash2 className="h-4 w-4 mr-2" />
                {wiping ? "Wiping..." : "Wipe All CRM Data"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete ALL data from: contacts, contact_tags, contact_notes, 
                  contact_overrides, participants, participant_emails, event_attendance, and merge_history.
                  <br /><br />
                  <strong>Project archives will NOT be deleted.</strong>
                  <br /><br />
                  This action cannot be undone. Make sure you've exported a backup first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleWipeAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Wipe Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

function IssueBadge({ severity, count }: { severity: IssueSeverity; count: number }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;
  
  if (count === 0) return null;
  
  return (
    <Badge variant="outline" className={cn("gap-1", config.bg, config.color)}>
      <Icon className="h-3 w-3" />
      {count}
    </Badge>
  );
}

function IssueCard({ issue }: { issue: DataIntegrityIssue }) {
  const config = SEVERITY_CONFIG[issue.severity];
  const Icon = config.icon;
  const CategoryIcon = CATEGORY_ICONS[issue.category] || Database;

  return (
    <AccordionItem value={issue.id} className="border rounded-lg px-3">
      <AccordionTrigger className="py-3 hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          <div className={cn("p-1.5 rounded", config.bg)}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{issue.title}</span>
              <Badge variant="outline" className="text-[10px]">
                {issue.count}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {issue.description}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        <div className="pl-10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CategoryIcon className="h-3 w-3" />
            <span className="capitalize">{issue.category.replace("_", " ")}</span>
          </div>
          {issue.affectedIds && issue.affectedIds.length > 0 && (
            <p className="text-xs">
              Affected records: {issue.affectedIds.length > 5 
                ? `${issue.affectedIds.slice(0, 5).join(", ")}... and ${issue.affectedIds.length - 5} more`
                : issue.affectedIds.join(", ")
              }
            </p>
          )}
          {issue.actionLabel && (
            <Button variant="outline" size="sm" asChild>
              <a href={issue.actionRoute}>{issue.actionLabel}</a>
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
