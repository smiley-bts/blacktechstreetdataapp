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
  deduplicatedRows: AttendeeRow[];
  rawCount: number;
  dedupeCount: number;
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
    const key = (row.email || "").toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.set(key, row);
    }
  }
  return Array.from(seen.values());
}

function buildAttendanceData(raw: AttendeeRow[], deduped: AttendeeRow[]): EventAttendanceData {
  const rawCount = raw.length;
  const dedupeCount = deduped.length;
  const duplicateRate = rawCount > 0 ? Math.round(((rawCount - dedupeCount) / rawCount) * 100) : 0;
  return { rawRows: raw, deduplicatedRows: deduped, rawCount, dedupeCount, duplicateRate, loading: false };
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

  const juneDay1 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    const deduped = deduplicateByName(juneDay1Raw);
    return buildAttendanceData(juneDay1Raw, deduped);
  }, [juneDay1Raw, loading]);

  const juneDay2 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    const deduped = deduplicateByName(juneDay2Raw);
    return buildAttendanceData(juneDay2Raw, deduped);
  }, [juneDay2Raw, loading]);

  const juneCombined = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    const allRaw = [...juneDay1Raw, ...juneDay2Raw];
    const deduped = deduplicateByName(allRaw);
    return buildAttendanceData(allRaw, deduped);
  }, [juneDay1Raw, juneDay2Raw, loading]);

  const june: MultiDayEventData = { day1: juneDay1, day2: juneDay2, combined: juneCombined };

  const sept27 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    // Only rows with checkins >= 1 are "actual" attendees
    const attended = sept27Raw.filter(r => (r.checkins || 0) >= 1);
    const deduped = deduplicateByEmail(attended);
    // Raw = all RSVPs, deduped = unique attendees
    return buildAttendanceData(attended, deduped);
  }, [sept27Raw, loading]);

  const sept27All = useMemo(() => {
    if (loading) return { rsvps: 0, attended: 0 };
    return { rsvps: sept27Raw.length, attended: sept27Raw.filter(r => (r.checkins || 0) >= 1).length };
  }, [sept27Raw, loading]);

  const dec6 = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    const attended = dec6Raw.filter(r => (r.checkins || 0) >= 1);
    const deduped = deduplicateByEmail(attended);
    return buildAttendanceData(attended, deduped);
  }, [dec6Raw, loading]);

  const dec6All = useMemo(() => {
    if (loading) return { rsvps: 0, attended: 0 };
    return { rsvps: dec6Raw.length, attended: dec6Raw.filter(r => (r.checkins || 0) >= 1).length };
  }, [dec6Raw, loading]);

  const ltf = useMemo<EventAttendanceData>(() => {
    if (loading) return { rawRows: [], deduplicatedRows: [], rawCount: 0, dedupeCount: 0, duplicateRate: 0, loading: true };
    // Each submission is unique
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
