import { useState } from "react";
import {
  useProjectArchives,
  useArchiveSummary,
  useImportProjectsToArchive,
  useFlagWinner,
  useMarkAtRisk,
  useArchiveProject,
  ProjectArchive,
  ProjectStatus,
} from "@/hooks/useProjectArchives";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountUp } from "@/components/ui/count-up";
import {
  FolderArchive,
  Trophy,
  AlertTriangle,
  Archive,
  Upload,
  ExternalLink,
  MoreVertical,
  Search,
  Filter,
  X,
  Download,
  CheckCircle,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: typeof Archive }> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle },
  at_risk: { label: "At Risk", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: AlertTriangle },
  archived: { label: "Archived", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Archive },
  deleted: { label: "Deleted", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: X },
};

export function ProjectArchiveDashboard() {
  const [filters, setFilters] = useState<{
    status?: ProjectStatus;
    eventName?: string;
    isWinner?: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: archives, isLoading } = useProjectArchives(filters);
  const { summary } = useArchiveSummary();
  const { projects: csvProjects, loading: csvLoading } = useProjects();
  const importMutation = useImportProjectsToArchive();

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };
  const hasFilters = Object.values(filters).some((v) => v !== undefined) || searchQuery;

  // Filter by search
  const filteredArchives = archives?.filter((a) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.project_name.toLowerCase().includes(query) ||
      a.team_rep_name.toLowerCase().includes(query) ||
      a.event_name.toLowerCase().includes(query)
    );
  });

  const uniqueEvents = [...new Set(archives?.map((a) => a.event_name) || [])];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            icon={<FolderArchive className="h-5 w-5 text-primary" />}
            value={summary.total}
            label="Total Projects"
            bgColor="bg-primary/10"
          />
          <SummaryCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
            value={summary.active}
            label="Active"
            bgColor="bg-emerald-500/10"
          />
          <SummaryCard
            icon={<Trophy className="h-5 w-5 text-gold" />}
            value={summary.winners}
            label="Winners"
            bgColor="bg-gold/10"
          />
          <SummaryCard
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            value={summary.atRisk}
            label="At Risk"
            bgColor="bg-amber-500/10"
          />
          <SummaryCard
            icon={<Archive className="h-5 w-5 text-blue-500" />}
            value={summary.archived}
            label="Archived"
            bgColor="bg-blue-500/10"
          />
        </div>
      )}

      {/* Import Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Import Projects
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {csvProjects.length} in CSV
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              Import projects from CSV files to the permanent archive. Existing projects will be updated.
            </p>
            <Button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || csvLoading || csvProjects.length === 0}
            >
              {importMutation.isPending ? "Importing..." : "Import All Projects"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filter Projects
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Project name, team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, status: v === "all" ? undefined : (v as ProjectStatus) })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Event</Label>
              <Select
                value={filters.eventName || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, eventName: v === "all" ? undefined : v })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEvents.map((event) => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Winners Only</Label>
              <Select
                value={filters.isWinner === undefined ? "all" : filters.isWinner ? "yes" : "no"}
                onValueChange={(v) =>
                  setFilters({
                    ...filters,
                    isWinner: v === "all" ? undefined : v === "yes",
                  })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="yes">Winners Only</SelectItem>
                  <SelectItem value="no">Non-Winners</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Archived Projects
            <Badge variant="outline">{filteredArchives?.length || 0} projects</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredArchives && filteredArchives.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredArchives.map((project) => (
                <ProjectArchiveRow key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FolderArchive className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No archived projects found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Import projects from CSV to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  bgColor,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bgColor: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold">
              <CountUp end={value} duration={600} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
          <div className={cn("p-2 rounded-lg", bgColor)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectArchiveRow({ project }: { project: ProjectArchive }) {
  const flagWinner = useFlagWinner();
  const markAtRisk = useMarkAtRisk();
  const archiveProject = useArchiveProject();
  const [atRiskDialogOpen, setAtRiskDialogOpen] = useState(false);
  const [atRiskReason, setAtRiskReason] = useState("");

  const statusConfig = STATUS_CONFIG[project.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium truncate">{project.project_name}</h4>
            {project.is_winner && (
              <Badge className="bg-gold/10 text-gold border-gold/30 gap-1">
                <Trophy className="h-3 w-3" />
                Winner
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-[10px]", statusConfig.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{project.event_name}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.team_rep_name}
              {project.team_members.length > 0 && ` +${project.team_members.length}`}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(project.submitted_at).toLocaleDateString()}
            </span>
            {project.project_links.length > 0 && (
              <span className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {project.project_links.length} link(s)
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {project.project_links.length > 0 && (
              <DropdownMenuItem asChild>
                <a
                  href={project.project_links[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Project
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => flagWinner.mutate({
                id: project.id,
                isWinner: !project.is_winner,
              })}
            >
              <Trophy className="h-4 w-4 mr-2" />
              {project.is_winner ? "Remove Winner Flag" : "Flag as Winner"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAtRiskDialogOpen(true)}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark as At-Risk
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => archiveProject.mutate({ id: project.id })}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* At-Risk Dialog */}
      <Dialog open={atRiskDialogOpen} onOpenChange={setAtRiskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Project as At-Risk</DialogTitle>
            <DialogDescription>
              Flag this project as at-risk of deletion due to account inactivity or other reasons.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                placeholder="e.g., Account inactive for 60+ days"
                value={atRiskReason}
                onChange={(e) => setAtRiskReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAtRiskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                markAtRisk.mutate({ id: project.id, reason: atRiskReason });
                setAtRiskDialogOpen(false);
                setAtRiskReason("");
              }}
            >
              Mark as At-Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
