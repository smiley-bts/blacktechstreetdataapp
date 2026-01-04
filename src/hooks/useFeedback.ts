import { useState, useEffect } from "react";
import Papa from "papaparse";
import { 
  LTFFeedback, 
  WorkshopFeedback, 
  parseLTFFeedback, 
  parseWorkshopFeedback 
} from "@/types/feedback";

export function useFeedback() {
  const [ltfFeedback, setLtfFeedback] = useState<LTFFeedback[]>([]);
  const [workshopFeedback, setWorkshopFeedback] = useState<WorkshopFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        // Load LTF feedback
        const ltfResponse = await fetch("/aspire-ltf-feedback.csv");
        const ltfText = await ltfResponse.text();
        
        Papa.parse(ltfText, {
          complete: (result) => {
            const rows = result.data as string[][];
            // Skip header row
            const parsed = rows.slice(1)
              .filter(row => row[0] && row[0].trim() !== "")
              .map(parseLTFFeedback);
            setLtfFeedback(parsed);
          },
        });

        // Load workshop feedback
        const workshopResponse = await fetch("/aspire-feedback-survey.csv");
        const workshopText = await workshopResponse.text();
        
        Papa.parse(workshopText, {
          complete: (result) => {
            const rows = result.data as string[][];
            // Skip header row
            const parsed = rows.slice(1)
              .filter(row => row[0] && row[0].trim() !== "")
              .map(parseWorkshopFeedback);
            setWorkshopFeedback(parsed);
          },
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feedback");
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  // Calculate summary stats
  const ltfSummary = {
    totalResponses: ltfFeedback.length,
    averageRating: ltfFeedback.length > 0 
      ? ltfFeedback.reduce((sum, f) => sum + f.overallRating, 0) / ltfFeedback.length 
      : 0,
    averageConfidenceGain: ltfFeedback.length > 0
      ? ltfFeedback.reduce((sum, f) => sum + (f.confidenceAfter - f.confidenceBefore), 0) / ltfFeedback.length
      : 0,
    hasPersonalStatementRate: ltfFeedback.length > 0
      ? ltfFeedback.filter(f => f.hasPersonalStatement === "Yes").length / ltfFeedback.length * 100
      : 0,
  };

  const workshopSummary = {
    totalResponses: workshopFeedback.length,
    averageRecommendation: workshopFeedback.length > 0
      ? workshopFeedback.reduce((sum, f) => sum + f.recommendLikelihood, 0) / workshopFeedback.length
      : 0,
    wouldAttendBuildDayRate: workshopFeedback.length > 0
      ? workshopFeedback.filter(f => f.wouldAttendBuildDay).length / workshopFeedback.length * 100
      : 0,
    averageConfidenceGain: workshopFeedback.length > 0
      ? workshopFeedback.reduce((sum, f) => sum + (f.confidenceApplying - f.confidenceSolving), 0) / workshopFeedback.length
      : 0,
  };

  return {
    ltfFeedback,
    workshopFeedback,
    ltfSummary,
    workshopSummary,
    loading,
    error,
  };
}
