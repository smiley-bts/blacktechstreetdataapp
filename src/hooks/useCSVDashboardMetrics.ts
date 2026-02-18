import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

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

function dedupeByEmail(rows: Row[], emailField: string): Row[] {
  const seen = new Set<string>();
  return rows.filter(r => {
    const e = (r[emailField] || "").toLowerCase().trim();
    if (!e || seen.has(e)) return false;
    seen.add(e);
    return true;
  });
}

function hasName(r: Row, firstField: string, lastField: string): boolean {
  return !!(r[firstField] || r[lastField] || "").trim();
}

export interface EventMetric {
  name: string;
  registrants: number;
  attendees: number;
  rate: number;
}

export interface CSVDashboardMetrics {
  totalRegistrants: number;
  totalAttendees: number;
  overallRate: number;
  totalEvents: number;
  events: EventMetric[];
  loading: boolean;
}

export function useCSVDashboardMetrics(): CSVDashboardMetrics {
  const [data, setData] = useState<{
    juneSignup: Row[];
    juneMaster: Row[];
    septSignup: Row[];
    decSignup: Row[];
    septAtt: Row[];
    decAtt: Row[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [juneSignup, juneMaster, septSignup, decSignup, septAtt, decAtt] = await Promise.all([
          loadCSV("/signups/june-aspire-signup.csv"),
          loadCSV("/aspire-june2025-attendance.csv"),
          loadCSV("/signups/sept27-signup.csv"),
          loadCSV("/signups/dec6-registration.csv"),
          loadCSV("/attendance/sept27-attendance.csv"),
          loadCSV("/attendance/dec6-attendance.csv"),
        ]);
        setData({ juneSignup, juneMaster, septSignup, decSignup, septAtt, decAtt });
      } catch (err) {
        console.error("Failed to load CSV metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return useMemo(() => {
    if (loading || !data) {
      return { totalRegistrants: 0, totalAttendees: 0, overallRate: 0, totalEvents: 4, events: [], loading };
    }

    // ── June ──────────────────────────────────────────────────────────────────
    // Registrants: signup rows that have a name (filters out empty/partial rows)
    const juneRegistrants = data.juneSignup.filter(r =>
      (r["What's Your Full Name?"] || r["First Name"] || r["Last Name"] || "").trim()
    );
    const juneReg = juneRegistrants.length;

    // Attendees: master file rows where Day1 OR Day2 = "Yes"
    const juneAtt = data.juneMaster.filter(r => {
      const d1 = (r["Day1 Attendance"] || "").toLowerCase() === "yes";
      const d2 = (r["Day2 Attendance"] || "").toLowerCase() === "yes";
      return d1 || d2;
    }).length;

    // ── Sept 27 ───────────────────────────────────────────────────────────────
    // Registrants: signup rows with a first or last name (deduped by email)
    const septValidSignups = data.septSignup.filter(r =>
      hasName(r, "What's your first name?", "What's your last name?")
    );
    const septDeduped = dedupeByEmail(septValidSignups, "What's your email?");
    const septReg = septDeduped.length;

    // Attendees: check-in file, checked in >= 1, deduped by email
    const septCheckedIn = data.septAtt.filter(r => parseInt(r["Total check-ins"] || "0", 10) >= 1);
    const septAttDeduped = dedupeByEmail(septCheckedIn, "Email");
    const septAtt = septAttDeduped.length;

    // ── Dec 6 ─────────────────────────────────────────────────────────────────
    // Registrants: signup rows with a first or last name (deduped by email)
    const decValidSignups = data.decSignup.filter(r =>
      hasName(r, "What's your first name?", "What's your last name?")
    );
    const decDeduped = dedupeByEmail(decValidSignups, "What's your email?");
    const decReg = decDeduped.length;

    // Attendees: check-in file, checked in >= 1, deduped by email
    const decCheckedIn = data.decAtt.filter(r => parseInt(r["Total check-ins"] || "0", 10) >= 1);
    const decAttDeduped = dedupeByEmail(decCheckedIn, "Email");
    const decAtt = decAttDeduped.length;

    const events: EventMetric[] = [
      { name: "June ASPIRE", registrants: juneReg, attendees: juneAtt, rate: juneReg > 0 ? Math.round((juneAtt / juneReg) * 100) : 0 },
      { name: "Sept Build Day", registrants: septReg, attendees: septAtt, rate: septReg > 0 ? Math.round((septAtt / septReg) * 100) : 0 },
      { name: "Dec Workshop", registrants: decReg, attendees: decAtt, rate: decReg > 0 ? Math.round((decAtt / decReg) * 100) : 0 },
    ];

    const totalRegistrants = juneReg + septReg + decReg;
    const totalAttendees = juneAtt + septAtt + decAtt;
    const overallRate = totalRegistrants > 0 ? Math.round((totalAttendees / totalRegistrants) * 100) : 0;

    return { totalRegistrants, totalAttendees, overallRate, totalEvents: 4, events, loading: false };
  }, [data, loading]);
}
