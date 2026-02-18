import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

export interface AttendeeRow {
  firstName: string;
  lastName: string;
  email?: string;
  checkins?: number;
}

export interface EventAttendanceData {
  rawRows: AttendeeRow[];
  deduplicatedRows: AttendeeRow[];  // "New Attendees" = first-timers across all ASPIRE events
  rawCount: number;
  dedupeCount: number;  // count of new attendees
  duplicateRate: number;
  loading: boolean;
}

interface MultiDayEventData {
  day1: EventAttendanceData;
  day2: EventAttendanceData;
  combined: EventAttendanceData;
}

function normalizeKey(firstName: string, lastName: string): string {
  return `${(firstName || "").toLowerCase().trim()}_${(lastName || "").toLowerCase().trim()}`;
}

function normalizeEmail(email: string): string {
  return (email || "").toLowerCase().trim();
}

function deduplicateByName(rows: AttendeeRow[]): AttendeeRow[] {
  const seen = new Map<string, AttendeeRow>();
  for (const row of rows) {
    const key = normalizeKey(row.firstName, row.lastName);
    if (!seen.has(key)) {
      seen.set(key, row);
    }
  }
  return Array.from(seen.values());
}

function deduplicateByEmail(rows: AttendeeRow[]): AttendeeRow[] {
  const seen = new Map<string, AttendeeRow>();
  for (const row of rows) {
    const key = normalizeEmail(row.email || "");
    if (key && !seen.has(key)) {
      seen.set(key, row);
    }
  }
  return Array.from(seen.values());
}

/**
 * Filter rows to only "New Attendees" — people who have NOT appeared
 * in any of the prior events' attendee sets.
 * Uses email matching where available, falls back to name matching.
 */
function filterNewAttendees(rows: AttendeeRow[], priorAttendees: AttendeeRow[]): AttendeeRow[] {
  const priorEmails = new Set<string>();
  const priorNames = new Set<string>();

  for (const p of priorAttendees) {
    const email = normalizeEmail(p.email || "");
    if (email) priorEmails.add(email);
    priorNames.add(normalizeKey(p.firstName, p.lastName));
  }

  return rows.filter(row => {
    const email = normalizeEmail(row.email || "");
    if (email && priorEmails.has(email)) return false;
    if (priorNames.has(normalizeKey(row.firstName, row.lastName))) return false;
    return true;
  });
}

function buildAttendanceData(raw: AttendeeRow[], newAttendees: AttendeeRow[]): EventAttendanceData {
  const rawCount = raw.length;
  const dedupeCount = newAttendees.length;
  const duplicateRate = rawCount > 0 ? Math.round(((rawCount - dedupeCount) / rawCount) * 100) : 0;
  return { rawRows: raw, deduplicatedRows: newAttendees, rawCount, dedupeCount, duplicateRate, loading: false };
}

async function loadCSV(path: string): Promise<Papa.ParseResult<Record<string, string>>> {
  const response = await fetch(path);
  const text = await response.text();
  return Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
}

export function useEventAttendanceCSV() {
  const [juneDay1Raw, setJuneDay1Raw] = useState<AttendeeRow[]>([]);
  const [juneDay2Raw, setJuneDay2Raw] = useState<AttendeeRow[]>([]);
  const [juneDay2NoDupe, setJuneDay2NoDupe] = useState<AttendeeRow[]>([]);
  const [sept27Raw, setSept27Raw] = useState<AttendeeRow[]>([]);
  const [dec6Raw, setDec6Raw] = useState<AttendeeRow[]>([]);
  const [ltfRaw, setLtfRaw] = useState<AttendeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [day1Res, day2Res, day2NdRes, sept27Res, dec6Res, ltfRes] = await Promise.all([
          loadCSV("/attendance/june-aspire-day1.csv"),
          loadCSV("/attendance/june-aspire-day2.csv"),
          loadCSV("/attendance/june-aspire-day2-nodupe.csv"),
          loadCSV("/attendance/sept27-attendance.csv"),
          loadCSV("/attendance/dec6-attendance.csv"),
          loadCSV("/attendance/ltf-dec13-feedback.csv"),
        ]);

        // June Day 1: columns are unnamed (index-based) - the CSV has no proper headers
        // Format: ,FirstName,LastName,Yes/Attendance,Totals
        const day1Rows: AttendeeRow[] = [];
        for (const row of day1Res.data) {
          const vals = Object.values(row);
          const firstName = (vals[0] || "").toString().trim();
          const lastName = (vals[1] || "").toString().trim();
          if (firstName && lastName) {
            day1Rows.push({ firstName, lastName });
          }
        }
        setJuneDay1Raw(day1Rows);

        // June Day 2: First Name, Last Name, Day 2 Attendance
        const day2Rows: AttendeeRow[] = [];
        for (const row of day2Res.data) {
          const firstName = (row["First Name"] || "").trim();
          const lastName = (row["Last Name"] || "").trim();
          if (firstName && lastName) {
            day2Rows.push({ firstName, lastName });
          }
        }
        setJuneDay2Raw(day2Rows);

        // June Day 2 No Dupes
        const day2NdRows: AttendeeRow[] = [];
        for (const row of day2NdRes.data) {
          const firstName = (row["First Name"] || "").trim();
          const lastName = (row["Last Name"] || "").trim();
          if (firstName && lastName) {
            day2NdRows.push({ firstName, lastName });
          }
        }
        setJuneDay2NoDupe(day2NdRows);

        // Sept 27: has Email, Total check-ins columns. Attended = checkins >= 1
        const sept27Rows: AttendeeRow[] = [];
        for (const row of sept27Res.data) {
          const firstName = (row["First name"] || "").trim();
          const lastName = (row["Last name"] || "").trim();
          const email = (row["Email"] || "").trim();
          const checkins = parseInt(row["Total check-ins"] || "0", 10);
          if (firstName || lastName) {
            sept27Rows.push({ firstName, lastName, email, checkins });
          }
        }
        setSept27Raw(sept27Rows);

        // Dec 6: same format as Sept 27
        const dec6Rows: AttendeeRow[] = [];
        for (const row of dec6Res.data) {
          const firstName = (row["First name"] || "").trim();
          const lastName = (row["Last name"] || "").trim();
          const email = (row["Email"] || "").trim();
          const checkins = parseInt(row["Total check-ins"] || "0", 10);
          if (firstName || lastName) {
            dec6Rows.push({ firstName, lastName, email, checkins });
          }
        }
        setDec6Raw(dec6Rows);

        // LTF: feedback submissions = attendees
        const ltfRows: AttendeeRow[] = [];
        for (const row of ltfRes.data) {
          const submissionId = (row["Submission ID"] || "").trim();
          if (submissionId) {
            ltfRows.push({ firstName: submissionId, lastName: "" });
          }
        }
        setLtfRaw(ltfRows);
      } catch (err) {
        console.error("Failed to load attendance CSVs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // ── June ASPIRE (first event — all unique attendees are "new") ──────────────
  const juneAllAttendees = useMemo(() => {
    if (loading) return [];
    return deduplicateByName([...juneDay1Raw, ...juneDay2Raw]);
  }, [juneDay1Raw, juneDay2Raw, loading]);

  const juneDay1 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    // June Day 1: first event ever — all unique attendees are new
    const deduped = deduplicateByName(juneDay1Raw);
    return buildAttendanceData(juneDay1Raw, deduped);
  }, [juneDay1Raw, loading]);

  const juneDay2 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    // June Day 2: new = not in Day 1
    const newAttendees = filterNewAttendees(deduplicateByName(juneDay2Raw), juneDay1Raw);
    return buildAttendanceData(juneDay2Raw, newAttendees);
  }, [juneDay1Raw, juneDay2Raw, loading]);

  const juneCombined = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    const allRaw = [...juneDay1Raw, ...juneDay2Raw];
    // Combined: unique individuals (June is the first event, so all uniques are "new")
    const deduped = deduplicateByName(allRaw);
    return buildAttendanceData(allRaw, deduped);
  }, [juneDay1Raw, juneDay2Raw, loading]);

  const june: MultiDayEventData = { day1: juneDay1, day2: juneDay2, combined: juneCombined };

  // ── Sept Build Day (second event — new = not in any June attendance) ────────
  const sept27 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    const attended = sept27Raw.filter(r => (r.checkins || 0) >= 1);
    const uniqueAttended = deduplicateByEmail(attended);
    const newAttendees = filterNewAttendees(uniqueAttended, juneAllAttendees);
    return buildAttendanceData(attended, newAttendees);
  }, [sept27Raw, juneAllAttendees, loading]);

  const sept27All = useMemo(() => {
    if (loading) return { rsvps: 0, attended: 0 };
    return { rsvps: sept27Raw.length, attended: sept27Raw.filter(r => (r.checkins || 0) >= 1).length };
  }, [sept27Raw, loading]);

  // ── Dec Workshop (third event — new = not in June OR Sept) ─────────────────
  const septAllAttendees = useMemo(() => {
    if (loading) return [];
    return sept27Raw.filter(r => (r.checkins || 0) >= 1);
  }, [sept27Raw, loading]);

  const dec6 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    const attended = dec6Raw.filter(r => (r.checkins || 0) >= 1);
    const uniqueAttended = deduplicateByEmail(attended);
    const priorAttendees = [...juneAllAttendees, ...septAllAttendees];
    const newAttendees = filterNewAttendees(uniqueAttended, priorAttendees);
    return buildAttendanceData(attended, newAttendees);
  }, [dec6Raw, juneAllAttendees, septAllAttendees, loading]);

  const dec6All = useMemo(() => {
    if (loading) return { rsvps: 0, attended: 0 };
    return { rsvps: dec6Raw.length, attended: dec6Raw.filter(r => (r.checkins || 0) >= 1).length };
  }, [dec6Raw, loading]);

  const ltf = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    return buildAttendanceData(ltfRaw, ltfRaw);
  }, [ltfRaw, loading]);

  return {
    june,
    sept27,
    sept27All,
    dec6,
    dec6All,
    ltf,
    loading,
  };
}
