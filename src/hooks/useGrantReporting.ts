import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSurveyMetrics } from "./useSurveyMetrics";
import { useDemographics } from "./useDemographics";
import { useArchiveSummary } from "./useProjectArchives";
import { EventType, EVENT_TYPE_LABELS } from "@/types/eventTypes";

export interface DateRange {
  from: string;
  to: string;
}

export interface EngagementDepth {
  tier: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AttendanceByProgram {
  programType: string;
  label: string;
  uniqueAttendees: number;
  totalAttendances: number;
  events: number;
}

export interface GrantReportData {
  // Time period
  dateRange: DateRange;
  
  // Unique attendees
  totalUniqueAttendees: number;
  
  // Attendance by program
  attendanceByProgram: AttendanceByProgram[];
  
  // Engagement depth
  engagementDepth: EngagementDepth[];
  
  // Demographics
  demographics: {
    totalWithData: number;
    completeness: number;
    ageBreakdown: { value: string; count: number; percentage: number }[];
    locationBreakdown: { value: string; count: number; percentage: number }[];
    grantReadiness: number;
  };
  
  // Survey metrics
  surveys: {
    totalResponses: number;
    npsScore: number;
    weightedNpsScore: number;
    confidenceGain: number;
    completionRate: number;
  };
  
  // Projects
  projects: {
    total: number;
    winners: number;
    atRisk: number;
    archived: number;
  };
  
  // Metadata
  generatedAt: string;
  dataAsOf: string;
}

export function useGrantReporting(dateRange?: DateRange) {
  // Default to last 12 months if no range specified
  const defaultRange: DateRange = {
    from: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  };
  const range = dateRange || defaultRange;

  // Fetch attendance data
  const attendanceQuery = useQuery({
    queryKey: ["grant-attendance", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendance")
        .select("participant_id, event_name, event_date, event_type, confirmed_attended")
        .gte("event_date", range.from)
        .lte("event_date", range.to)
        .eq("confirmed_attended", true);

      if (error) throw error;
      return data || [];
    },
  });

  // Get survey metrics
  const { metrics: surveyMetrics, isLoading: surveyLoading } = useSurveyMetrics();

  // Get demographics
  const { summary: demoSummary, isLoading: demoLoading } = useDemographics({
    dateFrom: range.from,
    dateTo: range.to,
  });

  // Get project archive summary
  const { summary: projectSummary, isLoading: projectLoading } = useArchiveSummary();

  // Build report data
  const reportQuery = useQuery({
    queryKey: ["grant-report", range, attendanceQuery.data?.length],
    queryFn: async (): Promise<GrantReportData> => {
      const attendance = attendanceQuery.data || [];

      // Calculate unique attendees
      const uniqueParticipants = new Set(attendance.map((a) => a.participant_id));
      const totalUniqueAttendees = uniqueParticipants.size;

      // Attendance by program type
      const programMap = new Map<string, { participants: Set<string>; total: number; events: Set<string> }>();
      attendance.forEach((a) => {
        const type = a.event_type || "unknown";
        const current = programMap.get(type) || {
          participants: new Set(),
          total: 0,
          events: new Set(),
        };
        current.participants.add(a.participant_id);
        current.total += 1;
        current.events.add(a.event_name);
        programMap.set(type, current);
      });

      const attendanceByProgram: AttendanceByProgram[] = Array.from(programMap.entries())
        .map(([type, data]) => ({
          programType: type,
          label: EVENT_TYPE_LABELS[type as EventType] || type,
          uniqueAttendees: data.participants.size,
          totalAttendances: data.total,
          events: data.events.size,
        }))
        .sort((a, b) => b.uniqueAttendees - a.uniqueAttendees);

      // Engagement depth (events per participant)
      const participantEventCount = new Map<string, number>();
      attendance.forEach((a) => {
        const count = participantEventCount.get(a.participant_id) || 0;
        participantEventCount.set(a.participant_id, count + 1);
      });

      const depthCounts = { one: 0, twoThree: 0, fourPlus: 0 };
      participantEventCount.forEach((count) => {
        if (count === 1) depthCounts.one += 1;
        else if (count <= 3) depthCounts.twoThree += 1;
        else depthCounts.fourPlus += 1;
      });

      const totalParticipants = participantEventCount.size;
      const engagementDepth: EngagementDepth[] = [
        {
          tier: "single",
          label: "1 Event",
          count: depthCounts.one,
          percentage: totalParticipants > 0 ? Math.round((depthCounts.one / totalParticipants) * 100) : 0,
        },
        {
          tier: "moderate",
          label: "2-3 Events",
          count: depthCounts.twoThree,
          percentage: totalParticipants > 0 ? Math.round((depthCounts.twoThree / totalParticipants) * 100) : 0,
        },
        {
          tier: "high",
          label: "4+ Events",
          count: depthCounts.fourPlus,
          percentage: totalParticipants > 0 ? Math.round((depthCounts.fourPlus / totalParticipants) * 100) : 0,
        },
      ];

      // Get age and location breakdowns from demographics
      const ageBreakdown = demoSummary.breakdowns.find((b) => b.field === "age_range");
      const locationBreakdown = demoSummary.breakdowns.find((b) => b.field === "state");

      return {
        dateRange: range,
        totalUniqueAttendees,
        attendanceByProgram,
        engagementDepth,
        demographics: {
          totalWithData: demoSummary.totalAttendees,
          completeness: demoSummary.overallCompleteness,
          ageBreakdown: ageBreakdown?.distribution || [],
          locationBreakdown: locationBreakdown?.distribution || [],
          grantReadiness: demoSummary.grantReadiness,
        },
        surveys: {
          totalResponses: surveyMetrics.totalResponses,
          npsScore: surveyMetrics.npsScore,
          weightedNpsScore: surveyMetrics.weightedNpsScore,
          confidenceGain: surveyMetrics.confidenceGain,
          completionRate: surveyMetrics.surveyCompletionRate,
        },
        projects: {
          total: projectSummary.total,
          winners: projectSummary.winners,
          atRisk: projectSummary.atRisk,
          archived: projectSummary.archived,
        },
        generatedAt: new Date().toISOString(),
        dataAsOf: new Date().toISOString(),
      };
    },
    enabled: !attendanceQuery.isLoading && !surveyLoading && !demoLoading && !projectLoading,
  });

  return {
    report: reportQuery.data,
    isLoading: attendanceQuery.isLoading || surveyLoading || demoLoading || projectLoading || reportQuery.isLoading,
    error: attendanceQuery.error || reportQuery.error,
    refetch: reportQuery.refetch,
  };
}

// Export report data as JSON
export function exportReportAsJSON(report: GrantReportData): string {
  return JSON.stringify(report, null, 2);
}

// Export report data as CSV (flattened)
export function exportReportAsCSV(report: GrantReportData): string {
  const rows: string[] = [];
  
  // Header section
  rows.push("GRANT REPORT SUMMARY");
  rows.push(`Date Range,${report.dateRange.from} to ${report.dateRange.to}`);
  rows.push(`Generated At,${report.generatedAt}`);
  rows.push("");
  
  // Unique attendees
  rows.push("ATTENDANCE METRICS");
  rows.push(`Total Unique Attendees,${report.totalUniqueAttendees}`);
  rows.push("");
  
  // By program
  rows.push("ATTENDANCE BY PROGRAM TYPE");
  rows.push("Program Type,Unique Attendees,Total Attendances,Events");
  report.attendanceByProgram.forEach((p) => {
    rows.push(`${p.label},${p.uniqueAttendees},${p.totalAttendances},${p.events}`);
  });
  rows.push("");
  
  // Engagement depth
  rows.push("ENGAGEMENT DEPTH");
  rows.push("Level,Count,Percentage");
  report.engagementDepth.forEach((e) => {
    rows.push(`${e.label},${e.count},${e.percentage}%`);
  });
  rows.push("");
  
  // Demographics
  rows.push("DEMOGRAPHICS");
  rows.push(`Total with Data,${report.demographics.totalWithData}`);
  rows.push(`Data Completeness,${report.demographics.completeness}%`);
  rows.push(`Grant Readiness,${report.demographics.grantReadiness}%`);
  rows.push("");
  
  // Survey metrics
  rows.push("SURVEY METRICS");
  rows.push(`Total Responses,${report.surveys.totalResponses}`);
  rows.push(`NPS Score,${report.surveys.npsScore}`);
  rows.push(`Weighted NPS,${report.surveys.weightedNpsScore}`);
  rows.push(`Confidence Gain,${report.surveys.confidenceGain}`);
  rows.push(`Completion Rate,${report.surveys.completionRate}%`);
  rows.push("");
  
  // Projects
  rows.push("PROJECTS");
  rows.push(`Total Projects,${report.projects.total}`);
  rows.push(`Winners,${report.projects.winners}`);
  rows.push(`At Risk,${report.projects.atRisk}`);
  rows.push(`Archived,${report.projects.archived}`);
  
  return rows.join("\n");
}
