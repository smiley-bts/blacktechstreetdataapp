import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { EventType, classifyEventType, EVENT_TYPE_TO_GRANT_CATEGORY } from "@/types/eventTypes";

export interface DemographicFilters {
  eventType?: EventType;
  dateFrom?: string;
  dateTo?: string;
  cohortId?: string;
}

export interface DemographicField {
  field: string;
  label: string;
  required: boolean;
  grantRequired: boolean;
}

export const DEMOGRAPHIC_FIELDS: DemographicField[] = [
  { field: "age_range", label: "Age Range", required: true, grantRequired: true },
  { field: "zip_code", label: "ZIP Code", required: true, grantRequired: true },
  { field: "cohort_id", label: "Program Cohort", required: true, grantRequired: true },
  { field: "city", label: "City", required: false, grantRequired: false },
  { field: "state", label: "State", required: false, grantRequired: true },
  { field: "industry", label: "Industry", required: false, grantRequired: false },
  { field: "ai_experience_level", label: "AI Experience", required: false, grantRequired: true },
  { field: "income_range", label: "Income Range", required: false, grantRequired: true },
  { field: "education_level", label: "Education Level", required: false, grantRequired: true },
  { field: "employment_status", label: "Employment Status", required: false, grantRequired: true },
  { field: "gender", label: "Gender", required: false, grantRequired: true },
  { field: "ethnicity", label: "Ethnicity", required: false, grantRequired: true },
  { field: "veteran_status", label: "Veteran Status", required: false, grantRequired: false },
  { field: "disability_status", label: "Disability Status", required: false, grantRequired: false },
];

export interface DemographicBreakdown {
  field: string;
  label: string;
  distribution: { value: string; count: number; percentage: number }[];
  completeness: number;
  total: number;
  missing: number;
}

export interface DemographicSummary {
  totalAttendees: number;
  attendeesWithCompleteData: number;
  overallCompleteness: number;
  fieldCompleteness: Record<string, number>;
  breakdowns: DemographicBreakdown[];
  grantReadiness: number; // % of grant-required fields complete
  missingFields: { field: string; label: string; missingCount: number }[];
}

export function useDemographics(filters?: DemographicFilters) {
  // Fetch participants who have actually attended events
  const attendeesQuery = useQuery({
    queryKey: ["demographic-attendees", filters],
    queryFn: async () => {
      // First get attendance records
      let attendanceQuery = supabase
        .from("event_attendance")
        .select("participant_id, event_name, event_date, event_type, confirmed_attended")
        .eq("confirmed_attended", true);

      if (filters?.eventType) {
        attendanceQuery = attendanceQuery.eq("event_type", filters.eventType);
      }
      if (filters?.dateFrom) {
        attendanceQuery = attendanceQuery.gte("event_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        attendanceQuery = attendanceQuery.lte("event_date", filters.dateTo);
      }

      const { data: attendance, error: attendanceError } = await attendanceQuery;
      if (attendanceError) throw attendanceError;

      // Get unique participant IDs who actually attended
      const participantIds = [...new Set(attendance?.map(a => a.participant_id) || [])];
      
      if (participantIds.length === 0) {
        return { participants: [], attendance: [] };
      }

      // Fetch participant details
      let participantsQuery = supabase
        .from("participants")
        .select("*")
        .in("id", participantIds);

      if (filters?.cohortId) {
        participantsQuery = participantsQuery.eq("cohort_id", filters.cohortId);
      }

      const { data: participants, error: participantsError } = await participantsQuery;
      if (participantsError) throw participantsError;

      return { participants: participants || [], attendance: attendance || [] };
    },
  });

  const summary = useMemo((): DemographicSummary => {
    const participants = attendeesQuery.data?.participants || [];
    const totalAttendees = participants.length;

    if (totalAttendees === 0) {
      return {
        totalAttendees: 0,
        attendeesWithCompleteData: 0,
        overallCompleteness: 0,
        fieldCompleteness: {},
        breakdowns: [],
        grantReadiness: 0,
        missingFields: [],
      };
    }

    // Calculate field completeness
    const fieldCompleteness: Record<string, number> = {};
    const breakdowns: DemographicBreakdown[] = [];
    const missingFields: { field: string; label: string; missingCount: number }[] = [];

    DEMOGRAPHIC_FIELDS.forEach(({ field, label, grantRequired }) => {
      const distribution = new Map<string, number>();
      let filled = 0;

      participants.forEach((p: any) => {
        const value = p[field];
        if (value !== null && value !== undefined && value !== "") {
          filled++;
          const displayValue = typeof value === "boolean" 
            ? (value ? "Yes" : "No") 
            : String(value);
          distribution.set(displayValue, (distribution.get(displayValue) || 0) + 1);
        }
      });

      const completeness = Math.round((filled / totalAttendees) * 100);
      fieldCompleteness[field] = completeness;

      // Track missing fields
      const missing = totalAttendees - filled;
      if (missing > 0) {
        missingFields.push({ field, label, missingCount: missing });
      }

      // Build distribution array
      const distributionArray = Array.from(distribution.entries())
        .map(([value, count]) => ({
          value,
          count,
          percentage: Math.round((count / totalAttendees) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      breakdowns.push({
        field,
        label,
        distribution: distributionArray,
        completeness,
        total: totalAttendees,
        missing,
      });
    });

    // Calculate overall completeness (required fields only)
    const requiredFields = DEMOGRAPHIC_FIELDS.filter(f => f.required);
    const overallCompleteness = requiredFields.length > 0
      ? Math.round(
          requiredFields.reduce((sum, f) => sum + (fieldCompleteness[f.field] || 0), 0) / 
          requiredFields.length
        )
      : 0;

    // Calculate grant readiness (grant-required fields)
    const grantFields = DEMOGRAPHIC_FIELDS.filter(f => f.grantRequired);
    const grantReadiness = grantFields.length > 0
      ? Math.round(
          grantFields.reduce((sum, f) => sum + (fieldCompleteness[f.field] || 0), 0) / 
          grantFields.length
        )
      : 0;

    // Count attendees with complete required data
    const attendeesWithCompleteData = participants.filter((p: any) => {
      return requiredFields.every(f => {
        const value = p[f.field];
        return value !== null && value !== undefined && value !== "";
      });
    }).length;

    // Sort missing fields by count
    missingFields.sort((a, b) => b.missingCount - a.missingCount);

    return {
      totalAttendees,
      attendeesWithCompleteData,
      overallCompleteness,
      fieldCompleteness,
      breakdowns,
      grantReadiness,
      missingFields,
    };
  }, [attendeesQuery.data]);

  return {
    summary,
    participants: attendeesQuery.data?.participants || [],
    isLoading: attendeesQuery.isLoading,
    error: attendeesQuery.error,
    refetch: attendeesQuery.refetch,
  };
}

// Get unique cohorts for filtering
export function useCohorts() {
  return useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("cohort_id, cohort_start_date")
        .not("cohort_id", "is", null)
        .order("cohort_start_date", { ascending: false });

      if (error) throw error;

      // Get unique cohorts
      const cohortMap = new Map<string, string>();
      data?.forEach(p => {
        if (p.cohort_id && !cohortMap.has(p.cohort_id)) {
          cohortMap.set(p.cohort_id, p.cohort_start_date || "");
        }
      });

      return Array.from(cohortMap.entries()).map(([id, startDate]) => ({
        id,
        startDate,
      }));
    },
  });
}
