/**
 * TALLY WEBHOOK HANDLER
 * MarkusV4 | 2026-02-24
 *
 * Receives Tally form submissions and:
 * 1. Looks up the event by tally_form_id
 * 2. Upserts the registrant into event_registrations
 * 3. The DB trigger auto-syncs to participants table
 *
 * Webhook URL to paste into Tally:
 *   https://<your-project>.supabase.co/functions/v1/tally-webhook
 *
 * Set TALLY_SIGNING_SECRET in Supabase Edge Function secrets
 * (Tally → Integrations → Webhooks → Signing Secret)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-requested-with, content-type, tally-signature",
};

// ── FIELD MAPPING ────────────────────────────────────────────
// Maps common Tally field labels to our schema fields.
// Add your actual Tally field labels here — they're case-insensitive.
const FIELD_MAP: Record<string, string> = {
  "first name":            "first_name",
  "last name":             "last_name",
  "full name":             "full_name",
  "name":                  "full_name",
  "email":                 "email",
  "email address":         "email",
  "phone":                 "phone",
  "phone number":          "phone",
  "age range":             "age_range",
  "zip code":              "zip_code",
  "zip":                   "zip_code",
  "postal code":           "zip_code",
  "income range":          "income_range",
  "household income":      "income_range",
  "current role":          "current_role",
  "role":                  "current_role",
  "what is your role":     "current_role",
  "ai experience":         "ai_experience_level",
  "ai experience level":   "ai_experience_level",
  "familiarity with ai":   "ai_experience_level",
  "ai confidence":         "ai_confidence",
  "community involvement": "community_involvement",
};

function mapTallyFields(fields: any[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const field of fields) {
    const label = (field.label || "").toLowerCase().trim();
    const key = FIELD_MAP[label];
    if (!key) continue;

    // Tally field values can be strings, arrays (checkboxes), or nested
    let value = field.value;
    if (Array.isArray(value)) {
      value = value
        .map((v: any) => (typeof v === "object" ? v.text || v.label || "" : String(v)))
        .filter(Boolean)
        .join(", ");
    } else if (value && typeof value === "object") {
      value = value.text || value.label || JSON.stringify(value);
    }

    if (value != null && value !== "") {
      result[key] = String(value).trim();
    }
  }

  // Derive full_name if not directly provided
  if (!result.full_name && (result.first_name || result.last_name)) {
    result.full_name = `${result.first_name || ""} ${result.last_name || ""}`.trim();
  }

  // Derive first/last from full_name if needed
  if (result.full_name && !result.first_name) {
    const parts = result.full_name.split(" ");
    result.first_name = parts[0] || "";
    result.last_name = parts.slice(1).join(" ") || "";
  }

  return result;
}

// ── HANDLER ──────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    console.log("Tally webhook received:", JSON.stringify(body).slice(0, 500));

    // ── Parse Tally payload ──────────────────────────────────
    // Tally sends: { eventId, createdAt, data: { responseId, submissionId, respondentId, formId, formName, createdAt, fields: [...] } }
    const data = body.data || body;
    const formId        = data.formId || body.formId;
    const submissionId  = data.responseId || data.submissionId || body.submissionId;
    const fields        = data.fields || [];

    if (!formId) {
      return new Response(
        JSON.stringify({ error: "Missing formId in Tally payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Find matching event by tally_form_id ─────────────────
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, event_date, event_type, registration_open, max_capacity")
      .eq("tally_form_id", formId)
      .single();

    if (eventError || !event) {
      console.error("Event not found for formId:", formId, eventError);
      return new Response(
        JSON.stringify({ error: `No event found for Tally form ID: ${formId}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!event.registration_open) {
      return new Response(
        JSON.stringify({ error: "Registration is closed for this event" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Check capacity ────────────────────────────────────────
    if (event.max_capacity) {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id);

      if (count && count >= event.max_capacity) {
        return new Response(
          JSON.stringify({ error: "Event is at capacity" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Map field values ──────────────────────────────────────
    const mapped = mapTallyFields(fields);

    if (!mapped.email) {
      console.warn("Tally submission missing email — skipping participant sync");
    }

    // ── Insert registration (upsert by tally_submission_id) ───
    const registrationPayload: Record<string, any> = {
      event_id:             event.id,
      registration_source:  "tally",
      tally_submission_id:  submissionId,
      raw_tally_data:       body,
      first_name:           mapped.first_name   || null,
      last_name:            mapped.last_name    || null,
      full_name:            mapped.full_name    || null,
      email:                mapped.email?.toLowerCase() || null,
      phone:                mapped.phone        || null,
      age_range:            mapped.age_range    || null,
      zip_code:             mapped.zip_code     || null,
      income_range:         mapped.income_range || null,
      current_role:         mapped.current_role || null,
      ai_experience_level:  mapped.ai_experience_level || null,
      ai_confidence:        mapped.ai_confidence       || null,
      community_involvement: mapped.community_involvement || null,
    };

    const { data: registration, error: regError } = await supabase
      .from("event_registrations")
      .insert(registrationPayload)
      .select()
      .single();

    if (regError) {
      // Unique constraint on tally_submission_id = duplicate delivery
      if (regError.code === "23505") {
        console.log("Duplicate Tally submission ignored:", submissionId);
        return new Response(
          JSON.stringify({ success: true, message: "Duplicate submission ignored" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw regError;
    }

    console.log("Registration created:", registration.id, "QR token:", registration.qr_token);

    return new Response(
      JSON.stringify({
        success: true,
        registration_id: registration.id,
        qr_token:        registration.qr_token,
        event_name:      event.name,
        full_name:       registration.full_name,
        email:           registration.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Tally webhook error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
