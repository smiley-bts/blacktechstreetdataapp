import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "./useProjects";
import { toast } from "sonner";

export type ProjectStatus = "active" | "at_risk" | "archived" | "deleted";

export interface ProjectArchive {
  id: string;
  original_submission_id: string;
  submitted_at: string;
  event_name: string;
  event_date: string;
  team_rep_name: string;
  team_rep_email: string | null;
  team_members: string[];
  project_name: string;
  description: string | null;
  lovable_project_url: string | null;
  project_links: string[];
  file_urls: string[];
  status: ProjectStatus;
  is_winner: boolean;
  winner_category: string | null;
  snapshot_url: string | null;
  snapshot_taken_at: string | null;
  last_activity_at: string | null;
  at_risk_since: string | null;
  at_risk_reason: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ArchiveSummary {
  total: number;
  active: number;
  atRisk: number;
  archived: number;
  winners: number;
  byEvent: { event: string; count: number; winners: number }[];
}

// Hook for fetching archived projects
export function useProjectArchives(filters?: {
  status?: ProjectStatus;
  eventName?: string;
  isWinner?: boolean;
}) {
  return useQuery({
    queryKey: ["project-archives", filters],
    queryFn: async () => {
      let query = supabase
        .from("project_archives")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.eventName) {
        query = query.eq("event_name", filters.eventName);
      }
      if (filters?.isWinner !== undefined) {
        query = query.eq("is_winner", filters.isWinner);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ProjectArchive[];
    },
  });
}

// Hook for archive summary
export function useArchiveSummary() {
  const { data: archives, isLoading } = useProjectArchives();

  const summary: ArchiveSummary = {
    total: archives?.length || 0,
    active: archives?.filter((a) => a.status === "active").length || 0,
    atRisk: archives?.filter((a) => a.status === "at_risk").length || 0,
    archived: archives?.filter((a) => a.status === "archived").length || 0,
    winners: archives?.filter((a) => a.is_winner).length || 0,
    byEvent: [],
  };

  // Group by event
  const eventMap = new Map<string, { count: number; winners: number }>();
  archives?.forEach((a) => {
    const current = eventMap.get(a.event_name) || { count: 0, winners: 0 };
    current.count += 1;
    if (a.is_winner) current.winners += 1;
    eventMap.set(a.event_name, current);
  });

  summary.byEvent = Array.from(eventMap.entries())
    .map(([event, data]) => ({ event, ...data }))
    .sort((a, b) => b.count - a.count);

  return { summary, isLoading };
}

// Hook for importing projects from CSV to archive
export function useImportProjectsToArchive() {
  const queryClient = useQueryClient();
  const { projects } = useProjects();

  return useMutation({
    mutationFn: async () => {
      if (projects.length === 0) {
        throw new Error("No projects to import");
      }

      // Transform CSV projects to archive format
      const archiveRecords = projects.map((p) => ({
        original_submission_id: p.submissionId,
        submitted_at: p.submittedAt,
        event_name: p.eventName,
        event_date: p.eventDate || new Date().toISOString().split("T")[0],
        team_rep_name: p.teamRepName,
        team_rep_email: p.teamRepEmail || null,
        team_members: p.teamMembers,
        project_name: p.projectName,
        description: p.description || null,
        project_links: p.projectLinks,
        file_urls: p.fileUrls,
        status: "active" as ProjectStatus,
        is_winner: false,
        tags: [],
      }));

      // Upsert to avoid duplicates
      const { data, error } = await supabase
        .from("project_archives")
        .upsert(archiveRecords, {
          onConflict: "original_submission_id,event_name",
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-archives"] });
      toast.success(`Imported ${data?.length || 0} projects to archive`);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });
}

// Hook for updating project archive
export function useUpdateProjectArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ProjectArchive>;
    }) => {
      const { data, error } = await supabase
        .from("project_archives")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-archives"] });
      toast.success("Project updated");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
}

// Hook for flagging winners
export function useFlagWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isWinner,
      category,
    }: {
      id: string;
      isWinner: boolean;
      category?: string;
    }) => {
      const { data, error } = await supabase
        .from("project_archives")
        .update({
          is_winner: isWinner,
          winner_category: category || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-archives"] });
      toast.success(
        data.is_winner ? "Project flagged as winner!" : "Winner flag removed"
      );
    },
  });
}

// Hook for marking projects at-risk
export function useMarkAtRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason: string;
    }) => {
      const { data, error } = await supabase
        .from("project_archives")
        .update({
          status: "at_risk",
          at_risk_since: new Date().toISOString(),
          at_risk_reason: reason,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-archives"] });
      toast.warning("Project marked as at-risk");
    },
  });
}

// Hook for archiving a project (taking a snapshot)
export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      snapshotUrl,
    }: {
      id: string;
      snapshotUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("project_archives")
        .update({
          status: "archived",
          snapshot_url: snapshotUrl || null,
          snapshot_taken_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-archives"] });
      toast.success("Project archived successfully");
    },
  });
}

// Get at-risk projects (no activity in 30+ days)
export function useAtRiskProjects() {
  return useQuery({
    queryKey: ["at-risk-projects"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("project_archives")
        .select("*")
        .eq("status", "at_risk")
        .order("at_risk_since", { ascending: true });

      if (error) throw error;
      return (data || []) as ProjectArchive[];
    },
  });
}
