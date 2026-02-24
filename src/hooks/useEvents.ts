/**
 * useEvents — Unified Event Model Hook (Stubbed)
 * Tables not yet created — returns empty data to prevent build errors.
 */

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

// ── STUBBED HOOKS ─────────────────────────────────────────────

const emptyQuery = { data: undefined, isLoading: false, error: null, refetch: async () => ({} as any) } as const;

/** All events — stubbed */
export function useEvents() {
  return { ...emptyQuery, data: [] as BTSEvent[] };
}

/** Single event + registrations — stubbed */
export function useEvent(_eventId: string | undefined) {
  return { ...emptyQuery, data: undefined as { event: BTSEvent; registrations: EventRegistration[] } | undefined };
}

/** Registrations for a specific event — stubbed */
export function useEventRegistrations(_eventId: string | undefined) {
  return { ...emptyQuery, data: [] as EventRegistration[] };
}

/** Create event — stubbed */
export function useCreateEvent() {
  return { mutate: () => {}, mutateAsync: async () => ({} as BTSEvent), isPending: false };
}

/** Update event — stubbed */
export function useUpdateEvent() {
  return { mutate: () => {}, mutateAsync: async () => ({} as BTSEvent), isPending: false };
}

/** Check in by QR — stubbed */
export function useCheckIn() {
  return { mutate: (_vars: { qrToken: string; eventId?: string }) => {}, mutateAsync: async (_vars: { qrToken: string; eventId?: string }) => ({ success: false, error: "Not implemented" } as CheckInResult), isPending: false };
}

/** Manual check-in — stubbed */
export function useManualCheckIn() {
  return { mutate: (_id: string) => {}, mutateAsync: async (_id: string) => ({} as EventRegistration), isPending: false };
}
