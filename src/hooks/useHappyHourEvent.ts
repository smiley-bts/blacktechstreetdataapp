import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";

export interface HappyHourRSVP {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  fullName: string;
  phone: string;
  email: string;
  zipCode: string;
}

function parseHappyHourRSVP(row: Record<string, string>): HappyHourRSVP {
  return {
    submissionId: row["Submission ID"] || "",
    respondentId: row["Respondent ID"] || "",
    submittedAt: row["Submitted at"] || "",
    fullName: row["What's Your Full Name?"]?.trim() || "",
    phone: row["What's Your Phone Number "]?.trim() || "",
    email: row["What's Your Email?"]?.trim().toLowerCase() || "",
    zipCode: row["What's your ZIP Code?"]?.trim() || "",
  };
}

export function useHappyHourEvent() {
  const [rsvps, setRsvps] = useState<HappyHourRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/happy-hour-aug2025.csv");
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const text = await response.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsed = result.data
              .map((row: any) => parseHappyHourRSVP(row))
              .filter(rsvp => rsvp.fullName && rsvp.email);
            setRsvps(parsed);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Happy Hour data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    return {
      totalRSVPs: rsvps.length,
      eventDate: "August 27, 2025",
      eventName: "Happy Hour Aug 2025",
    };
  }, [rsvps]);

  return {
    rsvps,
    summary,
    loading,
    error,
  };
}
