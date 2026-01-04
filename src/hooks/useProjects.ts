import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { Project, parseProject, extractUniqueEvents } from "@/types/project";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch("/aspire-build-day-projects.csv");
        const text = await response.text();
        
        Papa.parse(text, {
          complete: (result) => {
            const rows = result.data as string[][];
            // Skip header row
            const parsed = rows.slice(1)
              .filter(row => row[0] && row[0].trim() !== "")
              .map(parseProject);
            setProjects(parsed);
            setLoading(false);
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const uniqueEvents = useMemo(() => extractUniqueEvents(projects), [projects]);

  const summary = {
    totalProjects: projects.length,
    totalTeamMembers: projects.reduce((sum, p) => sum + p.teamMembers.length + 1, 0), // +1 for team rep
    eventsCount: uniqueEvents.length,
    projectsWithLinks: projects.filter(p => p.projectLinks.length > 0).length,
    projectsWithFiles: projects.filter(p => p.fileUrls.length > 0).length,
  };

  return {
    projects,
    uniqueEvents,
    summary,
    loading,
    error,
  };
}
