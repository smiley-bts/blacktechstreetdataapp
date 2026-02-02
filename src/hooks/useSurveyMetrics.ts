import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFeedback } from "./useFeedback";
import {
  SurveyTemplate,
  SurveyFilters,
  SurveyMetrics,
  WeightedSurveyResponse,
  calculateNPS,
  calculateWeightedNPS,
  getSurveyTemplateForEvent,
  categorizeAgeRange,
} from "@/types/surveyTypes";
import { getEngagementWeight } from "./useParticipantEngagement";

interface ParticipantEngagementCache {
  eventsAttended: number;
  tier: "low" | "medium" | "high" | "champion";
}

export function useSurveyMetrics(filters?: SurveyFilters) {
  const {
    ltfFeedback,
    workshopFeedback,
    buildDayFeedback,
    sep2025WorkshopFeedback,
    loading: feedbackLoading,
  } = useFeedback();

  // Fetch attendance data to link surveys with engagement
  const attendanceQuery = useQuery({
    queryKey: ["survey-attendance-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendance")
        .select("participant_id, event_name, confirmed_attended, completed_survey")
        .eq("confirmed_attended", true);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch participant emails for matching
  const emailsQuery = useQuery({
    queryKey: ["participant-emails-for-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participant_emails")
        .select("participant_id, email");

      if (error) throw error;
      
      const emailToParticipant = new Map<string, string>();
      data?.forEach((e) => {
        emailToParticipant.set(e.email.toLowerCase(), e.participant_id);
      });
      return emailToParticipant;
    },
  });

  // Calculate engagement cache per participant
  const engagementCache = useMemo(() => {
    const cache = new Map<string, ParticipantEngagementCache>();
    const attendance = attendanceQuery.data || [];

    // Group by participant
    const participantEvents = new Map<string, number>();
    attendance.forEach((a) => {
      const count = participantEvents.get(a.participant_id) || 0;
      participantEvents.set(a.participant_id, count + 1);
    });

    // Calculate tier for each participant
    participantEvents.forEach((count, participantId) => {
      let tier: "low" | "medium" | "high" | "champion" = "low";
      if (count >= 5) tier = "champion";
      else if (count >= 3) tier = "high";
      else if (count >= 2) tier = "medium";

      cache.set(participantId, { eventsAttended: count, tier });
    });

    return cache;
  }, [attendanceQuery.data]);

  // Transform all feedback into weighted survey responses
  const weightedResponses = useMemo((): WeightedSurveyResponse[] => {
    const emailToParticipant = emailsQuery.data || new Map();
    const responses: WeightedSurveyResponse[] = [];

    // Process K-12/LTF feedback
    ltfFeedback.forEach((f) => {
      const participantId = emailToParticipant.get(f.email?.toLowerCase() || "");
      const engagement = participantId
        ? engagementCache.get(participantId)
        : { eventsAttended: 1, tier: "low" as const };

      responses.push({
        id: f.submissionId,
        participantId: participantId || null,
        email: f.email || "",
        submittedAt: f.submittedAt,
        eventName: "ASPIRE Lead Workshop",
        eventType: "education",
        template: "k12",
        npsScore: f.interestLevel || null,
        overallRating: f.overallRating,
        confidenceBefore: f.confidenceBefore,
        confidenceAfter: f.confidenceAfter,
        ageRange: null,
        gradeLevel: f.gradeLevel || null,
        industry: null,
        engagementTier: engagement?.tier || "low",
        engagementWeight: getEngagementWeight(engagement?.tier || "low"),
        eventsAttended: engagement?.eventsAttended || 1,
        favoriteAspect: f.favoriteActivity || null,
        suggestions: f.suggestions || null,
      });
    });

    // Process adult workshop feedback
    workshopFeedback.forEach((f) => {
      const email = f.email?.toLowerCase() || "";
      const participantId = emailToParticipant.get(email);
      const engagement = participantId
        ? engagementCache.get(participantId)
        : { eventsAttended: 1, tier: "low" as const };

      responses.push({
        id: f.submissionId,
        participantId: participantId || null,
        email: f.email || "",
        submittedAt: f.submittedAt,
        eventName: "ASPIRE Workshop",
        eventType: "workshop",
        template: "adult",
        npsScore: f.recommendLikelihood,
        overallRating: null,
        confidenceBefore: f.confidenceSolving,
        confidenceAfter: f.confidenceApplying,
        ageRange: null,
        gradeLevel: null,
        industry: null,
        engagementTier: engagement?.tier || "low",
        engagementWeight: getEngagementWeight(engagement?.tier || "low"),
        eventsAttended: engagement?.eventsAttended || 1,
        favoriteAspect: f.highlightTakeaway || null,
        suggestions: f.improvementSuggestion || null,
      });
    });

    // Process Sep 2025 workshop feedback
    sep2025WorkshopFeedback.forEach((f) => {
      const email = (f.email || f.emailAddress)?.toLowerCase() || "";
      const participantId = emailToParticipant.get(email);
      const engagement = participantId
        ? engagementCache.get(participantId)
        : { eventsAttended: 1, tier: "low" as const };

      responses.push({
        id: f.submissionId,
        participantId: participantId || null,
        email: email,
        submittedAt: f.submittedAt,
        eventName: "ASPIRE September 2025 Workshop",
        eventType: "workshop",
        template: "adult",
        npsScore: f.recommendLikelihood,
        overallRating: f.confidenceUnderstanding,
        confidenceBefore: null,
        confidenceAfter: f.confidenceUnderstanding,
        ageRange: null,
        gradeLevel: null,
        industry: f.industry || null,
        engagementTier: engagement?.tier || "low",
        engagementWeight: getEngagementWeight(engagement?.tier || "low"),
        eventsAttended: engagement?.eventsAttended || 1,
        favoriteAspect: f.ahaMoment || null,
        suggestions: f.coverMoreDifferently || null,
      });
    });

    // Process build day feedback
    buildDayFeedback.forEach((f) => {
      const email = f.email?.toLowerCase() || "";
      const participantId = emailToParticipant.get(email);
      const engagement = participantId
        ? engagementCache.get(participantId)
        : { eventsAttended: 1, tier: "low" as const };

      responses.push({
        id: f.submissionId,
        participantId: participantId || null,
        email: f.email || "",
        submittedAt: f.submittedAt,
        eventName: "ASPIRE Build Day",
        eventType: "workshop",
        template: "adult",
        npsScore: f.recommendLikelihood,
        overallRating: f.understandsTools,
        confidenceBefore: null,
        confidenceAfter: f.confidenceSolving,
        ageRange: null,
        gradeLevel: null,
        industry: null,
        engagementTier: engagement?.tier || "low",
        engagementWeight: getEngagementWeight(engagement?.tier || "low"),
        eventsAttended: engagement?.eventsAttended || 1,
        favoriteAspect: f.favoritePart || null,
        suggestions: f.improvementSuggestion || null,
      });
    });

    return responses;
  }, [
    ltfFeedback,
    workshopFeedback,
    sep2025WorkshopFeedback,
    buildDayFeedback,
    emailsQuery.data,
    engagementCache,
  ]);

  // Apply filters
  const filteredResponses = useMemo(() => {
    if (!filters) return weightedResponses;

    return weightedResponses.filter((r) => {
      if (filters.template && r.template !== filters.template) return false;
      if (filters.eventType && r.eventType !== filters.eventType) return false;
      if (filters.dateFrom && r.submittedAt < filters.dateFrom) return false;
      if (filters.dateTo && r.submittedAt > filters.dateTo) return false;
      if (filters.engagementTier && r.engagementTier !== filters.engagementTier) return false;
      if (filters.minEventsAttended && r.eventsAttended < filters.minEventsAttended) return false;
      if (filters.ageRange) {
        const category = categorizeAgeRange(r.ageRange || r.gradeLevel);
        if (category !== filters.ageRange) return false;
      }
      return true;
    });
  }, [weightedResponses, filters]);

  // Calculate metrics
  const metrics = useMemo((): SurveyMetrics => {
    const responses = filteredResponses;
    const totalResponses = responses.length;
    const uniqueEmails = new Set(responses.map((r) => r.email.toLowerCase()).filter(Boolean));

    // NPS calculation
    const npsScores = responses
      .filter((r) => r.npsScore !== null && r.npsScore > 0)
      .map((r) => r.npsScore!);
    const { nps, promoters, passives, detractors } = calculateNPS(npsScores);

    // Weighted NPS
    const weightedNpsData = responses
      .filter((r) => r.npsScore !== null && r.npsScore > 0)
      .map((r) => ({ npsScore: r.npsScore!, weight: r.engagementWeight }));
    const weightedNpsScore = calculateWeightedNPS(weightedNpsData);

    // Ratings
    const ratings = responses
      .filter((r) => r.overallRating !== null && r.overallRating > 0)
      .map((r) => r.overallRating!);
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    // Weighted average rating
    const weightedRatings = responses
      .filter((r) => r.overallRating !== null && r.overallRating > 0)
      .map((r) => ({ rating: r.overallRating!, weight: r.engagementWeight }));
    const totalWeight = weightedRatings.reduce((sum, r) => sum + r.weight, 0);
    const weightedAverageRating = totalWeight > 0
      ? weightedRatings.reduce((sum, r) => sum + r.rating * r.weight, 0) / totalWeight
      : 0;

    // Confidence transformation
    const confidenceResponses = responses.filter(
      (r) => r.confidenceBefore !== null && r.confidenceAfter !== null
    );
    const avgConfidenceBefore = confidenceResponses.length > 0
      ? confidenceResponses.reduce((sum, r) => sum + r.confidenceBefore!, 0) / confidenceResponses.length
      : 0;
    const avgConfidenceAfter = confidenceResponses.length > 0
      ? confidenceResponses.reduce((sum, r) => sum + r.confidenceAfter!, 0) / confidenceResponses.length
      : 0;

    // Breakdown by template
    const byTemplate: Record<SurveyTemplate, number> = { k12: 0, adult: 0, enterprise: 0 };
    responses.forEach((r) => {
      byTemplate[r.template] = (byTemplate[r.template] || 0) + 1;
    });

    // Breakdown by engagement tier
    const byEngagementTier: Record<string, number> = {};
    responses.forEach((r) => {
      byEngagementTier[r.engagementTier] = (byEngagementTier[r.engagementTier] || 0) + 1;
    });

    // Survey completion rate (requires attendance data)
    const totalAttendees = attendanceQuery.data?.length || 0;
    const surveyCompletionRate = totalAttendees > 0
      ? Math.round((totalResponses / totalAttendees) * 100)
      : 0;

    return {
      totalResponses,
      uniqueRespondents: uniqueEmails.size,
      npsScore: nps,
      npsBreakdown: { promoters, passives, detractors },
      weightedNpsScore,
      averageRating: Math.round(averageRating * 10) / 10,
      weightedAverageRating: Math.round(weightedAverageRating * 10) / 10,
      averageConfidenceBefore: Math.round(avgConfidenceBefore * 10) / 10,
      averageConfidenceAfter: Math.round(avgConfidenceAfter * 10) / 10,
      confidenceGain: Math.round((avgConfidenceAfter - avgConfidenceBefore) * 10) / 10,
      surveyCompletionRate,
      byTemplate,
      byEngagementTier,
    };
  }, [filteredResponses, attendanceQuery.data]);

  return {
    responses: filteredResponses,
    metrics,
    isLoading: feedbackLoading || attendanceQuery.isLoading || emailsQuery.isLoading,
    error: attendanceQuery.error || emailsQuery.error,
  };
}

// Hook for survey completion tracking (separate from attendance)
export function useSurveyCompletion() {
  const { ltfFeedback, workshopFeedback, sep2025WorkshopFeedback, buildDayFeedback } = useFeedback();

  const attendanceQuery = useQuery({
    queryKey: ["attendance-for-survey-completion"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendance")
        .select("participant_id, event_name, event_date, confirmed_attended, completed_survey, event_type");

      if (error) throw error;
      return data || [];
    },
  });

  const completionData = useMemo(() => {
    const attendance = attendanceQuery.data || [];
    const totalAttendees = attendance.filter((a) => a.confirmed_attended).length;
    const surveyedAttendees = attendance.filter((a) => a.completed_survey).length;

    // Group by event type
    const byEventType = new Map<string, { attended: number; surveyed: number }>();
    attendance.forEach((a) => {
      if (!a.confirmed_attended) return;
      
      const type = a.event_type || "unknown";
      const current = byEventType.get(type) || { attended: 0, surveyed: 0 };
      current.attended += 1;
      if (a.completed_survey) current.surveyed += 1;
      byEventType.set(type, current);
    });

    // CSV survey counts (not linked to attendance)
    const csvSurveyCount = 
      ltfFeedback.length + 
      workshopFeedback.length + 
      sep2025WorkshopFeedback.length + 
      buildDayFeedback.length;

    return {
      totalAttendees,
      surveyedAttendees,
      completionRate: totalAttendees > 0 
        ? Math.round((surveyedAttendees / totalAttendees) * 100) 
        : 0,
      byEventType: Array.from(byEventType.entries()).map(([type, data]) => ({
        eventType: type,
        attended: data.attended,
        surveyed: data.surveyed,
        rate: data.attended > 0 ? Math.round((data.surveyed / data.attended) * 100) : 0,
      })),
      csvSurveyResponses: csvSurveyCount,
    };
  }, [attendanceQuery.data, ltfFeedback, workshopFeedback, sep2025WorkshopFeedback, buildDayFeedback]);

  return {
    ...completionData,
    isLoading: attendanceQuery.isLoading,
  };
}
