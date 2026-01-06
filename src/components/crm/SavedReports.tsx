import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Plus, 
  Download, 
  Trash2, 
  Calendar,
  MoreVertical,
  Play,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ContactFilter, Contact } from "@/types/contact";

export interface SavedReport {
  id: string;
  name: string;
  description: string;
  filters: ContactFilter;
  exportFields: string[];
  createdAt: string;
  lastRun?: string;
}

interface SavedReportsProps {
  contacts: Contact[];
  currentFilters: ContactFilter;
  onLoadReport: (filters: ContactFilter) => void;
}

const STORAGE_KEY = "crm-saved-reports";

const DEFAULT_REPORTS: SavedReport[] = [
  {
    id: "all-contacts",
    name: "All Contacts Export",
    description: "Complete contact list with all fields",
    filters: {
      search: "",
      lifecycleStage: [],
      aiExperienceLevel: [],
      ageRange: [],
      incomeRange: [],
      cohort: [],
      tags: [],
      eventAttendeesOnly: false,
      buildDayOnly: false,
      dec6Workshop: false,
      dec13LTF: false,
      sept27BuildDay: false,
      june2025Event: false,
      hasFeedback: false,
      hasProject: false,
    },
    exportFields: ["email", "firstName", "lastName", "phone", "city", "state"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "event-attendees",
    name: "Event Attendees",
    description: "All contacts who attended any event",
    filters: {
      search: "",
      lifecycleStage: [],
      aiExperienceLevel: [],
      ageRange: [],
      incomeRange: [],
      cohort: [],
      tags: [],
      eventAttendeesOnly: true,
      buildDayOnly: false,
      dec6Workshop: false,
      dec13LTF: false,
      sept27BuildDay: false,
      june2025Event: false,
      hasFeedback: false,
      hasProject: false,
    },
    exportFields: ["email", "firstName", "lastName", "eventsAttended"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "build-day-projects",
    name: "Build Day Projects",
    description: "Contacts with Build Day project submissions",
    filters: {
      search: "",
      lifecycleStage: [],
      aiExperienceLevel: [],
      ageRange: [],
      incomeRange: [],
      cohort: [],
      tags: [],
      eventAttendeesOnly: false,
      buildDayOnly: false,
      dec6Workshop: false,
      dec13LTF: false,
      sept27BuildDay: false,
      june2025Event: false,
      hasFeedback: false,
      hasProject: true,
    },
    exportFields: ["email", "firstName", "lastName", "teamBuildDescription", "aiToolsUsed"],
    createdAt: new Date().toISOString(),
  },
];

export function SavedReports({ contacts, currentFilters, onLoadReport }: SavedReportsProps) {
  const [reports, setReports] = useState<SavedReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return [...DEFAULT_REPORTS, ...JSON.parse(saved)];
      } catch {
        return DEFAULT_REPORTS;
      }
    }
    return DEFAULT_REPORTS;
  });
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const [newReportDescription, setNewReportDescription] = useState("");

  const saveReports = useCallback((updatedReports: SavedReport[]) => {
    const customReports = updatedReports.filter(r => !DEFAULT_REPORTS.some(d => d.id === r.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customReports));
    setReports(updatedReports);
  }, []);

  const handleCreateReport = () => {
    if (!newReportName.trim()) {
      toast({ title: "Error", description: "Please enter a report name", variant: "destructive" });
      return;
    }

    const newReport: SavedReport = {
      id: Date.now().toString(),
      name: newReportName,
      description: newReportDescription || "Custom report",
      filters: { ...currentFilters },
      exportFields: ["email", "firstName", "lastName", "phone"],
      createdAt: new Date().toISOString(),
    };

    saveReports([...reports, newReport]);
    setNewReportName("");
    setNewReportDescription("");
    setIsCreateOpen(false);
    toast({ title: "Report saved!", description: `"${newReport.name}" has been created` });
  };

  const handleRunReport = (report: SavedReport) => {
    onLoadReport(report.filters);
    
    // Update last run time
    const updated = reports.map(r => 
      r.id === report.id ? { ...r, lastRun: new Date().toISOString() } : r
    );
    saveReports(updated);
    
    toast({ title: "Report loaded", description: `Filters applied from "${report.name}"` });
  };

  const handleDeleteReport = (reportId: string) => {
    if (DEFAULT_REPORTS.some(r => r.id === reportId)) {
      toast({ title: "Cannot delete", description: "Default reports cannot be deleted", variant: "destructive" });
      return;
    }
    
    saveReports(reports.filter(r => r.id !== reportId));
    toast({ title: "Report deleted" });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Saved Reports</h3>
          <p className="text-sm text-muted-foreground">Quick access to your frequently used exports</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Save Current View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground">Report Name</label>
                <Input
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="e.g., December Workshop Attendees"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description (optional)</label>
                <Input
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                  placeholder="e.g., Attendees with feedback from Dec workshops"
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current filters will be saved with this report.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateReport}>Save Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const isDefault = DEFAULT_REPORTS.some(r => r.id === report.id);
          
          return (
            <Card 
              key={report.id} 
              className="border-border/50 hover:border-primary/30 transition-all duration-200 group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">{report.name}</CardTitle>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRunReport(report)}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Report
                      </DropdownMenuItem>
                      {!isDefault && (
                        <DropdownMenuItem 
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {report.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(report.createdAt)}</span>
                </div>
                
                {report.lastRun && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Clock className="h-3 w-3" />
                    <span>Last run {formatDate(report.lastRun)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  {isDefault && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 gap-2"
                  onClick={() => handleRunReport(report)}
                >
                  <Play className="h-3 w-3" />
                  Run Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
