/**
 * useEvents — Unified Event Model Hook
 * MarkusV4 | 2026-02-24
 *
 * Replaces per-event hardcoded hooks (useJune2025Event, useSep2025Event, etc.)
 * Single source of truth for all event data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── TYPES ─────────────────────────────────────────────────────

export type EventType =
  | "workshop"
  | "community_engagement"
  | "enterprise"
  | "conference"
  | "other";

export interface BTSEvent {
  id: string;
  name: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  location_url?: string;
  event_type: EventType;
  max_capacity?: number;
  is_published: boolean;
  registration_open: boolean;
  tally_form_id?: string;
  tally_form_url?: string;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  // Computed
  registration_count?: number;
  checked_in_count?: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  participant_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  age_range?: string;
  zip_code?: string;
  income_range?: string;
  current_role?: string;
  ai_experience_level?: string;
  ai_confidence?: string;
  community_involvement?: string;
  registration_source: string;
  tally_submission_id?: string;
  registered_at: string;
  qr_token: string;
  checked_in: boolean;
  checked_in_at?: string;
  check_in_method?: string;
  completed_survey: boolean;
  signed_release: boolean;
  created_at: string;
}

export interface CheckInResult {
  success: boolean;
  already_checked_in?: boolean;
  error?: string;
  full_name?: string;
  email?: string;
  event_name?: string;
  checked_in_at?: string;
}

// ── HOOKS ─────────────────────────────────────────────────────

/** All events — ordered by date desc */
export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<BTSEvent[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;

      // Fetch registration counts in one query
      const eventIds = events?.map((e) => e.id) || [];
      if (eventIds.length === 0) return [];

      const { data: counts } = await supabase
        .from("event_registrations")
        .select("event_id, checked_in")
        .in("event_id", eventIds);

      const registrationMap = new Map<string, { total: number; checkedIn: number }>();
      counts?.forEach((r) => {
        const existing = registrationMap.get(r.event_id) || { total: 0, checkedIn: 0 };
        existing.total += 1;
        if (r.checked_in) existing.checkedIn += 1;
        registrationMap.set(r.event_id, existing);
      });

      return (events || []).map((e) => ({
        ...e,
        tags: e.tags || [],
        registration_count: registrationMap.get(e.id)?.total || 0,
        checked_in_count: registrationMap.get(e.id)?.checkedIn || 0,
      }));
    },
    staleTime: 30_000,
  });
}

/** Single event + its registrations */
export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId!)
        .single();

      if (error) throw error;

      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId!)
        .order("registered_at", { ascending: false });

      if (regError) throw regError;

      return {
        event: { ...event, tags: event.tags || [] } as BTSEvent,
        registrations: (registrations || []) as EventRegistration[],
      };
    },
    staleTime: 15_000,
  });
}

/** Registrations for a specific event */
export function useEventRegistrations(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-registrations", eventId],
    enabled: !!eventId,
    queryFn: async (): Promise<EventRegistration[]> => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId!)
        .order("registered_at", { ascending: false });

      if (error) throw error;
      return data as EventRegistration[];
    },
    staleTime: 10_000,
  });
}

/** Create a new event */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Partial<BTSEvent>) => {
      const { data, error } = await supabase
        .from("events")
        .insert({
          name: event.name,
          description: event.description,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location,
          location_url: event.location_url,
          event_type: event.event_type || "workshop",
          max_capacity: event.max_capacity,
          is_published: event.is_published ?? false,
          registration_open: event.registration_open ?? true,
          tally_form_id: event.tally_form_id,
          tally_form_url: event.tally_form_url,
          tags: event.tags || [],
          notes: event.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(`Event "${data.name}" created`);
    },
    onError: (err: Error) => {
      toast.error("Failed to create event", { description: err.message });
    },
  });
}

/** Update an existing event */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BTSEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
      toast.success("Event updated");
    },
    onError: (err: Error) => {
      toast.error("Failed to update event", { description: err.message });
    },
  });
}

/** Check in an attendee by QR token */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      qrToken,
      eventId,
    }: {
      qrToken: string;
      eventId?: string;
    }): Promise<CheckInResult> => {
      const { data, error } = await supabase.rpc("checkin_by_qr_token", {
        p_qr_token: qrToken.trim(),
      });

      if (error) throw error;
      return data as CheckInResult;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: Error) => {
      toast.error("Check-in failed", { description: err.message });
    },
  });
}

/** Manually mark a registration as checked in (no QR scan needed) */
export function useManualCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registrationId: string) => {
      const { data, error } = await supabase
        .from("event_registrations")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          check_in_method: "manual",
        })
        .eq("id", registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event-registrations", data.event_id] });
      queryClient.invalidateQueries({ queryKey: ["event", data.event_id] });
      toast.success(`${data.full_name || "Attendee"} checked in`);
    },
    onError: (err: Error) => {
      toast.error("Manual check-in failed", { description: err.message });
    },
  });
}
