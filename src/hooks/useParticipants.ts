import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Participant = Tables<"participants">;
export type ParticipantInsert = TablesInsert<"participants">;
export type ParticipantUpdate = TablesUpdate<"participants">;

export interface ParticipantWithEmails extends Participant {
  emails: Tables<"participant_emails">[];
  eventCount?: number;
}

export function useParticipants() {
  const queryClient = useQueryClient();

  const participantsQuery = useQuery({
    queryKey: ["participants"],
    queryFn: async (): Promise<ParticipantWithEmails[]> => {
      // Fetch participants
      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .order("full_name", { ascending: true });

      if (participantsError) throw participantsError;

      // Fetch all emails
      const { data: emails, error: emailsError } = await supabase
        .from("participant_emails")
        .select("*");

      if (emailsError) throw emailsError;

      // Fetch event counts per participant
      const { data: attendance, error: attendanceError } = await supabase
        .from("event_attendance")
        .select("participant_id, confirmed_attended");

      if (attendanceError) throw attendanceError;

      // Map emails and event counts to participants
      const emailMap = new Map<string, Tables<"participant_emails">[]>();
      emails?.forEach((email) => {
        const existing = emailMap.get(email.participant_id) || [];
        existing.push(email);
        emailMap.set(email.participant_id, existing);
      });

      const eventCountMap = new Map<string, number>();
      attendance?.forEach((a) => {
        if (a.confirmed_attended) {
          eventCountMap.set(
            a.participant_id,
            (eventCountMap.get(a.participant_id) || 0) + 1
          );
        }
      });

      return (participants || []).map((p) => ({
        ...p,
        emails: emailMap.get(p.id) || [],
        eventCount: eventCountMap.get(p.id) || 0,
      }));
    },
  });

  const createParticipant = useMutation({
    mutationFn: async (data: ParticipantInsert & { emails?: string[] }) => {
      const { emails, ...participantData } = data;

      // Create participant
      const { data: participant, error } = await supabase
        .from("participants")
        .insert(participantData)
        .select()
        .single();

      if (error) throw error;

      // Add emails if provided
      if (emails && emails.length > 0) {
        const emailInserts = emails.map((email, index) => ({
          participant_id: participant.id,
          email: email.toLowerCase(),
          is_primary: index === 0,
          source: "manual",
        }));

        const { error: emailError } = await supabase
          .from("participant_emails")
          .insert(emailInserts);

        if (emailError) throw emailError;
      }

      return participant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });

  const updateParticipant = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: ParticipantUpdate & { id: string }) => {
      const { data: participant, error } = await supabase
        .from("participants")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return participant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });

  const addEmail = useMutation({
    mutationFn: async ({
      participantId,
      email,
      source = "manual",
    }: {
      participantId: string;
      email: string;
      source?: string;
    }) => {
      const { data, error } = await supabase
        .from("participant_emails")
        .insert({
          participant_id: participantId,
          email: email.toLowerCase(),
          is_primary: false,
          source,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });

  return {
    participants: participantsQuery.data || [],
    isLoading: participantsQuery.isLoading,
    error: participantsQuery.error,
    refetch: participantsQuery.refetch,
    createParticipant,
    updateParticipant,
    addEmail,
  };
}
