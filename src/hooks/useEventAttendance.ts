import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type EventAttendance = Tables<"event_attendance">;
export type EventAttendanceInsert = TablesInsert<"event_attendance">;

export interface EventAttendanceWithParticipant extends EventAttendance {
  participant?: Tables<"participants">;
}

export interface EventSummary {
  eventName: string;
  eventDate: string;
  eventType: string | null;
  totalRegistered: number;
  totalAttended: number;
  completedSurvey: number;
  signedRelease: number;
  attendanceRate: number;
}

export function useEventAttendance(eventName?: string) {
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ["event-attendance", eventName],
    queryFn: async (): Promise<EventAttendanceWithParticipant[]> => {
      let query = supabase.from("event_attendance").select("*");

      if (eventName) {
        query = query.eq("event_name", eventName);
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
      }));
    },
  });

  const eventSummariesQuery = useQuery({
    queryKey: ["event-summaries"],
    queryFn: async (): Promise<EventSummary[]> => {
      const { data: attendance, error } = await supabase
        .from("event_attendance")
        .select("*");

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

        summaries.push({
          eventName,
          eventDate,
          eventType: records[0]?.event_type || null,
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

  const recordAttendance = useMutation({
    mutationFn: async (data: EventAttendanceInsert) => {
      const { data: record, error } = await supabase
        .from("event_attendance")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["event-summaries"] });
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
    },
  });

  return {
    attendance: attendanceQuery.data || [],
    eventSummaries: eventSummariesQuery.data || [],
    isLoading: attendanceQuery.isLoading || eventSummariesQuery.isLoading,
    error: attendanceQuery.error || eventSummariesQuery.error,
    refetch: () => {
      attendanceQuery.refetch();
      eventSummariesQuery.refetch();
    },
    recordAttendance,
    updateAttendance,
  };
}
