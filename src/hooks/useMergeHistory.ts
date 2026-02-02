import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type MergeHistory = Tables<"merge_history">;
export type MergeHistoryInsert = TablesInsert<"merge_history">;

export interface MergeRecord extends MergeHistory {
  keptParticipant?: Tables<"participants">;
}

export function useMergeHistory() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["merge-history"],
    queryFn: async (): Promise<MergeRecord[]> => {
      const { data: history, error } = await supabase
        .from("merge_history")
        .select("*")
        .order("merged_at", { ascending: false });

      if (error) throw error;

      // Fetch kept participant details
      const keptIds = [...new Set(history?.map((h) => h.kept_participant_id) || [])];

      if (keptIds.length === 0) return [];

      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .in("id", keptIds);

      if (participantsError) throw participantsError;

      const participantMap = new Map(
        participants?.map((p) => [p.id, p]) || []
      );

      return (history || []).map((h) => ({
        ...h,
        keptParticipant: participantMap.get(h.kept_participant_id),
      }));
    },
  });

  const recordMerge = useMutation({
    mutationFn: async (data: MergeHistoryInsert) => {
      const { data: record, error } = await supabase
        .from("merge_history")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merge-history"] });
    },
  });

  // Merge two participants - keeps one, archives the other
  const mergeParticipants = useMutation({
    mutationFn: async ({
      keepId,
      mergeId,
      reason,
    }: {
      keepId: string;
      mergeId: string;
      reason?: string;
    }) => {
      // Fetch the participant to be merged
      const { data: mergedParticipant, error: fetchError } = await supabase
        .from("participants")
        .select("*")
        .eq("id", mergeId)
        .single();

      if (fetchError) throw fetchError;

      // Fetch emails from the merged participant
      const { data: mergedEmails, error: emailsError } = await supabase
        .from("participant_emails")
        .select("email")
        .eq("participant_id", mergeId);

      if (emailsError) throw emailsError;

      // Transfer emails to kept participant
      if (mergedEmails && mergedEmails.length > 0) {
        const emailInserts = mergedEmails.map((e) => ({
          participant_id: keepId,
          email: e.email,
          is_primary: false,
          source: `merged_from_${mergeId}`,
        }));

        // Insert, ignoring duplicates
        for (const insert of emailInserts) {
          await supabase
            .from("participant_emails")
            .upsert(insert, { onConflict: "email", ignoreDuplicates: true });
        }
      }

      // Transfer event attendance records
      await supabase
        .from("event_attendance")
        .update({ participant_id: keepId })
        .eq("participant_id", mergeId);

      // Record the merge in history
      const { error: historyError } = await supabase
        .from("merge_history")
        .insert({
          kept_participant_id: keepId,
          merged_participant_id: mergeId,
          merged_participant_name: mergedParticipant.full_name,
          merged_emails: mergedEmails?.map((e) => e.email) || [],
          merged_data_snapshot: mergedParticipant,
          merge_reason: reason || "Manual merge",
        });

      if (historyError) throw historyError;

      // Delete the merged participant's emails
      await supabase
        .from("participant_emails")
        .delete()
        .eq("participant_id", mergeId);

      // Delete the merged participant
      const { error: deleteError } = await supabase
        .from("participants")
        .delete()
        .eq("id", mergeId);

      if (deleteError) throw deleteError;

      return { keepId, mergeId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merge-history"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendance"] });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
    recordMerge,
    mergeParticipants,
  };
}
