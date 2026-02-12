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

function findField(rows: Row[], ...candidates: string[]): string {
  if (!rows[0]) return candidates[0] || "";
  const headers = Object.keys(rows[0]);
  for (const c of candidates) {
    const match = headers.find(h => h.trim().toLowerCase() === c.toLowerCase());
    if (match) return match;
  }
  return candidates[0] || "";
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

function dedupeByName(rows: Row[]): Row[] {
  const seen = new Set<string>();
  return rows.filter(r => {
    const vals = Object.values(r);
    const fn = (r["First Name"] || vals[0] || "").toLowerCase().trim();
    const ln = (r["Last Name"] || vals[1] || "").toLowerCase().trim();
    const key = `${fn}_${ln}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    septSignup: Row[];
    decSignup: Row[];
    juneAtt1: Row[];
    juneAtt2: Row[];
    septAtt: Row[];
    decAtt: Row[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [juneSignup, septSignup, decSignup, juneAtt1, juneAtt2, septAtt, decAtt] = await Promise.all([
          loadCSV("/signups/june-aspire-signup.csv"),
          loadCSV("/signups/sept27-signup.csv"),
          loadCSV("/signups/dec6-registration.csv"),
          loadCSV("/attendance/june-aspire-day1.csv"),
          loadCSV("/attendance/june-aspire-day2.csv"),
          loadCSV("/attendance/sept27-attendance.csv"),
          loadCSV("/attendance/dec6-attendance.csv"),
        ]);
        setData({ juneSignup, septSignup, decSignup, juneAtt1, juneAtt2, septAtt, decAtt });
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

    // June: name-based dedup
    const juneReg = data.juneSignup.length;
    const juneCombined = [...data.juneAtt1, ...data.juneAtt2];
    const juneDeduped = dedupeByName(juneCombined);
    const juneAtt = juneDeduped.length;

    // Sept: email-based, checkins >= 1
    const septReg = data.septSignup.length;
    const septAttended = data.septAtt.filter(r => parseInt(r["Total check-ins"] || "0", 10) >= 1);
    const septDeduped = dedupeByEmail(septAttended, "Email");
    const septAtt = septDeduped.length;

    // Dec: email-based, checkins >= 1
    const decReg = data.decSignup.length;
    const decAttended = data.decAtt.filter(r => parseInt(r["Total check-ins"] || "0", 10) >= 1);
    const decDeduped = dedupeByEmail(decAttended, "Email");
    const decAtt = decDeduped.length;

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
