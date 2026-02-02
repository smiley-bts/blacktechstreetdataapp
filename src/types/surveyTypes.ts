// Survey template types for different program audiences

export type SurveyTemplate = "k12" | "adult" | "enterprise";

export interface SurveyTemplateConfig {
  id: SurveyTemplate;
  label: string;
  description: string;
  programTypes: string[]; // Event types this template applies to
  requiredFields: string[];
  npsQuestion: string;
}

export const SURVEY_TEMPLATES: Record<SurveyTemplate, SurveyTemplateConfig> = {
  k12: {
    id: "k12",
    label: "K-12 Programs",
    description: "Youth-focused workshops and education sessions",
    programTypes: ["education", "workshop"],
    requiredFields: [
      "gradeLevel",
      "confidenceBefore",
      "confidenceAfter",
      "overallRating",
    ],
    npsQuestion: "How likely are you to recommend this program to a friend?",
  },
  adult: {
    id: "adult",
    label: "Adult Workshops",
    description: "Professional development and community training",
    programTypes: ["workshop", "community_engagement"],
    requiredFields: [
      "mindsetBefore",
      "mindsetAfter",
      "recommendLikelihood",
      "confidenceApplying",
    ],
    npsQuestion: "How likely are you to recommend this workshop to a colleague?",
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise Sessions",
    description: "Corporate and partner organization training",
    programTypes: ["enterprise"],
    requiredFields: [
      "organizationName",
      "roleLevel",
      "recommendLikelihood",
      "implementationIntent",
    ],
    npsQuestion: "How likely are you to recommend Black Tech Street to your organization?",
  },
};

export function getSurveyTemplateForEvent(eventType: string): SurveyTemplate {
  if (eventType === "education") return "k12";
  if (eventType === "enterprise") return "enterprise";
  return "adult";
}

// Survey response with engagement context
export interface WeightedSurveyResponse {
  id: string;
  participantId: string | null;
  email: string;
  submittedAt: string;
  eventName: string;
  eventType: string;
  template: SurveyTemplate;
  
  // Core metrics
  npsScore: number | null;
  overallRating: number | null;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
  
  // Demographics (for filtering)
  ageRange: string | null;
  gradeLevel: string | null;
  industry: string | null;
  
  // Engagement weighting
  engagementTier: "low" | "medium" | "high" | "champion";
  engagementWeight: number;
  eventsAttended: number;
  
  // Qualitative
  favoriteAspect: string | null;
  suggestions: string | null;
}

// Aggregated survey metrics
export interface SurveyMetrics {
  totalResponses: number;
  uniqueRespondents: number;
  
  // NPS
  npsScore: number;
  npsBreakdown: {
    promoters: number;
    passives: number;
    detractors: number;
  };
  
  // Weighted NPS (by engagement)
  weightedNpsScore: number;
  
  // Ratings
  averageRating: number;
  weightedAverageRating: number;
  
  // Confidence transformation
  averageConfidenceBefore: number;
  averageConfidenceAfter: number;
  confidenceGain: number;
  
  // Completion rates
  surveyCompletionRate: number; // % of attendees who completed survey
  
  // Response breakdown
  byTemplate: Record<SurveyTemplate, number>;
  byEngagementTier: Record<string, number>;
}

// Survey filter options
export interface SurveyFilters {
  template?: SurveyTemplate;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  ageRange?: string;
  minEventsAttended?: number;
  engagementTier?: "low" | "medium" | "high" | "champion";
}

// NPS calculation utilities
export function calculateNPS(scores: number[]): {
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
} {
  if (scores.length === 0) {
    return { nps: 0, promoters: 0, passives: 0, detractors: 0 };
  }

  const promoters = scores.filter((s) => s >= 9).length;
  const passives = scores.filter((s) => s >= 7 && s < 9).length;
  const detractors = scores.filter((s) => s < 7).length;

  const nps = Math.round(
    ((promoters - detractors) / scores.length) * 100
  );

  return { nps, promoters, passives, detractors };
}

export function calculateWeightedNPS(
  responses: { npsScore: number; weight: number }[]
): number {
  if (responses.length === 0) return 0;

  const totalWeight = responses.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;

  // Weighted average NPS score
  const weightedSum = responses.reduce(
    (sum, r) => sum + r.npsScore * r.weight,
    0
  );
  const weightedAvg = weightedSum / totalWeight;

  // Convert to NPS scale (-100 to 100)
  // Scores 9-10 = promoters (+100), 7-8 = passive (0), 0-6 = detractors (-100)
  if (weightedAvg >= 9) return Math.round((weightedAvg - 9) * 50 + 50);
  if (weightedAvg >= 7) return Math.round((weightedAvg - 7) * 25 - 25);
  return Math.round((weightedAvg / 7) * 100 - 100);
}

// Age range groups for filtering
export const AGE_RANGE_GROUPS = {
  youth: ["Under 18", "13-17", "14-17", "K-12"],
  youngAdult: ["18-24", "18-25", "18 - 24"],
  adult: ["25-34", "35-44", "25 - 34", "35 - 44"],
  seniorAdult: ["45-54", "55-64", "65+", "45 - 54", "55 - 64", "65 and over"],
};

export function categorizeAgeRange(ageRange: string | null): string {
  if (!ageRange) return "unknown";
  const normalized = ageRange.toLowerCase();
  
  for (const [category, ranges] of Object.entries(AGE_RANGE_GROUPS)) {
    if (ranges.some((r) => normalized.includes(r.toLowerCase()))) {
      return category;
    }
  }
  return "unknown";
}
