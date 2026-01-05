import { useState, useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Folder, 
  Link2, 
  FileText, 
  Users, 
  Calendar,
  ExternalLink,
  Search,
  ChevronRight,
  Briefcase,
  Globe,
  Download,
  Image as ImageIcon
} from "lucide-react";
import { Project } from "@/types/project";
import { Contact } from "@/types/contact";
import { getLocalFilesForProject, LocalProjectFile, isImageFile, getProjectFileUrl } from "@/lib/projectFiles";

interface ProjectsDashboardProps {
  contacts: Contact[];
  onContactClick?: (email: string) => void;
}

export function ProjectsDashboard({ contacts, onContactClick }: ProjectsDashboardProps) {
  const { projects, uniqueEvents, summary, loading, error } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = searchQuery === "" || 
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.teamRepName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.teamMembers.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEvent = eventFilter === "all" || project.eventName === eventFilter;

      return matchesSearch && matchesEvent;
    });
    
    // Sort by event name by default
    return filtered.sort((a, b) => a.eventName.localeCompare(b.eventName));
  }, [projects, searchQuery, eventFilter]);

  const findContactByEmail = (email: string) => {
    return contacts.find(c => c.email?.toLowerCase() === email?.toLowerCase());
  };

  const findContactByName = (name: string) => {
    const nameLower = name.toLowerCase().trim();
    return contacts.find(c => {
      const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase().trim();
      return fullName === nameLower || 
        c.firstName?.toLowerCase() === nameLower ||
        c.lastName?.toLowerCase() === nameLower;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error loading projects: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg hover:-translate-y-1 card-shine">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg transition-transform duration-300 group-hover:scale-110">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalProjects}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg hover:-translate-y-1 card-shine">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalTeamMembers}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:shadow-lg hover:-translate-y-1 card-shine">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Globe className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.projectsWithLinks}</p>
                <p className="text-xs text-muted-foreground">Live Demos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:shadow-lg hover:-translate-y-1 card-shine">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.eventsCount}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Tabs */}
      <Tabs value={eventFilter} onValueChange={setEventFilter} className="w-full">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="all" className="text-sm">
            All Events ({projects.length})
          </TabsTrigger>
          {uniqueEvents.map(event => {
            const count = projects.filter(p => p.eventName === event).length;
            return (
              <TabsTrigger key={event} value={event} className="text-sm">
                {event} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects, teams, or members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project, index) => (
          <div 
            key={project.id}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
          >
            <ProjectCard 
              project={project}
              onSelect={() => setSelectedProject(project)}
            />
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No projects found matching your criteria
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          findContactByEmail={findContactByEmail}
          findContactByName={findContactByName}
          onContactClick={onContactClick}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onSelect }: { project: Project; onSelect: () => void }) {
  return (
    <Card 
      className="hover:shadow-lg hover:-translate-y-1 cursor-pointer group border-border/50 hover:border-primary/30 card-shine"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
            {project.projectName}
          </CardTitle>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
        <Badge variant="outline" className="w-fit text-xs">
          {project.eventName}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{project.teamMembers.length + 1} members</span>
          {project.projectLinks.length > 0 && (
            <>
              <span className="text-border">•</span>
              <Link2 className="h-3 w-3" />
              <span>{project.projectLinks.length} links</span>
            </>
          )}
          {project.fileUrls.length > 0 && (
            <>
              <span className="text-border">•</span>
              <FileText className="h-3 w-3" />
              <span>{project.fileUrls.length} files</span>
            </>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Team Lead:</span> {project.teamRepName}
        </div>
      </CardContent>
    </Card>
  );
}

function LocalFilePreview({ file }: { file: LocalProjectFile }) {
  const [showPreview, setShowPreview] = useState(false);
  
  // Get the actual URL (handles both local and cloud storage)
  const fileUrl = getProjectFileUrl(file);
  
  const isImage = isImageFile(file.path);
  const isPdf = file.type === 'pdf';
  const isPptx = file.type === 'pptx';
  const isDocx = file.type === 'docx';
  const canPreview = isImage || isPdf || isPptx || isDocx;
  
  // Get full URL for Google Docs viewer (works better with dev environments)
  const getGoogleViewerUrl = () => {
    // For cloud storage, use the direct URL; for local, construct full URL
    const fullUrl = file.isCloudStorage ? fileUrl : `${window.location.origin}${file.path}`;
    return `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  };

  const getIcon = () => {
    switch (file.type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'pptx': return <FileText className="h-4 w-4 text-orange-500" />;
      case 'docx': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-emerald-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = () => {
    switch (file.type) {
      case 'pdf': return 'PDF';
      case 'pptx': return 'PowerPoint';
      case 'docx': return 'Word';
      case 'image': return 'Image';
      default: return 'File';
    }
  };

  // For download, use the resolved file URL
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.path.split('/').pop() || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium block truncate">{file.label}</span>
          <span className="text-xs text-muted-foreground">{getTypeLabel()}</span>
        </div>
        <div className="flex items-center gap-1">
          {canPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs h-8"
            >
              {showPreview ? "Hide" : "Preview"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={downloadFile}
            title="Download"
          >
            <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Button>
        </div>
      </div>
      
      {/* Image Preview */}
      {isImage && showPreview && (
        <div className="rounded-lg overflow-hidden border bg-background">
          <img 
            src={fileUrl} 
            alt={file.label}
            className="w-full h-auto max-h-[400px] object-contain"
          />
        </div>
      )}

      {/* PDF Preview */}
      {isPdf && showPreview && (
        <div className="rounded-lg overflow-hidden border bg-background">
          <iframe
            src={fileUrl}
            title={file.label}
            className="w-full h-[500px] border-0"
          />
        </div>
      )}

      {/* PowerPoint/Word Preview via Google Docs Viewer */}
      {(isPptx || isDocx) && showPreview && (
        <div className="space-y-2">
          <div className="rounded-lg overflow-hidden border bg-background">
            <iframe
              src={getGoogleViewerUrl()}
              title={file.label}
              className="w-full h-[500px] border-0"
              allowFullScreen
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            If preview doesn't load, <a href={fileUrl} download className="text-primary hover:underline">download the file</a> to view locally.
          </p>
        </div>
      )}
    </div>
  );
}

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  findContactByEmail: (email: string) => Contact | undefined;
  findContactByName: (name: string) => Contact | undefined;
  onContactClick?: (email: string) => void;
}

function ProjectDetailModal({ 
  project, 
  onClose, 
  findContactByEmail, 
  findContactByName,
  onContactClick 
}: ProjectDetailModalProps) {
  const teamRepContact = findContactByEmail(project.teamRepEmail);

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">{project.projectName}</CardTitle>
              <Badge variant="outline">{project.eventName}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <div className="flex-1 overflow-y-auto">
          <CardContent className="pt-6 space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Description
              </h4>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>

            {/* Team */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </h4>
              <div className="space-y-2">
                {/* Team Lead */}
                <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                  <div>
                    <span className="font-medium">{project.teamRepName}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">Lead</Badge>
                  </div>
                  {teamRepContact && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onContactClick?.(project.teamRepEmail)}
                      className="text-xs"
                    >
                      View Contact
                    </Button>
                  )}
                </div>

                {/* Other Members */}
                {project.teamMembers.map((member, i) => {
                  const memberContact = findContactByName(member);
                  return (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                      <span className="text-sm">{member}</span>
                      {memberContact && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onContactClick?.(memberContact.email)}
                          className="text-xs"
                        >
                          View Contact
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Links */}
            {project.projectLinks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Project Links
                </h4>
                <div className="space-y-2">
                  {project.projectLinks.map((link, i) => {
                    const isLovable = link.includes("lovable.app");
                    const isGamma = link.includes("gamma.app");
                    const isCanva = link.includes("canva.com");
                    
                    let label = "Link";
                    if (isLovable) label = "Lovable App";
                    else if (isGamma) label = "Gamma Presentation";
                    else if (isCanva) label = "Canva Design";

                    return (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm truncate">{label}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Local Files (hosted on Lovable) */}
            {(() => {
              const localFiles = getLocalFilesForProject(project.projectName);
              if (localFiles.length === 0) return null;
              
              return (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Files
                  </h4>
                  <div className="space-y-3">
                    {localFiles.map((file, i) => (
                      <LocalFilePreview key={i} file={file} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* External Files (Tally links - fallback) */}
            {(() => {
              const localFiles = getLocalFilesForProject(project.projectName);
              if (localFiles.length > 0 || project.fileUrls.length === 0) return null;
              
              return (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Files (External)
                  </h4>
                  <div className="space-y-2">
                    {project.fileUrls.map((url, i) => {
                      const isPdf = url.includes(".pdf");
                      const isImage = url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png");
                      const isPptx = url.includes(".pptx");
                      const isDocx = url.includes(".docx");

                      let label = "File";
                      if (isPdf) label = "PDF Document";
                      else if (isImage) label = "Image";
                      else if (isPptx) label = "PowerPoint";
                      else if (isDocx) label = "Word Document";

                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm">{label}</span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Metadata */}
            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>Submitted: {new Date(project.submittedAt).toLocaleString()}</p>
              <p>Contact: {project.teamRepEmail}</p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
