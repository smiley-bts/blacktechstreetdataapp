import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

export interface DemographicCategory {
  label: string;
  registrants: { value: string; count: number; pct: number }[];
  attendees: { value: string; count: number; pct: number }[];
  registrantTotal: number;
  attendeeTotal: number;
}

export interface EventSignupDemographics {
  categories: DemographicCategory[];
  registrantCount: number;
  attendeeCount: number;
  loading: boolean;
}

type Row = Record<string, string>;

async function loadCSV(path: string): Promise<Row[]> {
  try {
    const resp = await fetch(path);
    if (!resp.ok) return [];
    const text = await resp.text();
    const result = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
    return result.data;
  } catch {
    return [];
  }
}

function findField(rows: Row[], ...candidates: string[]): string {
  if (!rows[0]) return candidates[0] || "";
  const headers = Object.keys(rows[0]);
  for (const c of candidates) {
    const match = headers.find(h => h.trim().toLowerCase() === c.toLowerCase());
    if (match) return match;
  }
  return candidates[0] || "";
}

function countByField(rows: Row[], field: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const val = (row[field] || "").trim();
    if (!val) continue;
    counts.set(val, (counts.get(val) || 0) + 1);
  }
  return counts;
}

function mapToSorted(counts: Map<string, number>, total: number): { value: string; count: number; pct: number }[] {
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

function buildCategory(label: string, regRows: Row[], attRows: Row[], field: string): DemographicCategory {
  const regCounts = countByField(regRows, field);
  const attCounts = countByField(attRows, field);
  const regTotal = regRows.length;
  const attTotal = attRows.length;
  return {
    label,
    registrants: mapToSorted(regCounts, regTotal),
    attendees: mapToSorted(attCounts, attTotal),
    registrantTotal: regTotal,
    attendeeTotal: attTotal,
  };
}

// Match attendees back to signup rows by email (or name fallback)
function matchAttendees(
  signupRows: Row[],
  attendanceRows: Row[],
  signupEmailField: string,
  attendanceEmailField: string,
  checkinField?: string,
): Row[] {
  // Build set of attendee emails
  const attendeeEmails = new Set<string>();
  for (const row of attendanceRows) {
    if (checkinField) {
      const checkins = parseInt(row[checkinField] || "0", 10);
      if (checkins < 1) continue;
    }
    const email = (row[attendanceEmailField] || "").toLowerCase().trim();
    if (email) attendeeEmails.add(email);
  }

  // Filter signup rows to those who attended
  return signupRows.filter(row => {
    const email = (row[signupEmailField] || "").toLowerCase().trim();
    return email && attendeeEmails.has(email);
  });
}

// For June, match by name since attendance doesn't have emails
function matchAttendeesByName(
  signupRows: Row[],
  attendanceRows: Row[],
  signupFirstField: string,
  signupLastField: string,
): Row[] {
  const attendeeNames = new Set<string>();
  for (const row of attendanceRows) {
    const vals = Object.values(row);
    // Day 1 has unnamed columns: firstName at index 0, lastName at index 1
    const fn = (row["First Name"] || vals[0] || "").toLowerCase().trim();
    const ln = (row["Last Name"] || vals[1] || "").toLowerCase().trim();
    if (fn || ln) attendeeNames.add(`${fn}_${ln}`);
  }

  return signupRows.filter(row => {
    const fn = (row[signupFirstField] || "").toLowerCase().trim();
    const ln = (row[signupLastField] || "").toLowerCase().trim();
    return attendeeNames.has(`${fn}_${ln}`);
  });
}

export type EventKey = "june2025Event" | "sept27BuildDay" | "dec6Workshop";

export function useSignupDemographics(eventKey: EventKey): EventSignupDemographics {
  const [data, setData] = useState<{ signup: Row[]; attended: Row[] }>({ signup: [], attended: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (eventKey === "june2025Event") {
          const [signup, day1, day2] = await Promise.all([
            loadCSV("/signups/june-aspire-signup.csv"),
            loadCSV("/attendance/june-aspire-day1.csv"),
            loadCSV("/attendance/june-aspire-day2.csv"),
          ]);
          const allAttendance = [...day1, ...day2];
          const firstField = findField(signup, "First Name");
          const lastField = findField(signup, "Last Name");
          const attended = matchAttendeesByName(signup, allAttendance, firstField, lastField);
          setData({ signup, attended });
        } else if (eventKey === "sept27BuildDay") {
          const [signup, att] = await Promise.all([
            loadCSV("/signups/sept27-signup.csv"),
            loadCSV("/attendance/sept27-attendance.csv"),
          ]);
          const emailField = findField(signup, "What's your email?");
          const attended = matchAttendees(signup, att, emailField, "Email", "Total check-ins");
          setData({ signup, attended });
        } else if (eventKey === "dec6Workshop") {
          const [signup, att] = await Promise.all([
            loadCSV("/signups/dec6-registration.csv"),
            loadCSV("/attendance/dec6-attendance.csv"),
          ]);
          const emailField = findField(signup, "What's your email?");
          const attended = matchAttendees(signup, att, emailField, "Email", "Total check-ins");
          setData({ signup, attended });
        }
      } catch (err) {
        console.error("Failed to load signup demographics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventKey]);

  const demographics = useMemo((): EventSignupDemographics => {
    if (loading || !data.signup.length) {
      return { categories: [], registrantCount: 0, attendeeCount: 0, loading };
    }

    const { signup, attended } = data;
    const categories: DemographicCategory[] = [];

    if (eventKey === "june2025Event") {
      const ageField = findField(signup, "What is your age range?");
      const roleField = findField(signup, "What Best Describes Your Current Role?");
      const raceField = findField(signup, "What's Your Racial Identity?");
      const incomeField = findField(signup, "Which of the following ranges best describes your total household income before taxes last year?");

      if (ageField) categories.push(buildCategory("Age Range", signup, attended, ageField));
      if (roleField) categories.push(buildCategory("Role", signup, attended, roleField));
      if (raceField) categories.push(buildCategory("Race", signup, attended, raceField));
      if (incomeField) categories.push(buildCategory("Income", signup, attended, incomeField));
    } else if (eventKey === "sept27BuildDay") {
      const ageField = findField(signup, "What is your age range?");
      const roleField = findField(signup, "What best describes your current role?");
      const aiField = findField(signup, "Which best describes your current level of experience using AI tools?");

      if (ageField) categories.push(buildCategory("Age Range", signup, attended, ageField));
      if (roleField) categories.push(buildCategory("Role", signup, attended, roleField));
      if (aiField) categories.push(buildCategory("AI Experience", signup, attended, aiField));
    } else if (eventKey === "dec6Workshop") {
      const ageField = findField(signup, "What is your age range?");
      const roleField = findField(signup, "What best describes your current role?");
      const raceField = findField(signup, "What's your racial identity?");
      const incomeField = findField(signup, "Which of the following ranges best describes your total household income before taxes last year?");
      const industryField = findField(signup, "What best describes your current industry?");
      const aiField = findField(signup, "Which best describes your current level of experience using AI tools?");

      if (ageField) categories.push(buildCategory("Age Range", signup, attended, ageField));
      if (roleField) categories.push(buildCategory("Role", signup, attended, roleField));
      if (raceField) categories.push(buildCategory("Race", signup, attended, raceField));
      if (incomeField) categories.push(buildCategory("Income", signup, attended, incomeField));
      if (industryField) categories.push(buildCategory("Industry", signup, attended, industryField));
      if (aiField) categories.push(buildCategory("AI Experience", signup, attended, aiField));
    }

    return {
      categories,
      registrantCount: signup.length,
      attendeeCount: attended.length,
      loading: false,
    };
  }, [data, loading, eventKey]);

  return demographics;
}
