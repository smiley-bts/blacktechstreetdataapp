import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, Users, Rocket, FileText, Globe } from "lucide-react";

interface ProjectSubmission {
  submissionId: string;
  submittedAt: string;
  teamRep: string;
  email: string;
  teammates: string;
  productName: string;
  description: string;
  uploadLink: string;
  projectLinks: string;
}

// Color palette for project avatars
const avatarColors = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
];

// Spelling corrections for project names
const nameCorrections: Record<string, string> = {
  "Echos of Truth": "Echoes of Truth",
  "YOuth Homeless Mission": "Youth Homeless Mission",
  "Life flow": "LifeFlow",
  "Rise-up Learning Hub": "Rise Up Learning Hub",
};

export default function BuildDayDashboard() {
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse("/aspire-build-day-projects.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const parsed = results.data
          .filter((row: any) => row["Submission ID"] && row["What's the Name of Your Product, Service, or Solution?"])
          .map((row: any) => ({
            submissionId: row["Submission ID"] || "",
            submittedAt: row["Submitted at"] || "",
            teamRep: row["Team Representative Name"] || "",
            email: row["Email"] || "",
            teammates: row["List the names of your teammates"] || "",
            productName: row["What's the Name of Your Product, Service, or Solution?"] || "",
            description: row["Describe Your Product, Service, or Solution in 1 sentence"] || "",
            uploadLink: row["Upload photos or files of your project below."] || "",
            projectLinks: row["Share all links associated with your project below"] || "",
          }));
        setProjects(parsed);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, []);

  const extractLinks = (linkText: string): string[] => {
    if (!linkText) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = linkText.match(urlRegex);
    return matches || [];
  };

  const getTeammateCount = (teammates: string): number => {
    if (!teammates) return 1;
    const lines = teammates.split(/[\n,]/).filter(t => t.trim().length > 0);
    return Math.max(lines.length, 1);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const cleanProductName = (name: string): string => {
    let cleaned = name.replace(/🌱/g, "").trim();
    // Check for corrections
    for (const [incorrect, correct] of Object.entries(nameCorrections)) {
      if (cleaned.toLowerCase() === incorrect.toLowerCase()) {
        return correct;
      }
    }
    return cleaned;
  };

  const getInitials = (name: string): string => {
    const cleaned = cleanProductName(name);
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(w => w[0]).join("").toUpperCase();
  };

  const getAvatarColor = (name: string): string => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  const totalProjects = projects.length;
  const totalParticipants = projects.reduce((sum, p) => sum + getTeammateCount(p.teammates), 0);
  const projectsWithWebsites = projects.filter(p => p.projectLinks.includes("lovable.app")).length;

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-3xl">{totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Rocket className="h-4 w-4" />
              <span>Submitted solutions</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Participants</CardDescription>
            <CardTitle className="text-3xl">{totalParticipants}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Team members</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Live Websites</CardDescription>
            <CardTitle className="text-3xl">{projectsWithWebsites}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Deployed on Lovable</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Projects</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const links = extractLinks(project.projectLinks);
            const websiteLink = links.find(l => l.includes("lovable.app"));
            const presentationLink = links.find(l => l.includes("gamma.app") || l.includes("canva.com") || l.includes("beautiful.ai"));
            const displayName = cleanProductName(project.productName);

            return (
              <Card key={project.submissionId} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar className={`h-12 w-12 ${getAvatarColor(displayName)} shrink-0`}>
                      <AvatarFallback className="bg-transparent text-white font-semibold text-sm">
                        {getInitials(project.productName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight">
                          {displayName}
                        </CardTitle>
                        <Badge variant="outline" className="shrink-0">
                          <Users className="h-3 w-3 mr-1" />
                          {getTeammateCount(project.teammates)}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {project.teamRep}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {websiteLink && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={websiteLink} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                    {presentationLink && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={presentationLink} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          Presentation
                        </a>
                      </Button>
                    )}
                    {project.uploadLink && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={project.uploadLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Files
                        </a>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Submitted {formatDate(project.submittedAt)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
