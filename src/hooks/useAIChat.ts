import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function fetchCSV(path: string): Promise<Record<string, string>[]> {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return [];
    const text = await resp.text();
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    return result.data as Record<string, string>[];
  } catch {
    return [];
  }
}

async function fetchText(path: string): Promise<string> {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return "";
    return await resp.text();
  } catch {
    return "";
  }
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
  if (total === 0) return "  No data";
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  ${k}: ${v} (${Math.round(v / total * 100)}%)`)
    .join("\n");
}

function dedupeByName(rows: Record<string, string>[]): number {
  const seen = new Set<string>();
  for (const r of rows) {
    const fn = (r["First Name"] || r["first_name"] || "").toLowerCase().trim();
    const ln = (r["Last Name"] || r["last_name"] || "").toLowerCase().trim();
    if (fn || ln) seen.add(`${fn}_${ln}`);
  }
  return seen.size;
}

function dedupeByEmailCheckin(rows: Record<string, string>[], checkinField: string): number {
  const seen = new Set<string>();
  for (const r of rows) {
    const checkins = parseInt(r[checkinField] || "0");
    if (checkins < 1) continue;
    const email = (r["Email"] || r["email"] || "").toLowerCase().trim();
    if (email) seen.add(email);
  }
  return seen.size;
}

async function buildDataContext(): Promise<string> {
  const [
    juneSignupRows, sept27SignupRows, dec6SignupRows,
    juneDay1Rows, juneDay2Rows, juneDay2NodupeRows,
    sept27AttRows, dec6AttRows, ltfRows,
    gaceReport
  ] = await Promise.all([
    fetchCSV("/signups/june-aspire-signup.csv"),
    fetchCSV("/signups/sept27-signup.csv"),
    fetchCSV("/signups/dec6-registration.csv"),
    fetchCSV("/attendance/june-aspire-day1.csv"),
    fetchCSV("/attendance/june-aspire-day2.csv"),
    fetchCSV("/attendance/june-aspire-day2-nodupe.csv"),
    fetchCSV("/attendance/sept27-attendance.csv"),
    fetchCSV("/attendance/dec6-attendance.csv"),
    fetchCSV("/attendance/ltf-dec13-feedback.csv"),
    fetchText("/signups/g-ace-quarterly-report.txt"),
  ]);

  const juneDay1Unique = dedupeByName(juneDay1Rows);
  const juneDay2Unique = dedupeByName(juneDay2Rows);
  const sept27Unique = dedupeByEmailCheckin(sept27AttRows, "Total check-ins");
  const dec6Unique = dedupeByEmailCheckin(dec6AttRows, "Total check-ins");

  // Find the right field names for June signup (has trailing spaces)
  const juneHeaders = juneSignupRows[0] ? Object.keys(juneSignupRows[0]) : [];
  const findField = (rows: Record<string, string>[], ...candidates: string[]): string => {
    if (!rows[0]) return candidates[0] || "";
    const headers = Object.keys(rows[0]);
    for (const c of candidates) {
      const match = headers.find(h => h.trim().toLowerCase() === c.toLowerCase());
      if (match) return match;
    }
    return candidates[0] || "";
  };

  const juneRoleField = findField(juneSignupRows, "What Best Describes Your Current Role?");
  const juneAgeField = findField(juneSignupRows, "What is your age range?");
  const juneRaceField = findField(juneSignupRows, "What's Your Racial Identity?");
  const juneIncomeField = findField(juneSignupRows, "Which of the following ranges best describes your total household income before taxes last year?");
  const juneEducField = findField(juneSignupRows, "What's The Highest Level Of Education You've Completed");

  const sept27RoleField = findField(sept27SignupRows, "What best describes your current role?");
  const sept27AgeField = findField(sept27SignupRows, "What is your age range?");
  const sept27AIField = findField(sept27SignupRows, "Which best describes your current level of experience using AI tools?");

  const dec6RoleField = findField(dec6SignupRows, "What best describes your current role?");
  const dec6AgeField = findField(dec6SignupRows, "What is your age range?");
  const dec6IndustryField = findField(dec6SignupRows, "What best describes your current industry?");
  const dec6AIField = findField(dec6SignupRows, "Which best describes your current level of experience using AI tools?");
  const dec6RaceField = findField(dec6SignupRows, "What's Your Racial Identity?");
  const dec6IncomeField = findField(dec6SignupRows, "Which of the following ranges best describes your total household income before taxes last year?");

  return `ASPIRE PROGRAM DATA SUMMARY (as of February 2026):

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

Education:
${formatBreakdown(countByField(juneSignupRows, juneEducField), juneSignupRows.length)}

Racial Identity:
${formatBreakdown(countByField(juneSignupRows, juneRaceField), juneSignupRows.length)}

Income:
${formatBreakdown(countByField(juneSignupRows, juneIncomeField), juneSignupRows.length)}

=== SEPT 27 BUILD DAY (September 27, 2025) ===
Registrants: ${sept27SignupRows.length} sign-ups
RSVPs in attendance file: ${sept27AttRows.length}
Confirmed Attendees (check-ins >= 1): ${sept27Unique} unique

Demographics (Registrants):
Age Ranges:
${formatBreakdown(countByField(sept27SignupRows, sept27AgeField), sept27SignupRows.length)}

Roles:
${formatBreakdown(countByField(sept27SignupRows, sept27RoleField), sept27SignupRows.length)}

AI Experience:
${formatBreakdown(countByField(sept27SignupRows, sept27AIField), sept27SignupRows.length)}

=== DEC 6 WORKSHOP (December 6, 2025) ===
Registrants: ${dec6SignupRows.length} sign-ups
Check-in records: ${dec6AttRows.length}
Confirmed Attendees (check-ins >= 1): ${dec6Unique} unique

Demographics (Registrants):
Age Ranges:
${formatBreakdown(countByField(dec6SignupRows, dec6AgeField), dec6SignupRows.length)}

Roles:
${formatBreakdown(countByField(dec6SignupRows, dec6RoleField), dec6SignupRows.length)}

Industry:
${formatBreakdown(countByField(dec6SignupRows, dec6IndustryField), dec6SignupRows.length)}

AI Experience:
${formatBreakdown(countByField(dec6SignupRows, dec6AIField), dec6SignupRows.length)}

Racial Identity:
${formatBreakdown(countByField(dec6SignupRows, dec6RaceField), dec6SignupRows.length)}

Income:
${formatBreakdown(countByField(dec6SignupRows, dec6IncomeField), dec6SignupRows.length)}

=== DEC 13 LEAD THE FUTURE (December 13, 2025) ===
Student Feedback Submissions: ${ltfRows.length}

=== G-ACE QUARTERLY REPORT ===
${gaceReport}
`;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataContext, setDataContext] = useState<string>("");
  const contextLoaded = useRef(false);

  // Load data context once on mount
  useEffect(() => {
    if (!contextLoaded.current) {
      contextLoaded.current = true;
      buildDataContext().then(ctx => {
        console.log("AI context loaded, length:", ctx.length);
        setDataContext(ctx);
      });
    }
  }, []);

  const send = useCallback(async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: updatedMessages, dataContext }),
      });

      if (resp.status === 429) {
        toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment and try again.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: "Credits Exhausted", description: "AI usage credits have been used up. Please add more credits.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        throw new Error("Failed to start stream");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

      setIsLoading(false);
    } catch (e) {
      console.error("AI chat error:", e);
      toast({ title: "Error", description: "Failed to get AI response. Please try again.", variant: "destructive" });
      setIsLoading(false);
    }
  }, [messages, dataContext]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, send, clearChat, dataLoaded: dataContext.length > 100 };
}
