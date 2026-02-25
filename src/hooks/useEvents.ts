/**
 * useEvents — Unified Event Model Hook
 * Reads from events + event_registrations tables.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  checked_in_by?: string;
  check_in_method?: string;
  checked_out: boolean;
  checked_out_at?: string;
  checked_out_by?: string;
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

// ── HOOKS ─────────────────────────────────────────────

/** All events with registration/check-in counts */
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;

      // Get counts for each event
      const eventsWithCounts: BTSEvent[] = await Promise.all(
        (events || []).map(async (event: any) => {
          const { count: regCount } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          const { count: checkedInCount } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('checked_in', true);

          return {
            ...event,
            tags: event.tags || [],
            registration_count: regCount || 0,
            checked_in_count: checkedInCount || 0,
          } as BTSEvent;
        })
      );

      return eventsWithCounts;
    },
  });
}

/** Single event with all its registrations */
export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return undefined;

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('full_name', { ascending: true });

      if (regError) throw regError;

      const { count: regCount } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      const { count: checkedInCount } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('checked_in', true);

      return {
        event: {
          ...event,
          tags: event.tags || [],
          registration_count: regCount || 0,
          checked_in_count: checkedInCount || 0,
        } as BTSEvent,
        registrations: (registrations || []) as EventRegistration[],
      };
    },
    enabled: !!eventId,
    refetchInterval: 5000, // Auto-refresh for live kiosk
  });
}

/** Registrations for a specific event */
export function useEventRegistrations(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return (data || []) as EventRegistration[];
    },
    enabled: !!eventId,
    refetchInterval: 5000,
  });
}

/** Search registrations by name */
export function useSearchRegistrations(eventId: string | undefined, searchTerm: string) {
  return useQuery({
    queryKey: ['event-registrations-search', eventId, searchTerm],
    queryFn: async () => {
      if (!eventId) return [];

      let query = supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('full_name', { ascending: true });

      if (searchTerm.trim()) {
        query = query.ilike('full_name', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EventRegistration[];
    },
    enabled: !!eventId,
  });
}

/** Create event */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: Partial<BTSEvent>) => {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data as BTSEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/** Update event */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BTSEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as BTSEvent;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', vars.id] });
    },
  });
}

/** Manual check-in by registration ID */
export function useManualCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, userId }: { registrationId: string; userId?: string }) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: userId || null,
          check_in_method: 'kiosk',
        })
        .eq('id', registrationId)
        .select()
        .single();
      if (error) throw error;
      return data as EventRegistration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations-search'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/** Check-out by registration ID */
export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, userId }: { registrationId: string; userId?: string }) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          checked_out: true,
          checked_out_at: new Date().toISOString(),
          checked_out_by: userId || null,
        })
        .eq('id', registrationId)
        .select()
        .single();
      if (error) throw error;
      return data as EventRegistration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations-search'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/** Check in by QR token (uses the DB function) */
export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ qrToken, eventId }: { qrToken: string; eventId?: string }) => {
      const { data, error } = await supabase.rpc('checkin_by_qr_token', {
        p_qr_token: qrToken,
      });
      if (error) throw error;
      return data as CheckInResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations-search'] });
    },
  });
}

/** Add a walk-in registration (immediately checked in) */
export function useAddWalkIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      firstName,
      lastName,
      email,
      userId,
    }: {
      eventId: string;
      firstName: string;
      lastName: string;
      email?: string;
      userId?: string;
    }) => {
      const fullName = `${firstName} ${lastName}`.trim();
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          email: email || null,
          registration_source: 'walk-in',
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: userId || null,
          check_in_method: 'kiosk',
        })
        .select()
        .single();
      if (error) throw error;
      return data as EventRegistration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations-search'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
