import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { 
  EventType, 
  EVENT_TYPES, 
  classifyEventType, 
  EVENT_TYPE_TO_GRANT_CATEGORY,
  GrantProgramCategory,
  GRANT_PROGRAM_CATEGORIES,
} from "@/types/eventTypes";

export type EventAttendance = Tables<"event_attendance">;
export type EventAttendanceInsert = TablesInsert<"event_attendance">;

export interface EventAttendanceWithParticipant extends EventAttendance {
  participant?: Tables<"participants">;
  classifiedType?: EventType;
}

export interface EventSummary {
  eventName: string;
  eventDate: string;
  eventType: EventType;
  totalRegistered: number;
  totalAttended: number;
  completedSurvey: number;
  signedRelease: number;
  attendanceRate: number;
}

export interface EventTypeBreakdown {
  type: EventType;
  uniqueAttendees: number;
  totalAttendances: number;
  eventCount: number;
  attendanceRate: number;
}

export interface GrantCategoryRollup {
  category: GrantProgramCategory;
  uniqueAttendees: number; // Deduplicated within category
  totalAttendances: number;
  eventCount: number;
}

export interface EventAttendanceFilters {
  eventName?: string;
  eventType?: EventType;
  dateFrom?: string;
  dateTo?: string;
}

export function useEventAttendance(filters?: EventAttendanceFilters) {
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ["event-attendance", filters],
    queryFn: async (): Promise<EventAttendanceWithParticipant[]> => {
      let query = supabase.from("event_attendance").select("*");

      if (filters?.eventName) {
        query = query.eq("event_name", filters.eventName);
      }
      if (filters?.eventType) {
        query = query.eq("event_type", filters.eventType);
      }
      if (filters?.dateFrom) {
        query = query.gte("event_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("event_date", filters.dateTo);
      }

      const { data: attendance, error } = await query.order("event_date", {
        ascending: false,
      });

      if (error) throw error;

      // Fetch participant details
      const participantIds = [
        ...new Set(attendance?.map((a) => a.participant_id) || []),
      ];

      if (participantIds.length === 0) return [];

      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .in("id", participantIds);

      if (participantsError) throw participantsError;

      const participantMap = new Map(
        participants?.map((p) => [p.id, p]) || []
      );

      return (attendance || []).map((a) => ({
        ...a,
        participant: participantMap.get(a.participant_id),
        // Classify type from event name if not set in DB
        classifiedType: (a.event_type as EventType) || classifyEventType(a.event_name),
      }));
    },
  });

  const eventSummariesQuery = useQuery({
    queryKey: ["event-summaries", filters?.eventType],
    queryFn: async (): Promise<EventSummary[]> => {
      let query = supabase.from("event_attendance").select("*");

      if (filters?.eventType) {
        query = query.eq("event_type", filters.eventType);
      }

      const { data: attendance, error } = await query;

      if (error) throw error;

      // Group by event
      const eventGroups = new Map<string, EventAttendance[]>();
      attendance?.forEach((a) => {
        const key = `${a.event_name}|${a.event_date}`;
        const existing = eventGroups.get(key) || [];
        existing.push(a);
        eventGroups.set(key, existing);
      });

      const summaries: EventSummary[] = [];
      eventGroups.forEach((records, key) => {
        const [eventName, eventDate] = key.split("|");
        const totalRegistered = records.length;
        const totalAttended = records.filter((r) => r.confirmed_attended).length;
        const completedSurvey = records.filter((r) => r.completed_survey).length;
        const signedRelease = records.filter((r) => r.signed_release).length;

        // Use stored type or classify from name
        const eventType = (records[0]?.event_type as EventType) || classifyEventType(eventName);

        summaries.push({
          eventName,
          eventDate,
          eventType,
          totalRegistered,
          totalAttended,
          completedSurvey,
          signedRelease,
          attendanceRate:
            totalRegistered > 0
              ? Math.round((totalAttended / totalRegistered) * 100)
              : 0,
        });
      });

      return summaries.sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );
    },
  });

  // Event type breakdown with deduplication
  const eventTypeBreakdownQuery = useQuery({
    queryKey: ["event-type-breakdown"],
    queryFn: async (): Promise<EventTypeBreakdown[]> => {
      const { data: attendance, error } = await supabase
        .from("event_attendance")
        .select("*");

      if (error) throw error;

      // Group by event type
      const typeGroups = new Map<EventType, { 
        attendees: Set<string>; 
        attendances: number; 
        events: Set<string>;
        registrations: number;
      }>();

      // Initialize all types
      Object.values(EVENT_TYPES).forEach(type => {
        typeGroups.set(type, { 
          attendees: new Set(), 
          attendances: 0, 
          events: new Set(),
          registrations: 0,
        });
      });

      attendance?.forEach((a) => {
        const eventType = (a.event_type as EventType) || classifyEventType(a.event_name);
        const group = typeGroups.get(eventType)!;
        
        group.registrations += 1;
        group.events.add(`${a.event_name}|${a.event_date}`);
        
        if (a.confirmed_attended) {
          group.attendees.add(a.participant_id);
          group.attendances += 1;
        }
      });

      return Array.from(typeGroups.entries()).map(([type, data]) => ({
        type,
        uniqueAttendees: data.attendees.size,
        totalAttendances: data.attendances,
        eventCount: data.events.size,
        attendanceRate: data.registrations > 0 
          ? Math.round((data.attendances / data.registrations) * 100) 
          : 0,
      }));
    },
  });

  // Grant-aligned rollups (deduplicated within each category)
  const grantRollupsQuery = useQuery({
    queryKey: ["grant-rollups"],
    queryFn: async (): Promise<GrantCategoryRollup[]> => {
      const { data: attendance, error } = await supabase
        .from("event_attendance")
        .select("*");

      if (error) throw error;

      // Group by grant category
      const categoryGroups = new Map<GrantProgramCategory, {
        attendees: Set<string>;
        attendances: number;
        events: Set<string>;
      }>();

      // Initialize all categories
      Object.values(GRANT_PROGRAM_CATEGORIES).forEach(category => {
        categoryGroups.set(category, {
          attendees: new Set(),
          attendances: 0,
          events: new Set(),
        });
      });

      attendance?.forEach((a) => {
        const eventType = (a.event_type as EventType) || classifyEventType(a.event_name);
        const grantCategory = EVENT_TYPE_TO_GRANT_CATEGORY[eventType];
        const group = categoryGroups.get(grantCategory)!;

        group.events.add(`${a.event_name}|${a.event_date}`);

        if (a.confirmed_attended) {
          group.attendees.add(a.participant_id);
          group.attendances += 1;
        }
      });

      return Array.from(categoryGroups.entries()).map(([category, data]) => ({
        category,
        uniqueAttendees: data.attendees.size, // No double counting
        totalAttendances: data.attendances,
        eventCount: data.events.size,
      }));
    },
  });

  const recordAttendance = useMutation({
    mutationFn: async (data: EventAttendanceInsert) => {
      // Auto-classify event type if not provided
      const eventType = data.event_type || classifyEventType(data.event_name);
      
      const { data: record, error } = await supabase
        .from("event_attendance")
        .insert({ ...data, event_type: eventType })
        .select()
        .single();

      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["event-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["event-type-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["grant-rollups"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<EventAttendance> & { id: string }) => {
      const { data: record, error } = await supabase
        .from("event_attendance")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["event-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["event-type-breakdown"] });
      queryClient.invalidateQueries({ queryKey: ["grant-rollups"] });
    },
  });

  return {
    attendance: attendanceQuery.data || [],
    eventSummaries: eventSummariesQuery.data || [],
    eventTypeBreakdown: eventTypeBreakdownQuery.data || [],
    grantRollups: grantRollupsQuery.data || [],
    isLoading: 
      attendanceQuery.isLoading || 
      eventSummariesQuery.isLoading || 
      eventTypeBreakdownQuery.isLoading ||
      grantRollupsQuery.isLoading,
    error: 
      attendanceQuery.error || 
      eventSummariesQuery.error ||
      eventTypeBreakdownQuery.error ||
      grantRollupsQuery.error,
    refetch: () => {
      attendanceQuery.refetch();
      eventSummariesQuery.refetch();
      eventTypeBreakdownQuery.refetch();
      grantRollupsQuery.refetch();
    },
    recordAttendance,
    updateAttendance,
  };
}
