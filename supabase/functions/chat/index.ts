/**
 * BTS GPT - CHAT EDGE FUNCTION
 * MarkusV4 | 2026-02-24 (updated: live survey + project context)
 *
 * Pulls live data from Supabase (events, registrations, surveys, projects)
 * and injects it as context into every AI chat call.
 *
 * Uses Lovable's built-in AI gateway (no OpenAI key needed).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Black Tech Street ASPIRE Program Data Assistant — also known as BTS GPT.

You help staff, funders, and researchers answer questions about:
- Event registrations and attendance
- Pre-event survey data (demographics, AI readiness, community connection)
- Post-event survey data (confidence changes, NPS, mindset shifts, lessons learned)
- Participant projects and submissions
- Grant reporting and impact metrics

IMPORTANT DEFINITIONS:
- "Registrants" = people who signed up (may or may not have attended)
- "Attendees" = people who actually showed up (checked_in = true)
- "No-shows" = registrants who did NOT check in
- "Pre-survey" = collected before the event (baseline)
- "Post-survey" = collected after the event (outcomes / impact)

WHEN ANSWERING:
- Be specific about registrants vs attendees
- Show exact counts and percentages when comparing groups
- For confidence/mindset shifts, compare pre vs post survey data
- Format comparisons as clear tables or bullet lists
- Be honest if data is missing or not yet collected
- Reference which event the data comes from

You have access to live data from the Black Tech Street database injected below. Use it to answer questions accurately.`;

// ── BUILD LIVE CONTEXT ────────────────────────────────────────

async function buildLiveContext(supabase: any, eventId?: string): Promise<string> {
  const lines: string[] = ["## LIVE DATA FROM BLACK TECH STREET DATABASE\n"];

  try {
    // ── Events ──────────────────────────────────────────────
    const eventsQuery = supabase
      .from("events")
      .select("id, name, event_date, event_type, location")
      .order("event_date", { ascending: false })
      .limit(10);

    if (eventId) eventsQuery.eq("id", eventId);

    const { data: events } = await eventsQuery;

    if (events && events.length > 0) {
      lines.push("### EVENTS");
      for (const e of events) {
        lines.push(`- ${e.name} (${e.event_date}) | Type: ${e.event_type} | ID: ${e.id}`);
      }
      lines.push("");
    }

    // ── Registration + Attendance Summary ───────────────────
    const regQuery = supabase
      .from("event_registrations")
      .select(`
        event_id,
        checked_in,
        age_range,
        zip_code,
        current_role,
        ai_experience_level,
        completed_survey,
        events!inner(name, event_date)
      `)
      .order("registered_at", { ascending: false })
      .limit(500);

    if (eventId) regQuery.eq("event_id", eventId);

    const { data: registrations } = await regQuery;

    if (registrations && registrations.length > 0) {
      // Group by event
      const byEvent: Record<string, any[]> = {};
      for (const r of registrations) {
        const key = `${r.events?.name} (${r.events?.event_date})`;
        if (!byEvent[key]) byEvent[key] = [];
        byEvent[key].push(r);
      }

      lines.push("### REGISTRATION & ATTENDANCE");
      for (const [eventName, regs] of Object.entries(byEvent)) {
        const total = regs.length;
        const attended = regs.filter(r => r.checked_in).length;
        const surveyed = regs.filter(r => r.completed_survey).length;
        const noShow = total - attended;
        lines.push(`**${eventName}**`);
        lines.push(`  - Registered: ${total} | Attended: ${attended} | No-shows: ${noShow} | Completed post-survey: ${surveyed}`);

        // Role breakdown
        const roles: Record<string, number> = {};
        for (const r of regs) {
          const role = r.current_role || "Not provided";
          roles[role] = (roles[role] || 0) + 1;
        }
        const topRoles = Object.entries(roles).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (topRoles.length > 0) {
          lines.push(`  - Top roles: ${topRoles.map(([r, n]) => `${r} (${n})`).join(", ")}`);
        }
      }
      lines.push("");
    }

    // ── Pre-Survey Summary ───────────────────────────────────
    const preQuery = supabase
      .from("survey_responses")
      .select(`
        event_id,
        ai_experience_level,
        ai_confidence_pre,
        age_range,
        current_role,
        industry,
        community_involvement,
        responses,
        events!inner(name, event_date)
      `)
      .eq("survey_type", "pre")
      .limit(500);

    if (eventId) preQuery.eq("event_id", eventId);

    const { data: preSurveys } = await preQuery;

    if (preSurveys && preSurveys.length > 0) {
      const byEvent: Record<string, any[]> = {};
      for (const s of preSurveys) {
        const key = `${s.events?.name} (${s.events?.event_date})`;
        if (!byEvent[key]) byEvent[key] = [];
        byEvent[key].push(s);
      }

      lines.push("### PRE-EVENT SURVEY DATA");
      for (const [eventName, surveys] of Object.entries(byEvent)) {
        lines.push(`**${eventName}** — ${surveys.length} responses`);

        // AI confidence (pre)
        const confScores = surveys.map(s => s.ai_confidence_pre).filter(n => n != null);
        if (confScores.length > 0) {
          const avg = (confScores.reduce((a, b) => a + b, 0) / confScores.length).toFixed(1);
          lines.push(`  - Avg AI confidence (pre): ${avg}/5 (n=${confScores.length})`);
        }

        // AI experience level
        const expLevels: Record<string, number> = {};
        for (const s of surveys) {
          const lvl = s.ai_experience_level || "Not provided";
          expLevels[lvl] = (expLevels[lvl] || 0) + 1;
        }
        const expBreakdown = Object.entries(expLevels).sort((a, b) => b[1] - a[1]);
        if (expBreakdown.length > 0) {
          lines.push(`  - AI experience: ${expBreakdown.map(([l, n]) => `${l} (${n})`).join(", ")}`);
        }

        // Industry
        const industries: Record<string, number> = {};
        for (const s of surveys) {
          const ind = s.industry || "Not provided";
          industries[ind] = (industries[ind] || 0) + 1;
        }
        const topIndustries = Object.entries(industries).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (topIndustries.length > 0) {
          lines.push(`  - Industries: ${topIndustries.map(([i, n]) => `${i} (${n})`).join(", ")}`);
        }
      }
      lines.push("");
    }

    // ── Post-Survey Summary ──────────────────────────────────
    const postQuery = supabase
      .from("survey_responses")
      .select(`
        event_id,
        ai_confidence_post,
        nps_score,
        biggest_aha,
        plan_to_use_ai,
        mindset_before,
        mindset_after,
        skill_strongest,
        felt_welcoming,
        suggestions,
        events!inner(name, event_date)
      `)
      .eq("survey_type", "post")
      .limit(500);

    if (eventId) postQuery.eq("event_id", eventId);

    const { data: postSurveys } = await postQuery;

    if (postSurveys && postSurveys.length > 0) {
      const byEvent: Record<string, any[]> = {};
      for (const s of postSurveys) {
        const key = `${s.events?.name} (${s.events?.event_date})`;
        if (!byEvent[key]) byEvent[key] = [];
        byEvent[key].push(s);
      }

      lines.push("### POST-EVENT SURVEY DATA");
      for (const [eventName, surveys] of Object.entries(byEvent)) {
        lines.push(`**${eventName}** — ${surveys.length} responses`);

        // AI confidence (post)
        const confScores = surveys.map(s => s.ai_confidence_post).filter(n => n != null);
        if (confScores.length > 0) {
          const avg = (confScores.reduce((a, b) => a + b, 0) / confScores.length).toFixed(1);
          lines.push(`  - Avg AI confidence (post): ${avg}/5 (n=${confScores.length})`);
        }

        // NPS
        const npsScores = surveys.map(s => s.nps_score).filter(n => n != null);
        if (npsScores.length > 0) {
          const promoters = npsScores.filter(n => n >= 9).length;
          const detractors = npsScores.filter(n => n <= 6).length;
          const nps = Math.round(((promoters - detractors) / npsScores.length) * 100);
          lines.push(`  - NPS: ${nps} (promoters: ${promoters}, detractors: ${detractors}, n=${npsScores.length})`);
        }

        // Mindset shift
        const mindsetBefore: Record<string, number> = {};
        const mindsetAfter: Record<string, number> = {};
        for (const s of surveys) {
          if (s.mindset_before) mindsetBefore[s.mindset_before] = (mindsetBefore[s.mindset_before] || 0) + 1;
          if (s.mindset_after) mindsetAfter[s.mindset_after] = (mindsetAfter[s.mindset_after] || 0) + 1;
        }
        if (Object.keys(mindsetBefore).length > 0) {
          lines.push(`  - Mindset before: ${Object.entries(mindsetBefore).map(([m, n]) => `${m} (${n})`).join(", ")}`);
        }
        if (Object.keys(mindsetAfter).length > 0) {
          lines.push(`  - Mindset after: ${Object.entries(mindsetAfter).map(([m, n]) => `${m} (${n})`).join(", ")}`);
        }

        // Sample aha moments (up to 5)
        const ahas = surveys.map(s => s.biggest_aha).filter(Boolean).slice(0, 5);
        if (ahas.length > 0) {
          lines.push(`  - Sample "aha moments":`);
          for (const aha of ahas) lines.push(`    • "${aha}"`);
        }

        // Sample AI use plans (up to 5)
        const plans = surveys.map(s => s.plan_to_use_ai).filter(Boolean).slice(0, 5);
        if (plans.length > 0) {
          lines.push(`  - Sample AI use plans:`);
          for (const plan of plans) lines.push(`    • "${plan}"`);
        }
      }
      lines.push("");
    }

    // ── Project Submissions ──────────────────────────────────
    const projQuery = supabase
      .from("project_submissions")
      .select(`
        event_id,
        project_title,
        project_description,
        project_category,
        full_name,
        team_name,
        file_url,
        demo_url,
        events!inner(name, event_date)
      `)
      .order("submitted_at", { ascending: false })
      .limit(100);

    if (eventId) projQuery.eq("event_id", eventId);

    const { data: projects } = await projQuery;

    if (projects && projects.length > 0) {
      const byEvent: Record<string, any[]> = {};
      for (const p of projects) {
        const key = `${p.events?.name} (${p.events?.event_date})`;
        if (!byEvent[key]) byEvent[key] = [];
        byEvent[key].push(p);
      }

      lines.push("### PROJECT SUBMISSIONS");
      for (const [eventName, projs] of Object.entries(byEvent)) {
        lines.push(`**${eventName}** — ${projs.length} projects`);
        for (const p of projs) {
          const submitter = p.team_name || p.full_name || "Unknown";
          const cat = p.project_category ? ` [${p.project_category}]` : "";
          lines.push(`  - "${p.project_title}"${cat} by ${submitter}${p.project_description ? `: ${p.project_description.slice(0, 120)}` : ""}`);
        }
      }
      lines.push("");
    }

  } catch (err) {
    console.error("Context builder error:", err);
    lines.push("⚠️ Some live data could not be loaded.");
  }

  return lines.join("\n");
}

// ── HANDLER ──────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { messages, dataContext, eventId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build live context from DB + any manually passed context
    const liveContext = await buildLiveContext(supabase, eventId);
    const fullContext = [liveContext, dataContext].filter(Boolean).join("\n\n---\n\n");
    const systemContent = `${SYSTEM_PROMPT}\n\n${fullContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
