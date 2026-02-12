import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Pre-built data context for the AI - loaded once per cold start
const SYSTEM_PROMPT = `You are the Black Tech Street ASPIRE Program Data Assistant. You help staff answer questions about program sign-ups, attendance, demographics, and grant reporting (G-ACE quarterly report).

IMPORTANT DEFINITIONS:
- "Registrants" or "Sign-ups" = people who registered for an event (from sign-up CSVs). They may or may not have attended.
- "Attendees" = people who actually showed up (from attendance CSVs with check-in data).
- "No-shows" = registrants who did NOT attend (signed up but no matching attendance record).

When answering questions:
- Be specific about whether you're talking about registrants vs attendees
- Give exact counts when possible
- For demographic breakdowns, show percentages
- Format tables using markdown when showing data comparisons
- If data says "Not provided" in the G-ACE report, say so honestly
- Reference which data source you're pulling from

You have access to the following data context that will be provided with each message.`;

async function fetchTextFile(url: string): Promise<string> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return "";
    return await resp.text();
  } catch {
    return "";
  }
}

function parseCSV(text: string): Record<string, string>[] {
  if (!text.trim()) return [];
  const lines = text.split("\n");
  if (lines.length < 2) return [];
  
  // Parse header - handle quoted fields
  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

function countByField(rows: Record<string, string>[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const val = (row[field] || "").trim();
    if (!val) continue;
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

function formatBreakdown(counts: Record<string, number>, total: number): string {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  ${k}: ${v} (${Math.round(v / total * 100)}%)`)
    .join("\n");
}

async function buildDataContext(baseUrl: string): Promise<string> {
  // Fetch all data files in parallel
  const [
    juneSignup, sept27Signup, dec6Signup,
    juneDay1, juneDay2, juneDay2Nodupe,
    sept27Att, dec6Att, ltfFeedback,
    gaceReport
  ] = await Promise.all([
    fetchTextFile(`${baseUrl}/signups/june-aspire-signup.csv`),
    fetchTextFile(`${baseUrl}/signups/sept27-signup.csv`),
    fetchTextFile(`${baseUrl}/signups/dec6-registration.csv`),
    fetchTextFile(`${baseUrl}/attendance/june-aspire-day1.csv`),
    fetchTextFile(`${baseUrl}/attendance/june-aspire-day2.csv`),
    fetchTextFile(`${baseUrl}/attendance/june-aspire-day2-nodupe.csv`),
    fetchTextFile(`${baseUrl}/attendance/sept27-attendance.csv`),
    fetchTextFile(`${baseUrl}/attendance/dec6-attendance.csv`),
    fetchTextFile(`${baseUrl}/attendance/ltf-dec13-feedback.csv`),
    fetchTextFile(`${baseUrl}/signups/g-ace-quarterly-report.txt`),
  ]);

  // Parse CSVs
  const juneSignupRows = parseCSV(juneSignup);
  const sept27SignupRows = parseCSV(sept27Signup);
  const dec6SignupRows = parseCSV(dec6Signup);
  const juneDay1Rows = parseCSV(juneDay1);
  const juneDay2Rows = parseCSV(juneDay2);
  const juneDay2NodupeRows = parseCSV(juneDay2Nodupe);
  const sept27AttRows = parseCSV(sept27Att);
  const dec6AttRows = parseCSV(dec6Att);
  const ltfRows = parseCSV(ltfFeedback);

  // Deduplicate attendance
  const dedupeByName = (rows: Record<string, string>[]): number => {
    const seen = new Set<string>();
    for (const r of rows) {
      const fn = (r["First Name"] || r["first_name"] || "").toLowerCase().trim();
      const ln = (r["Last Name"] || r["last_name"] || "").toLowerCase().trim();
      if (fn || ln) seen.add(`${fn}_${ln}`);
    }
    return seen.size;
  };

  const dedupeByEmail = (rows: Record<string, string>[], checkinField: string): number => {
    const seen = new Set<string>();
    for (const r of rows) {
      const checkins = parseInt(r[checkinField] || "0");
      if (checkins < 1) continue;
      const email = (r["Email"] || r["email"] || "").toLowerCase().trim();
      if (email) seen.add(email);
    }
    return seen.size;
  };

  const juneDay1Unique = dedupeByName(juneDay1Rows);
  const juneDay2Unique = dedupeByName(juneDay2Rows);
  const sept27Unique = dedupeByEmail(sept27AttRows, "Total check-ins");
  const dec6Unique = dedupeByEmail(dec6AttRows, "Total check-ins");

  // Build demographic breakdowns for sign-ups
  const juneRoleField = "What Best Describes Your Current Role? " in (juneSignupRows[0] || {}) 
    ? "What Best Describes Your Current Role? " 
    : "What best describes your current role?";
  const juneAgeField = "What is your age range? " in (juneSignupRows[0] || {})
    ? "What is your age range? "
    : "What is your age range?";
  const juneRaceField = "What's Your Racial Identity? " in (juneSignupRows[0] || {})
    ? "What's Your Racial Identity? "
    : "What's Your Racial Identity?";
  const juneIncomeField = "Which of the following ranges best describes your total household income before taxes last year?" in (juneSignupRows[0] || {})
    ? "Which of the following ranges best describes your total household income before taxes last year?"
    : "";

  let context = `ASPIRE PROGRAM DATA SUMMARY (as of February 2026):

=== JUNE ASPIRE (June 27-28, 2025) ===
Registrants: ${juneSignupRows.length} sign-ups
Day 1 Attendees: ${juneDay1Rows.length} raw / ${juneDay1Unique} unique
Day 2 Attendees: ${juneDay2Rows.length} raw / ${juneDay2Unique} unique
Day 2 Unique-to-Day-2 Only: ${juneDay2NodupeRows.length}

Demographics (Registrants):
Age Ranges:
${formatBreakdown(countByField(juneSignupRows, juneAgeField), juneSignupRows.length)}

Roles:
${formatBreakdown(countByField(juneSignupRows, juneRoleField), juneSignupRows.length)}

Racial Identity:
${formatBreakdown(countByField(juneSignupRows, juneRaceField), juneSignupRows.length)}
${juneIncomeField ? `
Income:
${formatBreakdown(countByField(juneSignupRows, juneIncomeField), juneSignupRows.length)}` : ""}

=== SEPT 27 BUILD DAY (September 27, 2025) ===
Registrants: ${sept27SignupRows.length} sign-ups
RSVPs in attendance file: ${sept27AttRows.length}
Confirmed Attendees (check-ins >= 1): ${sept27Unique} unique

Demographics (Registrants):
Age Ranges:
${formatBreakdown(countByField(sept27SignupRows, "What is your age range?"), sept27SignupRows.length)}

Roles:
${formatBreakdown(countByField(sept27SignupRows, "What best describes your current role?"), sept27SignupRows.length)}

AI Experience:
${formatBreakdown(countByField(sept27SignupRows, "Which best describes your current level of experience using AI tools?"), sept27SignupRows.length)}

=== DEC 6 WORKSHOP (December 6, 2025) ===
Registrants: ${dec6SignupRows.length} sign-ups
Check-in records: ${dec6AttRows.length}
Confirmed Attendees (check-ins >= 1): ${dec6Unique} unique

Demographics (Registrants):
Age Ranges:
${formatBreakdown(countByField(dec6SignupRows, "What is your age range?"), dec6SignupRows.length)}

Roles:
${formatBreakdown(countByField(dec6SignupRows, "What best describes your current role?"), dec6SignupRows.length)}

Industry:
${formatBreakdown(countByField(dec6SignupRows, "What best describes your current industry?"), dec6SignupRows.length)}

AI Experience:
${formatBreakdown(countByField(dec6SignupRows, "Which best describes your current level of experience using AI tools?"), dec6SignupRows.length)}

=== DEC 13 LEAD THE FUTURE (December 13, 2025) ===
Student Feedback Submissions: ${ltfRows.length}

=== G-ACE QUARTERLY REPORT ===
${gaceReport}
`;

  return context;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Determine base URL for fetching CSV files
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    // Use the origin to fetch public files, or fall back to a known URL
    const baseUrl = origin.replace(/\/$/, "");

    // Build data context
    const dataContext = await buildDataContext(baseUrl);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n${dataContext}` },
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
