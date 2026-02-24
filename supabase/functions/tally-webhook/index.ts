/**
 * TALLY WEBHOOK HANDLER
 * MarkusV4 | 2026-02-24 (updated: surveys + projects)
 *
 * Routes incoming Tally form submissions to the correct table:
 *   - events.tally_form_id        → event_registrations (+ participant sync)
 *   - events.pre_survey_form_id   → survey_responses (type = 'pre')
 *   - events.post_survey_form_id  → survey_responses (type = 'post')
 *
 * Webhook URL to paste into Tally:
 *   https://<your-project>.supabase.co/functions/v1/tally-webhook
 *
 * Set TALLY_SIGNING_SECRET in Supabase Edge Function secrets.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-requested-with, content-type, tally-signature",
};

// ── FIELD MAPS ───────────────────────────────────────────────

const REGISTRATION_FIELD_MAP: Record<string, string> = {
  "first name":             "first_name",
  "last name":              "last_name",
  "full name":              "full_name",
  "name":                   "full_name",
  "email":                  "email",
  "email address":          "email",
  "phone":                  "phone",
  "phone number":           "phone",
  "age range":              "age_range",
  "zip code":               "zip_code",
  "zip":                    "zip_code",
  "postal code":            "zip_code",
  "income range":           "income_range",
  "household income":       "income_range",
  "current role":           "current_role",
  "role":                   "current_role",
  "what is your role":      "current_role",
  "ai experience":          "ai_experience_level",
  "ai experience level":    "ai_experience_level",
  "familiarity with ai":    "ai_experience_level",
  "ai confidence":          "ai_confidence",
  "community involvement":  "community_involvement",
  "t-shirt size":           "tshirt_size",
  "tshirt size":            "tshirt_size",
  "accessibility needs":    "accessibility_needs",
  "laptop needed":          "needs_laptop",
};

const PRE_SURVEY_FIELD_MAP: Record<string, string> = {
  // Identity
  "first name":             "first_name",
  "last name":              "last_name",
  "name":                   "full_name",
  "email":                  "email",
  "email address":          "email",
  // Demographics
  "age range":              "age_range",
  "zip code":               "zip_code",
  "zip":                    "zip_code",
  "education":              "education_level",
  "highest level of education": "education_level",
  "current role":           "current_role",
  "industry":               "industry",
  // AI readiness
  "ai experience":          "ai_experience_level",
  "ai experience level":    "ai_experience_level",
  "level of experience using ai tools": "ai_experience_level",
  "how confident do you feel using ai": "ai_confidence_pre",
  "how confident":          "ai_confidence_pre",
  "community involvement":  "community_involvement",
};

const POST_SURVEY_FIELD_MAP: Record<string, string> = {
  // Identity
  "name":                   "full_name",
  "email":                  "email",
  "email address":          "email",
  // Confidence + mindset
  "how confident are you now": "ai_confidence_post",
  "confident":              "ai_confidence_post",
  "how likely are you to recommend": "nps_score",
  "likely to recommend":    "nps_score",
  "mindset before":         "mindset_before",
  "mindset after":          "mindset_after",
  "before today":           "mindset_before",
  "after today":            "mindset_after",
  "after completing":       "mindset_after",
  // Open-ended
  "biggest aha moment":     "biggest_aha",
  "aha moment":             "biggest_aha",
  "plan to use ai":         "plan_to_use_ai",
  "real way you plan":      "plan_to_use_ai",
  "skill you feel strongest": "skill_strongest",
  "felt welcoming":         "felt_welcoming",
  "welcoming to all skill levels": "felt_welcoming",
  "wish we had covered":    "suggestions",
  "one thing you wish":     "suggestions",
  "industry":               "industry",
};

// ── HELPERS ──────────────────────────────────────────────────

function extractFieldValue(field: any): string {
  let value = field.value;
  if (Array.isArray(value)) {
    return value
      .map((v: any) => (typeof v === "object" ? v.text || v.label || "" : String(v)))
      .filter(Boolean)
      .join(", ");
  }
  if (value && typeof value === "object") {
    return value.text || value.label || JSON.stringify(value);
  }
  return value != null ? String(value).trim() : "";
}

function mapFields(fields: any[], fieldMap: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const field of fields) {
    const label = (field.label || "").toLowerCase().trim();

    // Exact match first
    let key = fieldMap[label];

    // Partial match fallback
    if (!key) {
      for (const [mapLabel, mapKey] of Object.entries(fieldMap)) {
        if (label.includes(mapLabel) || mapLabel.includes(label)) {
          key = mapKey;
          break;
        }
      }
    }

    if (!key) continue;
    const value = extractFieldValue(field);
    if (value) result[key] = value;
  }

  // Derive full_name if split
  if (!result.full_name && (result.first_name || result.last_name)) {
    result.full_name = `${result.first_name || ""} ${result.last_name || ""}`.trim();
  }
  if (result.full_name && !result.first_name) {
    const parts = result.full_name.split(" ");
    result.first_name = parts[0] || "";
    result.last_name = parts.slice(1).join(" ") || "";
  }

  return result;
}

function buildRawResponses(fields: any[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const label = (field.label || field.key || "unknown").trim();
    const value = extractFieldValue(field);
    if (label && value) result[label] = value;
  }
  return result;
}

function toInt(val: string | undefined): number | null {
  if (!val) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
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

    const data = body.data || body;
    const formId       = data.formId || body.formId;
    const submissionId = data.responseId || data.submissionId || body.submissionId;
    const fields: any[] = data.fields || [];

    if (!formId) {
      return new Response(
        JSON.stringify({ error: "Missing formId in Tally payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Find matching event by any form ID ───────────────────
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name, event_date, event_type, registration_open, max_capacity, tally_form_id, pre_survey_form_id, post_survey_form_id")
      .or(`tally_form_id.eq.${formId},pre_survey_form_id.eq.${formId},post_survey_form_id.eq.${formId}`);

    if (eventsError || !events || events.length === 0) {
      console.error("No event matched formId:", formId, eventsError);
      return new Response(
        JSON.stringify({ error: `No event found for Tally form ID: ${formId}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = events[0];

    // ── Determine form type ──────────────────────────────────
    let formType: "registration" | "pre_survey" | "post_survey";
    if (event.tally_form_id === formId)       formType = "registration";
    else if (event.pre_survey_form_id === formId)  formType = "pre_survey";
    else if (event.post_survey_form_id === formId) formType = "post_survey";
    else {
      return new Response(
        JSON.stringify({ error: "Form ID matched event but type could not be determined" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Form type: ${formType} | Event: ${event.name} | Form: ${formId}`);

    // ════════════════════════════════════════════════════════
    // ROUTE 1: REGISTRATION
    // ════════════════════════════════════════════════════════
    if (formType === "registration") {
      if (!event.registration_open) {
        return new Response(
          JSON.stringify({ error: "Registration is closed for this event" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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

      const mapped = mapFields(fields, REGISTRATION_FIELD_MAP);
      if (!mapped.email) console.warn("Registration missing email");

      const { data: registration, error: regError } = await supabase
        .from("event_registrations")
        .insert({
          event_id:             event.id,
          registration_source:  "tally",
          tally_submission_id:  submissionId,
          raw_tally_data:       body,
          first_name:           mapped.first_name || null,
          last_name:            mapped.last_name || null,
          full_name:            mapped.full_name || null,
          email:                mapped.email?.toLowerCase() || null,
          phone:                mapped.phone || null,
          age_range:            mapped.age_range || null,
          zip_code:             mapped.zip_code || null,
          income_range:         mapped.income_range || null,
          current_role:         mapped.current_role || null,
          ai_experience_level:  mapped.ai_experience_level || null,
          ai_confidence:        mapped.ai_confidence || null,
          community_involvement: mapped.community_involvement || null,
        })
        .select()
        .single();

      if (regError) {
        if (regError.code === "23505") {
          console.log("Duplicate registration ignored:", submissionId);
          return new Response(
            JSON.stringify({ success: true, message: "Duplicate submission ignored" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw regError;
      }

      console.log("Registration created:", registration.id, "QR:", registration.qr_token);
      return new Response(
        JSON.stringify({
          success: true,
          form_type: "registration",
          registration_id: registration.id,
          qr_token: registration.qr_token,
          event_name: event.name,
          full_name: registration.full_name,
          email: registration.email,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ════════════════════════════════════════════════════════
    // ROUTE 2: PRE-SURVEY or POST-SURVEY
    // ════════════════════════════════════════════════════════
    const surveyType = formType === "pre_survey" ? "pre" : "post";
    const fieldMap = formType === "pre_survey" ? PRE_SURVEY_FIELD_MAP : POST_SURVEY_FIELD_MAP;
    const mapped = mapFields(fields, fieldMap);
    const raw = buildRawResponses(fields);

    // Try to link to existing registration by email
    let registrationId: string | null = null;
    if (mapped.email) {
      const { data: reg } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", event.id)
        .eq("email", mapped.email.toLowerCase())
        .limit(1)
        .single();
      if (reg) registrationId = reg.id;
    }

    const surveyPayload: Record<string, any> = {
      event_id:            event.id,
      registration_id:     registrationId,
      survey_type:         surveyType,
      email:               mapped.email?.toLowerCase() || null,
      full_name:           mapped.full_name || null,
      first_name:          mapped.first_name || null,
      last_name:           mapped.last_name || null,
      tally_form_id:       formId,
      tally_submission_id: submissionId,
      responses:           raw,
      // Pre-survey fields
      age_range:           mapped.age_range || null,
      zip_code:            mapped.zip_code || null,
      current_role:        mapped.current_role || null,
      education_level:     mapped.education_level || null,
      industry:            mapped.industry || null,
      ai_experience_level: mapped.ai_experience_level || null,
      ai_confidence_pre:   toInt(mapped.ai_confidence_pre),
      community_involvement: mapped.community_involvement || null,
      // Post-survey fields
      ai_confidence_post:  toInt(mapped.ai_confidence_post),
      nps_score:           toInt(mapped.nps_score),
      biggest_aha:         mapped.biggest_aha || null,
      plan_to_use_ai:      mapped.plan_to_use_ai || null,
      skill_strongest:     mapped.skill_strongest || null,
      mindset_before:      mapped.mindset_before || null,
      mindset_after:       mapped.mindset_after || null,
      felt_welcoming:      mapped.felt_welcoming || null,
      suggestions:         mapped.suggestions || null,
    };

    const { data: survey, error: surveyError } = await supabase
      .from("survey_responses")
      .insert(surveyPayload)
      .select()
      .single();

    if (surveyError) {
      if (surveyError.code === "23505") {
        console.log("Duplicate survey submission ignored:", submissionId);
        return new Response(
          JSON.stringify({ success: true, message: "Duplicate submission ignored" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw surveyError;
    }

    // Mark registration as having completed survey
    if (registrationId && surveyType === "post") {
      await supabase
        .from("event_registrations")
        .update({ completed_survey: true, updated_at: new Date().toISOString() })
        .eq("id", registrationId);
    }

    console.log(`${surveyType.toUpperCase()} survey saved:`, survey.id, "linked to registration:", registrationId);

    return new Response(
      JSON.stringify({
        success: true,
        form_type: formType,
        survey_id: survey.id,
        survey_type: surveyType,
        event_name: event.name,
        linked_to_registration: !!registrationId,
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
