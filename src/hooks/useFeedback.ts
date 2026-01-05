import { useState, useEffect } from "react";
import Papa from "papaparse";
import { 
  LTFFeedback, 
  WorkshopFeedback,
  PreSurveyFeedback,
  BuildDayFeedback,
  parseLTFFeedback, 
  parseWorkshopFeedback,
  parsePreSurveyFeedback,
  parseBuildDayFeedback
} from "@/types/feedback";

export function useFeedback() {
  const [ltfFeedback, setLtfFeedback] = useState<LTFFeedback[]>([]);
  const [workshopFeedback, setWorkshopFeedback] = useState<WorkshopFeedback[]>([]);
  const [preSurveyFeedback, setPreSurveyFeedback] = useState<PreSurveyFeedback[]>([]);
  const [buildDayFeedback, setBuildDayFeedback] = useState<BuildDayFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        // Load all feedback files in parallel
        const [ltfResponse, workshopResponse, preResponse, buildDayResponse] = await Promise.all([
          fetch("/aspire-ltf-feedback.csv"),
          fetch("/aspire-feedback-survey.csv"),
          fetch("/aspire-pre-survey.csv").catch(() => null),
          fetch("/aspire-sep2025-build-feedback.csv").catch(() => null)
        ]);

        const ltfText = await ltfResponse.text();
        const workshopText = await workshopResponse.text();
        const preText = preResponse ? await preResponse.text() : "";
        const buildDayText = buildDayResponse ? await buildDayResponse.text() : "";
        
        // Parse LTF feedback
        Papa.parse(ltfText, {
          complete: (result) => {
            const rows = result.data as string[][];
            const parsed = rows.slice(1)
              .filter(row => row[0] && row[0].trim() !== "")
              .map(parseLTFFeedback);
            setLtfFeedback(parsed);
          },
        });

        // Parse workshop feedback
        Papa.parse(workshopText, {
          complete: (result) => {
            const rows = result.data as string[][];
            const parsed = rows.slice(1)
              .filter(row => row[0] && row[0].trim() !== "")
              .map(parseWorkshopFeedback);
            setWorkshopFeedback(parsed);
          },
        });

        // Parse pre-survey feedback if available
        if (preText) {
          Papa.parse(preText, {
            complete: (result) => {
              const rows = result.data as string[][];
              const parsed = rows.slice(1)
                .filter(row => row[0] && row[0].trim() !== "")
                .map(parsePreSurveyFeedback);
              setPreSurveyFeedback(parsed);
            },
          });
        }

        // Parse build day feedback if available
        if (buildDayText) {
          Papa.parse(buildDayText, {
            complete: (result) => {
              const rows = result.data as string[][];
              const parsed = rows.slice(1)
                .filter(row => row[0] && row[0].trim() !== "")
                .map(parseBuildDayFeedback);
              setBuildDayFeedback(parsed);
            },
          });
        }

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

  const preSurveySummary = {
    totalResponses: preSurveyFeedback.length,
    averageConfidence: preSurveyFeedback.length > 0
      ? preSurveyFeedback.reduce((sum, f) => sum + f.confidence, 0) / preSurveyFeedback.length
      : 0,
    averageAiExperience: preSurveyFeedback.length > 0
      ? preSurveyFeedback.reduce((sum, f) => sum + f.aiExperience, 0) / preSurveyFeedback.length
      : 0,
  };

  const buildDaySummary = {
    totalResponses: buildDayFeedback.length,
    averageConfidence: buildDayFeedback.length > 0
      ? buildDayFeedback.reduce((sum, f) => sum + f.confidenceSolving, 0) / buildDayFeedback.length
      : 0,
    wouldAttendFollowupRate: buildDayFeedback.length > 0
      ? buildDayFeedback.filter(f => f.wouldAttendFollowup).length / buildDayFeedback.length * 100
      : 0,
  };

  return {
    ltfFeedback,
    workshopFeedback,
    preSurveyFeedback,
    buildDayFeedback,
    ltfSummary,
    workshopSummary,
    preSurveySummary,
    buildDaySummary,
    loading,
    error,
  };
}
