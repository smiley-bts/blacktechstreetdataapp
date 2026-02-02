import { useMemo } from "react";
import { useParticipants, ParticipantWithEmails } from "./useParticipants";
import { useEventAttendance, EventSummary, EventTypeBreakdown, GrantCategoryRollup } from "./useEventAttendance";
import { EventType } from "@/types/eventTypes";

export interface AttendanceMetrics {
  // Core attendance-first counts (not inflated by registrations)
  totalUniqueAttendees: number;
  totalAttendances: number; // Sum of all event attendances
  averageEventsPerAttendee: number;

  // Registration vs Attendance comparison
  totalRegistrations: number;
  overallAttendanceRate: number;

  // Engagement depth
  singleEventAttendees: number;
  multiEventAttendees: number;
  highEngagement: number; // 3+ events

  // Survey and release completion
  surveyCompletionRate: number;
  releaseSigningRate: number;

  // Stakeholder breakdown
  stakeholderCount: number;
  communityParticipantCount: number;

  // Demographics (of actual attendees)
  attendeesByAgeRange: Record<string, number>;
  attendeesByIndustry: Record<string, number>;
  attendeesByAILevel: Record<string, number>;
  attendeesByLocation: Record<string, number>;

  // Event-level summaries
  eventSummaries: EventSummary[];

  // Longitudinal tracking
  firstTimeAttendees: number; // Attended only one event ever
  returningAttendees: number; // Attended 2+ events
  retentionRate: number; // % who returned after first event

  // Event type breakdown (NEW)
  eventTypeBreakdown: EventTypeBreakdown[];

  // Grant-aligned rollups (NEW - deduplicated per category)
  grantRollups: GrantCategoryRollup[];
}

export interface ParticipantStatus {
  status: "registered" | "attended" | "completed";
  eventCount: number;
  lastEventDate: string | null;
  surveyCompleted: boolean;
  eventTypes: EventType[];
}

export function useParticipantMetrics(eventTypeFilter?: EventType) {
  const { participants, isLoading: participantsLoading } = useParticipants();
  const { 
    attendance, 
    eventSummaries, 
    eventTypeBreakdown,
    grantRollups,
    isLoading: attendanceLoading 
  } = useEventAttendance(eventTypeFilter ? { eventType: eventTypeFilter } : undefined);

  const metrics = useMemo((): AttendanceMetrics => {
    // Build attendance map per participant
    const participantAttendance = new Map<
      string,
      { 
        attended: number; 
        registered: number; 
        surveyed: number; 
        released: number;
        eventTypes: Set<EventType>;
      }
    >();

    attendance.forEach((a) => {
      const existing = participantAttendance.get(a.participant_id) || {
        attended: 0,
        registered: 0,
        surveyed: 0,
        released: 0,
        eventTypes: new Set<EventType>(),
      };

      existing.registered += 1;
      if (a.confirmed_attended) {
        existing.attended += 1;
        if (a.classifiedType) {
          existing.eventTypes.add(a.classifiedType);
        }
      }
      if (a.completed_survey) existing.surveyed += 1;
      if (a.signed_release) existing.released += 1;

      participantAttendance.set(a.participant_id, existing);
    });

    // Core counts - ATTENDANCE FIRST
    const attendeesWithEvents = Array.from(participantAttendance.entries()).filter(
      ([, stats]) => stats.attended > 0
    );

    const totalUniqueAttendees = attendeesWithEvents.length;
    const totalAttendances = attendeesWithEvents.reduce(
      (sum, [, stats]) => sum + stats.attended,
      0
    );
    const totalRegistrations = Array.from(participantAttendance.values()).reduce(
      (sum, stats) => sum + stats.registered,
      0
    );

    const averageEventsPerAttendee =
      totalUniqueAttendees > 0
        ? Math.round((totalAttendances / totalUniqueAttendees) * 10) / 10
        : 0;

    const overallAttendanceRate =
      totalRegistrations > 0
        ? Math.round((totalAttendances / totalRegistrations) * 100)
        : 0;

    // Engagement depth
    const singleEventAttendees = attendeesWithEvents.filter(
      ([, stats]) => stats.attended === 1
    ).length;
    const multiEventAttendees = attendeesWithEvents.filter(
      ([, stats]) => stats.attended >= 2
    ).length;
    const highEngagement = attendeesWithEvents.filter(
      ([, stats]) => stats.attended >= 3
    ).length;

    // Survey and release rates (of attendees only)
    const totalSurveys = attendeesWithEvents.reduce(
      (sum, [, stats]) => sum + stats.surveyed,
      0
    );
    const totalReleases = attendeesWithEvents.reduce(
      (sum, [, stats]) => sum + stats.released,
      0
    );
    const surveyCompletionRate =
      totalAttendances > 0
        ? Math.round((totalSurveys / totalAttendances) * 100)
        : 0;
    const releaseSigningRate =
      totalAttendances > 0
        ? Math.round((totalReleases / totalAttendances) * 100)
        : 0;

    // Stakeholder breakdown
    const attendeeIds = new Set(attendeesWithEvents.map(([id]) => id));
    const attendeeParticipants = participants.filter((p) =>
      attendeeIds.has(p.id)
    );
    const stakeholderCount = attendeeParticipants.filter(
      (p) => p.is_stakeholder
    ).length;
    const communityParticipantCount =
      totalUniqueAttendees - stakeholderCount;

    // Demographics of actual attendees
    const attendeesByAgeRange: Record<string, number> = {};
    const attendeesByIndustry: Record<string, number> = {};
    const attendeesByAILevel: Record<string, number> = {};
    const attendeesByLocation: Record<string, number> = {};

    attendeeParticipants.forEach((p) => {
      if (p.age_range) {
        attendeesByAgeRange[p.age_range] =
          (attendeesByAgeRange[p.age_range] || 0) + 1;
      }
      if (p.industry) {
        attendeesByIndustry[p.industry] =
          (attendeesByIndustry[p.industry] || 0) + 1;
      }
      if (p.ai_experience_level) {
        const level = p.ai_experience_level.split(":")[0].trim();
        attendeesByAILevel[level] = (attendeesByAILevel[level] || 0) + 1;
      }
      if (p.city || p.state) {
        const location = [p.city, p.state].filter(Boolean).join(", ");
        attendeesByLocation[location] =
          (attendeesByLocation[location] || 0) + 1;
      }
    });

    // Longitudinal tracking
    const firstTimeAttendees = singleEventAttendees;
    const returningAttendees = multiEventAttendees;
    const retentionRate =
      totalUniqueAttendees > 0
        ? Math.round((returningAttendees / totalUniqueAttendees) * 100)
        : 0;

    return {
      totalUniqueAttendees,
      totalAttendances,
      averageEventsPerAttendee,
      totalRegistrations,
      overallAttendanceRate,
      singleEventAttendees,
      multiEventAttendees,
      highEngagement,
      surveyCompletionRate,
      releaseSigningRate,
      stakeholderCount,
      communityParticipantCount,
      attendeesByAgeRange,
      attendeesByIndustry,
      attendeesByAILevel,
      attendeesByLocation,
      eventSummaries,
      firstTimeAttendees,
      returningAttendees,
      retentionRate,
      eventTypeBreakdown,
      grantRollups,
    };
  }, [participants, attendance, eventSummaries, eventTypeBreakdown, grantRollups]);

  // Helper to get a participant's status
  const getParticipantStatus = useMemo(() => {
    return (participantId: string): ParticipantStatus => {
      const participantRecords = attendance.filter(
        (a) => a.participant_id === participantId
      );

      if (participantRecords.length === 0) {
        return {
          status: "registered",
          eventCount: 0,
          lastEventDate: null,
          surveyCompleted: false,
          eventTypes: [],
        };
      }

      const attended = participantRecords.filter((a) => a.confirmed_attended);
      const surveyed = participantRecords.some((a) => a.completed_survey);
      const lastEvent = participantRecords.sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      )[0];

      // Collect unique event types attended
      const eventTypes = [...new Set(
        attended
          .map((a) => a.classifiedType)
          .filter((t): t is EventType => t !== undefined)
      )];

      return {
        status:
          attended.length > 0
            ? surveyed
              ? "completed"
              : "attended"
            : "registered",
        eventCount: attended.length,
        lastEventDate: lastEvent?.event_date || null,
        surveyCompleted: surveyed,
        eventTypes,
      };
    };
  }, [attendance]);

  return {
    metrics,
    getParticipantStatus,
    isLoading: participantsLoading || attendanceLoading,
  };
}
