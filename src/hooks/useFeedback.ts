import { useState, useEffect } from "react";
import Papa from "papaparse";
import { 
  LTFFeedback, 
  WorkshopFeedback,
  PreSurveyFeedback,
  BuildDayFeedback,
  Sep2025WorkshopFeedback,
  Sep2025PreSurveyFeedback,
  parseLTFFeedback, 
  parseWorkshopFeedback,
  parsePreSurveyFeedback,
  parseBuildDayFeedback,
  parseSep2025WorkshopFeedback,
  parseSep2025PreSurveyForm1,
  parseSep2025PreSurveyForm2
} from "@/types/feedback";

export function useFeedback() {
  const [ltfFeedback, setLtfFeedback] = useState<LTFFeedback[]>([]);
  const [workshopFeedback, setWorkshopFeedback] = useState<WorkshopFeedback[]>([]);
  const [preSurveyFeedback, setPreSurveyFeedback] = useState<PreSurveyFeedback[]>([]);
  const [buildDayFeedback, setBuildDayFeedback] = useState<BuildDayFeedback[]>([]);
  const [sep2025WorkshopFeedback, setSep2025WorkshopFeedback] = useState<Sep2025WorkshopFeedback[]>([]);
  const [sep2025PreSurveyFeedback, setSep2025PreSurveyFeedback] = useState<Sep2025PreSurveyFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        // Load all feedback files in parallel
        const [
          ltfResponse, 
          workshopResponse, 
          preResponse, 
          buildDayResponse, 
          sep2025WorkshopResponse,
          sep2025PreSurvey1Response,
          sep2025PreSurvey2Response
        ] = await Promise.all([
          fetch("/aspire-ltf-feedback.csv"),
          fetch("/aspire-feedback-survey.csv"),
          fetch("/aspire-pre-survey.csv").catch(() => null),
          fetch("/aspire-sep2025-build-feedback.csv").catch(() => null),
          fetch("/aspire-sep2025-workshop-feedback.csv").catch(() => null),
          fetch("/aspire-sep2025-pre-survey-1.csv").catch(() => null),
          fetch("/aspire-sep2025-pre-survey-2.csv").catch(() => null)
        ]);

        const ltfText = await ltfResponse.text();
        const workshopText = await workshopResponse.text();
        const preText = preResponse ? await preResponse.text() : "";
        const buildDayText = buildDayResponse ? await buildDayResponse.text() : "";
        const sep2025WorkshopText = sep2025WorkshopResponse ? await sep2025WorkshopResponse.text() : "";
        const sep2025PreSurvey1Text = sep2025PreSurvey1Response ? await sep2025PreSurvey1Response.text() : "";
        const sep2025PreSurvey2Text = sep2025PreSurvey2Response ? await sep2025PreSurvey2Response.text() : "";
        
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

        // Parse Sep 2025 workshop feedback if available
        if (sep2025WorkshopText) {
          Papa.parse(sep2025WorkshopText, {
            complete: (result) => {
              const rows = result.data as string[][];
              const parsed = rows.slice(1)
                .filter(row => row[0] && row[0].trim() !== "")
                .map(parseSep2025WorkshopFeedback);
              setSep2025WorkshopFeedback(parsed);
            },
          });
        }

        // Parse Sep 2025 pre-survey feedback from both forms
        const allSep2025PreSurvey: Sep2025PreSurveyFeedback[] = [];
        
        if (sep2025PreSurvey1Text) {
          Papa.parse(sep2025PreSurvey1Text, {
            complete: (result) => {
              const rows = result.data as string[][];
              const parsed = rows.slice(1)
                .filter(row => row[0] && row[0].trim() !== "" && row[3])
                .map(parseSep2025PreSurveyForm1);
              allSep2025PreSurvey.push(...parsed);
            },
          });
        }
        
        if (sep2025PreSurvey2Text) {
          Papa.parse(sep2025PreSurvey2Text, {
            complete: (result) => {
              const rows = result.data as string[][];
              const parsed = rows.slice(1)
                .filter(row => row[0] && row[0].trim() !== "" && row[3])
                .map(parseSep2025PreSurveyForm2);
              allSep2025PreSurvey.push(...parsed);
            },
          });
        }
        
        setSep2025PreSurveyFeedback(allSep2025PreSurvey);

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

  const sep2025WorkshopSummary = {
    totalResponses: sep2025WorkshopFeedback.length,
    averageRecommendation: sep2025WorkshopFeedback.length > 0
      ? sep2025WorkshopFeedback.reduce((sum, f) => sum + f.recommendLikelihood, 0) / sep2025WorkshopFeedback.length
      : 0,
    averageConfidence: sep2025WorkshopFeedback.length > 0
      ? sep2025WorkshopFeedback.reduce((sum, f) => sum + f.confidenceUnderstanding, 0) / sep2025WorkshopFeedback.length
      : 0,
  };

  const sep2025PreSurveySummary = {
    totalResponses: sep2025PreSurveyFeedback.length,
  };

  return {
    ltfFeedback,
    workshopFeedback,
    preSurveyFeedback,
    buildDayFeedback,
    sep2025WorkshopFeedback,
    sep2025PreSurveyFeedback,
    ltfSummary,
    workshopSummary,
    preSurveySummary,
    buildDaySummary,
    sep2025WorkshopSummary,
    sep2025PreSurveySummary,
    loading,
    error,
  };
}
