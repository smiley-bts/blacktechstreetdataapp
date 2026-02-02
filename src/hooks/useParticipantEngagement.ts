import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { 
  EventType, 
  classifyEventType, 
  EVENT_TYPE_TO_GRANT_CATEGORY,
  GrantProgramCategory,
} from "@/types/eventTypes";

export interface AttendanceRecord {
  id: string;
  eventName: string;
  eventType: EventType;
  grantCategory: GrantProgramCategory;
  eventDate: string;
  dayLabel: string | null;
  confirmedAttended: boolean;
  completedSurvey: boolean;
  signedRelease: boolean;
}

export interface ParticipantEngagement {
  participantId: string;
  totalEvents: number;
  attendedEvents: number;
  surveyCount: number;
  releaseCount: number;
  
  // Engagement metrics
  engagementScore: number; // 0-100
  engagementTier: "low" | "medium" | "high" | "champion";
  
  // Program diversity
  uniqueEventTypes: EventType[];
  uniqueGrantCategories: GrantProgramCategory[];
  
  // Timeline
  firstEventDate: string | null;
  lastEventDate: string | null;
  daysSinceFirstEvent: number;
  daysSinceLastEvent: number;
  
  // Attendance records
  timeline: AttendanceRecord[];
  
  // Cohort info
  cohortMonth: string | null; // YYYY-MM of first event
}

// Engagement score weights
const ENGAGEMENT_WEIGHTS = {
  eventAttendance: 20,      // Points per event attended (max 5 events = 100)
  surveyCompletion: 10,     // Bonus per survey completed
  releaseSignature: 5,      // Bonus per release signed
  programDiversity: 15,     // Bonus for attending multiple program types
  recency: 10,              // Bonus for recent activity (within 90 days)
};

function calculateEngagementScore(
  attendedEvents: number,
  surveyCount: number,
  releaseCount: number,
  uniqueTypeCount: number,
  daysSinceLastEvent: number
): number {
  let score = 0;
  
  // Event attendance (cap at 5 events for max points)
  score += Math.min(attendedEvents, 5) * ENGAGEMENT_WEIGHTS.eventAttendance;
  
  // Survey completion bonus
  score += Math.min(surveyCount, 3) * ENGAGEMENT_WEIGHTS.surveyCompletion;
  
  // Release signature bonus
  score += Math.min(releaseCount, 3) * ENGAGEMENT_WEIGHTS.releaseSignature;
  
  // Program diversity bonus
  if (uniqueTypeCount >= 2) score += ENGAGEMENT_WEIGHTS.programDiversity;
  if (uniqueTypeCount >= 3) score += ENGAGEMENT_WEIGHTS.programDiversity;
  
  // Recency bonus (within 90 days)
  if (daysSinceLastEvent <= 90) {
    score += ENGAGEMENT_WEIGHTS.recency;
  } else if (daysSinceLastEvent <= 180) {
    score += ENGAGEMENT_WEIGHTS.recency / 2;
  }
  
  return Math.min(score, 100);
}

function getEngagementTier(score: number): "low" | "medium" | "high" | "champion" {
  if (score >= 80) return "champion";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function useParticipantEngagement(participantId: string) {
  return useQuery({
    queryKey: ["participant-engagement", participantId],
    queryFn: async (): Promise<ParticipantEngagement | null> => {
      // Fetch attendance records for this participant
      const { data: attendance, error } = await supabase
        .from("event_attendance")
        .select("*")
        .eq("participant_id", participantId)
        .order("event_date", { ascending: true });

      if (error) throw error;
      if (!attendance || attendance.length === 0) return null;

      // Build timeline
      const timeline: AttendanceRecord[] = attendance.map((a) => {
        const eventType = (a.event_type as EventType) || classifyEventType(a.event_name);
        return {
          id: a.id,
          eventName: a.event_name,
          eventType,
          grantCategory: EVENT_TYPE_TO_GRANT_CATEGORY[eventType],
          eventDate: a.event_date,
          dayLabel: a.day_label,
          confirmedAttended: a.confirmed_attended ?? false,
          completedSurvey: a.completed_survey ?? false,
          signedRelease: a.signed_release ?? false,
        };
      });

      // Calculate metrics
      const attendedRecords = timeline.filter((t) => t.confirmedAttended);
      const totalEvents = timeline.length;
      const attendedEvents = attendedRecords.length;
      const surveyCount = timeline.filter((t) => t.completedSurvey).length;
      const releaseCount = timeline.filter((t) => t.signedRelease).length;

      // Unique types and categories
      const uniqueEventTypes = [...new Set(attendedRecords.map((t) => t.eventType))];
      const uniqueGrantCategories = [...new Set(attendedRecords.map((t) => t.grantCategory))];

      // Dates
      const firstEventDate = attendedRecords[0]?.eventDate || null;
      const lastEventDate = attendedRecords[attendedRecords.length - 1]?.eventDate || null;
      
      const now = new Date();
      const daysSinceFirstEvent = firstEventDate 
        ? Math.floor((now.getTime() - new Date(firstEventDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const daysSinceLastEvent = lastEventDate
        ? Math.floor((now.getTime() - new Date(lastEventDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Engagement score
      const engagementScore = calculateEngagementScore(
        attendedEvents,
        surveyCount,
        releaseCount,
        uniqueEventTypes.length,
        daysSinceLastEvent
      );

      // Cohort (month of first event)
      const cohortMonth = firstEventDate 
        ? firstEventDate.substring(0, 7) // YYYY-MM
        : null;

      return {
        participantId,
        totalEvents,
        attendedEvents,
        surveyCount,
        releaseCount,
        engagementScore,
        engagementTier: getEngagementTier(engagementScore),
        uniqueEventTypes,
        uniqueGrantCategories,
        firstEventDate,
        lastEventDate,
        daysSinceFirstEvent,
        daysSinceLastEvent,
        timeline,
        cohortMonth,
      };
    },
    enabled: !!participantId,
  });
}

// Hook for cohort analysis
export function useCohortAnalysis() {
  return useQuery({
    queryKey: ["cohort-analysis"],
    queryFn: async () => {
      const { data: attendance, error } = await supabase
        .from("event_attendance")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;

      // Group by participant to find first event
      const participantFirstEvent = new Map<string, string>();
      attendance?.forEach((a) => {
        if (a.confirmed_attended && !participantFirstEvent.has(a.participant_id)) {
          participantFirstEvent.set(a.participant_id, a.event_date);
        }
      });

      // Group by cohort month
      const cohorts = new Map<string, {
        month: string;
        participants: Set<string>;
        totalAttendances: number;
        returnedParticipants: Set<string>;
      }>();

      participantFirstEvent.forEach((firstDate, participantId) => {
        const cohortMonth = firstDate.substring(0, 7);
        if (!cohorts.has(cohortMonth)) {
          cohorts.set(cohortMonth, {
            month: cohortMonth,
            participants: new Set(),
            totalAttendances: 0,
            returnedParticipants: new Set(),
          });
        }
        cohorts.get(cohortMonth)!.participants.add(participantId);
      });

      // Count return visits
      attendance?.forEach((a) => {
        if (!a.confirmed_attended) return;
        
        const firstDate = participantFirstEvent.get(a.participant_id);
        if (!firstDate) return;
        
        const cohortMonth = firstDate.substring(0, 7);
        const cohort = cohorts.get(cohortMonth);
        if (!cohort) return;

        cohort.totalAttendances += 1;
        
        // If this event is after their first event, they're a returner
        if (a.event_date > firstDate) {
          cohort.returnedParticipants.add(a.participant_id);
        }
      });

      return Array.from(cohorts.values())
        .map((c) => ({
          month: c.month,
          newParticipants: c.participants.size,
          returnedParticipants: c.returnedParticipants.size,
          retentionRate: c.participants.size > 0
            ? Math.round((c.returnedParticipants.size / c.participants.size) * 100)
            : 0,
          avgAttendancesPerPerson: c.participants.size > 0
            ? Math.round((c.totalAttendances / c.participants.size) * 10) / 10
            : 0,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    },
  });
}

// Get engagement-weighted survey responses
export function getEngagementWeight(engagementTier: "low" | "medium" | "high" | "champion"): number {
  switch (engagementTier) {
    case "champion": return 2.0;
    case "high": return 1.5;
    case "medium": return 1.0;
    case "low": return 0.5;
  }
}
