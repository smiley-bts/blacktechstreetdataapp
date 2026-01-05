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
        // Load both CSV files
        const [response1, response2] = await Promise.all([
          fetch("/aspire-build-day-projects.csv"),
          fetch("/aspire-june-2025-projects.csv")
        ]);
        
        const [text1, text2] = await Promise.all([
          response1.text(),
          response2.text()
        ]);
        
        const allProjects: Project[] = [];
        
        // Parse first CSV
        Papa.parse(text1, {
          complete: (result) => {
            const rows = result.data as string[][];
            const parsed = rows.slice(1)
              .filter(row => row[0] && row[0].trim() !== "")
              .map(parseProject);
            allProjects.push(...parsed);
          },
        });
        
        // Parse second CSV
        Papa.parse(text2, {
          complete: (result) => {
            const rows = result.data as string[][];
            const parsed = rows.slice(1)
              .filter(row => row[0] && row[0].trim() !== "")
              .map(parseProject);
            allProjects.push(...parsed);
          },
        });
        
        setProjects(allProjects);
        setLoading(false);
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
