import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEMOGRAPHIC_FIELDS } from "./useDemographics";

export type IssueSeverity = "critical" | "warning" | "info";
export type IssueCategory = "duplicates" | "attendance" | "surveys" | "demographics" | "data_quality";

export interface DataIntegrityIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  count: number;
  affectedIds?: string[];
  actionLabel?: string;
  actionRoute?: string;
}

export interface IntegritySummary {
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: DataIntegrityIssue[];
  lastChecked: string;
}

export function useDataIntegrity() {
  // NOTE: All data fetching happens inside useQuery to avoid hook ordering issues
  return useQuery({
    queryKey: ["data-integrity"],
    queryFn: async (): Promise<IntegritySummary> => {
      const issues: DataIntegrityIssue[] = [];

      // 1. Check for potential duplicates (same email across participants)
      const { data: emailCounts } = await supabase
        .from("participant_emails")
        .select("email, participant_id");

      const emailMap = new Map<string, string[]>();
      emailCounts?.forEach((e) => {
        const normalized = e.email.toLowerCase().trim();
        const existing = emailMap.get(normalized) || [];
        if (!existing.includes(e.participant_id)) {
          existing.push(e.participant_id);
        }
        emailMap.set(normalized, existing);
      });

      const duplicateEmails = Array.from(emailMap.entries())
        .filter(([_, ids]) => ids.length > 1);

      if (duplicateEmails.length > 0) {
        issues.push({
          id: "duplicate-emails",
          category: "duplicates",
          severity: "warning",
          title: "Potential Duplicate Participants",
          description: `${duplicateEmails.length} email addresses appear across multiple participant records`,
          count: duplicateEmails.length,
          affectedIds: duplicateEmails.flatMap(([_, ids]) => ids),
          actionLabel: "Review Duplicates",
          actionRoute: "/admin/crm?tab=contacts&filter=duplicates",
        });
      }

      // 2. Check for events missing attendance data
      const { data: events } = await supabase
        .from("event_attendance")
        .select("event_name, event_date, confirmed_attended")
        .order("event_date", { ascending: false });

      const eventAttendance = new Map<string, { total: number; confirmed: number }>();
      events?.forEach((e) => {
        const key = `${e.event_name}|${e.event_date}`;
        const current = eventAttendance.get(key) || { total: 0, confirmed: 0 };
        current.total += 1;
        if (e.confirmed_attended) current.confirmed += 1;
        eventAttendance.set(key, current);
      });

      const eventsNoAttendance = Array.from(eventAttendance.entries())
        .filter(([_, data]) => data.confirmed === 0);

      if (eventsNoAttendance.length > 0) {
        issues.push({
          id: "events-no-attendance",
          category: "attendance",
          severity: "critical",
          title: "Events Without Confirmed Attendance",
          description: `${eventsNoAttendance.length} events have registrations but no confirmed attendees`,
          count: eventsNoAttendance.length,
          actionLabel: "Review Events",
          actionRoute: "/admin/crm?tab=events",
        });
      }

      // 3. Check for participants without attendance records
      const { data: participantsWithoutAttendance, count: orphanCount } = await supabase
        .from("participants")
        .select("id", { count: "exact" })
        .is("is_stakeholder", false);

      const { data: attendedParticipants } = await supabase
        .from("event_attendance")
        .select("participant_id")
        .eq("confirmed_attended", true);

      const attendedSet = new Set(attendedParticipants?.map((a) => a.participant_id));
      const orphanParticipants = participantsWithoutAttendance?.filter(
        (p) => !attendedSet.has(p.id)
      );

      if (orphanParticipants && orphanParticipants.length > 0) {
        issues.push({
          id: "orphan-participants",
          category: "data_quality",
          severity: "info",
          title: "Participants Without Event Attendance",
          description: `${orphanParticipants.length} non-stakeholder participants have no confirmed event attendance`,
          count: orphanParticipants.length,
          affectedIds: orphanParticipants.map((p) => p.id),
        });
      }

      // 4. Check demographic completeness (fetch inline to avoid hook ordering issues)
      const { data: allParticipants } = await supabase
        .from("participants")
        .select("*");

      if (allParticipants && allParticipants.length > 0) {
        const grantFields = DEMOGRAPHIC_FIELDS.filter((f) => f.grantRequired);
        const totalParticipants = allParticipants.length;

        // Calculate missing counts per field
        const fieldMissingCounts: { field: string; label: string; missing: number }[] = [];
        grantFields.forEach(({ field, label }) => {
          const missing = allParticipants.filter((p: any) => {
            const val = p[field];
            return val === null || val === undefined || val === "";
          }).length;
          if (missing > 0) {
            fieldMissingCounts.push({ field, label, missing });
          }
        });

        // Check for fields with >30% missing
        const criticalGaps = fieldMissingCounts.filter(
          (f) => f.missing > totalParticipants * 0.3
        );

        if (criticalGaps.length > 0) {
          issues.push({
            id: "demographic-gaps",
            category: "demographics",
            severity: "warning",
            title: "Critical Demographic Data Gaps",
            description: `${criticalGaps.length} grant-required fields have >30% missing data`,
            count: criticalGaps.length,
            actionLabel: "View Demographics",
            actionRoute: "/admin/crm?tab=demographics",
          });
        }

        // Calculate grant readiness
        let totalFieldCompleteness = 0;
        grantFields.forEach(({ field }) => {
          const filled = allParticipants.filter((p: any) => {
            const val = p[field];
            return val !== null && val !== undefined && val !== "";
          }).length;
          totalFieldCompleteness += (filled / totalParticipants) * 100;
        });
        const grantReadiness = grantFields.length > 0 
          ? Math.round(totalFieldCompleteness / grantFields.length)
          : 0;

        // 5. Check for low grant readiness
        if (grantReadiness < 50) {
          issues.push({
            id: "low-grant-readiness",
            category: "demographics",
            severity: "critical",
            title: "Low Grant Readiness Score",
            description: `Grant readiness is only ${grantReadiness}% - many required fields are incomplete`,
            count: grantReadiness,
            actionLabel: "Improve Data",
            actionRoute: "/admin/crm?tab=demographics",
          });
        }
      }

      // 6. Check for participants with incomplete names
      const { data: incompletNames, count: incompleteNameCount } = await supabase
        .from("participants")
        .select("id", { count: "exact" })
        .or("first_name.is.null,last_name.is.null,full_name.is.null");

      if (incompleteNameCount && incompleteNameCount > 0) {
        issues.push({
          id: "incomplete-names",
          category: "data_quality",
          severity: "info",
          title: "Participants with Incomplete Names",
          description: `${incompleteNameCount} participants are missing first name, last name, or full name`,
          count: incompleteNameCount,
          affectedIds: incompletNames?.map((p) => p.id),
        });
      }

      // Sort by severity
      const severityOrder: Record<IssueSeverity, number> = { critical: 0, warning: 1, info: 2 };
      issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return {
        totalIssues: issues.length,
        criticalCount: issues.filter((i) => i.severity === "critical").length,
        warningCount: issues.filter((i) => i.severity === "warning").length,
        infoCount: issues.filter((i) => i.severity === "info").length,
        issues,
        lastChecked: new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Export utilities for data portability
export interface ExportableData {
  participants: any[];
  emails: any[];
  attendance: any[];
  projects: any[];
  mergeHistory: any[];
  contacts: any[];
  contactTags: any[];
  contactNotes: any[];
  contactOverrides: any[];
  exportedAt: string;
  version: string;
}

export async function exportAllData(): Promise<ExportableData> {
  // Fetch all tables including legacy contacts tables
  // Note: contacts may exceed 1000 rows, so we paginate
  const [participants, emails, attendance, projects, mergeHistory, contactTags, contactNotes, contactOverrides] = await Promise.all([
    supabase.from("participants").select("*"),
    supabase.from("participant_emails").select("*"),
    supabase.from("event_attendance").select("*"),
    supabase.from("project_archives").select("*"),
    supabase.from("merge_history").select("*"),
    supabase.from("contact_tags").select("*"),
    supabase.from("contact_notes").select("*"),
    supabase.from("contact_overrides").select("*"),
  ]);

  // Paginate contacts (may have 3000+ rows)
  const allContacts: any[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from("contacts").select("*").range(from, from + pageSize - 1);
    if (error || !data || data.length === 0) break;
    allContacts.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return {
    participants: participants.data || [],
    emails: emails.data || [],
    attendance: attendance.data || [],
    projects: projects.data || [],
    mergeHistory: mergeHistory.data || [],
    contacts: allContacts,
    contactTags: contactTags.data || [],
    contactNotes: contactNotes.data || [],
    contactOverrides: contactOverrides.data || [],
    exportedAt: new Date().toISOString(),
    version: "2.0",
  };
}

export function downloadAsJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      if (Array.isArray(val)) return `"${val.join("; ")}"`;
      if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadAsCSV(data: any[], filename: string) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
