// Feedback types for ASPIRE workshop surveys

export interface LTFFeedback {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  overallRating: number;
  engagingRating: number;
  contentClearRating: number;
  confidenceBefore: number;
  confidenceAfter: number;
  aiUnderstanding: number;
  biasAwareness: number;
  responsibleUse: string;
  confidenceSharing: number;
  hasPersonalStatement: string;
  plannedUses: string[];
  interestLevel: number;
  mostHelpful: string;
  favoriteActivity: string;
  suggestions: string;
  gradeLevel: string;
  wantsFutureProgramInfo: boolean;
  email: string;
}

export interface WorkshopFeedback {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  heardFrom: string;
  heardFromOther: string;
  mindsetBefore: string;
  mindsetAfter: string;
  confidenceSolving: number;
  confidenceApplying: number;
  experienceLevel: string;
  digitalToolsConfidence: number;
  applyConfidence: number;
  aiDataTruth: string;
  howAIWorks: string;
  toolsUsed: string[];
  toolsUsedOther: string;
  valuableLearning: string;
  valuableLearningOther: string;
  promptConfidence: number;
  responsibleUseAgreement: number;
  harmAddressing: string;
  realWaysToUse: number;
  wasWelcoming: boolean;
  welcomingExplanation: string;
  recommendLikelihood: number;
  willContinueExploring: number;
  wouldAttendBuildDay: boolean;
  buildDayExplanation: string;
  referralName: string;
  referralEmail: string;
  improvementSuggestion: string;
  highlightTakeaway: string;
  sharePermission: boolean;
  wouldVolunteer: boolean;
}

export interface BuildDayFeedback {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  name: string;
  email: string;
  teamBuildDescription: string;
  additionalFiles: string;
  communityHarmAvoidance: string;
  toolsUsed: string[];
  toolsOther: string;
  understandsTools: number;
  howAiWorks: string;
  confidenceSolving: number;
  confidenceApplying: number;
  favoritePart: string;
  knewTeamMembers: string;
  roles: string[];
  teamInfluence: string;
  seesOpportunities: number;
  wouldAttendFollowup: boolean;
  followupExplanation: string;
  quote: string;
  shareQuotePermission: boolean;
  recommendLikelihood: number;
  referralInfo: string;
  improvementSuggestion: string;
}

export function parseBuildDayFeedback(row: string[]): BuildDayFeedback {
  return {
    submissionId: row[0] || "",
    respondentId: row[1] || "",
    submittedAt: row[2] || "",
    name: row[3] || "",
    email: row[4] || "",
    teamBuildDescription: row[5] || "",
    additionalFiles: row[6] || "",
    communityHarmAvoidance: row[7] || "",
    toolsUsed: row[8]?.split(", ") || [],
    toolsOther: row[9] || "",
    understandsTools: parseInt(row[10]?.match(/\d/)?.[0] || "0"),
    howAiWorks: row[11] || "",
    confidenceSolving: parseInt(row[12]?.match(/\d/)?.[0] || "0"),
    confidenceApplying: parseInt(row[13]?.match(/\d/)?.[0] || "0"),
    favoritePart: row[14] || "",
    knewTeamMembers: row[15] || "",
    roles: row[16]?.split(", ") || [],
    teamInfluence: row[17] || "",
    seesOpportunities: parseInt(row[18]?.match(/\d/)?.[0] || "0"),
    wouldAttendFollowup: row[19] === "Yes",
    followupExplanation: row[20] || "",
    quote: row[21] || "",
    shareQuotePermission: row[22] === "Yes",
    recommendLikelihood: parseInt(row[23]?.match(/\d/)?.[0] || "0"),
    referralInfo: row[24] || "",
    improvementSuggestion: row[26] || "",
  };
}

export interface FeedbackSummary {
  totalResponses: number;
  averageRating: number;
  npsScore: number;
  confidenceGain: number;
  topThemes: { theme: string; count: number }[];
}

export interface PreSurveyFeedback {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  zipCode: string;
  accessibilityNeeds: string;
  tshirtSize: string;
  needsLaptop: boolean;
  ageRange: string;
  educationLevel: string;
  industry: string;
  role: string;
  aiApplicationPlans: string[];
  aiExperience: number;
  confidence: number;
  confidenceApplying: number;
  communityConnection: string;
}

export function parsePreSurveyFeedback(row: string[]): PreSurveyFeedback {
  return {
    submissionId: row[0] || "",
    respondentId: row[1] || "",
    submittedAt: row[2] || "",
    firstName: row[3] || "",
    lastName: row[4] || "",
    phone: row[5] || "",
    email: row[6] || "",
    zipCode: row[7] || "",
    accessibilityNeeds: row[8] || "",
    tshirtSize: row[9] || "",
    needsLaptop: row[10] === "Yes",
    ageRange: row[11] || "",
    educationLevel: row[12] || "",
    industry: row[13] || "",
    role: row[15] || "",
    aiApplicationPlans: row[17]?.split(", ") || [],
    aiExperience: parseInt(row[18]?.match(/\d/)?.[0] || "0"),
    confidence: parseInt(row[19]?.match(/\d/)?.[0] || "0"),
    confidenceApplying: parseInt(row[20]?.match(/\d/)?.[0] || "0"),
    communityConnection: row[21] || "",
  };
}

export function parseLTFFeedback(row: string[]): LTFFeedback {
  return {
    submissionId: row[0],
    respondentId: row[1],
    submittedAt: row[2],
    overallRating: parseInt(row[3]) || 0,
    engagingRating: parseInt(row[4]) || 0,
    contentClearRating: parseInt(row[5]) || 0,
    confidenceBefore: parseInt(row[6]) || 0,
    confidenceAfter: parseInt(row[7]) || 0,
    aiUnderstanding: parseInt(row[8]) || 0,
    biasAwareness: parseInt(row[9]) || 0,
    responsibleUse: row[10],
    confidenceSharing: parseInt(row[11]) || 0,
    hasPersonalStatement: row[12],
    plannedUses: row[13]?.split(", ") || [],
    interestLevel: parseInt(row[14]) || 0,
    mostHelpful: row[15],
    favoriteActivity: row[16],
    suggestions: row[17],
    gradeLevel: row[18],
    wantsFutureProgramInfo: row[19] === "Yes",
    email: row[20] || "",
  };
}

export function parseWorkshopFeedback(row: string[]): WorkshopFeedback {
  return {
    submissionId: row[0],
    respondentId: row[1],
    submittedAt: row[2],
    firstName: row[3],
    lastName: row[4],
    email: row[5],
    heardFrom: row[6],
    heardFromOther: row[7],
    mindsetBefore: row[8],
    mindsetAfter: row[9],
    confidenceSolving: parseInt(row[10]?.match(/\d/)?.[0] || "0"),
    confidenceApplying: parseInt(row[11]?.match(/\d/)?.[0] || "0"),
    experienceLevel: row[12],
    digitalToolsConfidence: parseInt(row[13]?.match(/\d/)?.[0] || "0"),
    applyConfidence: parseInt(row[14]?.match(/\d/)?.[0] || "0"),
    aiDataTruth: row[15],
    howAIWorks: row[16],
    toolsUsed: row[17]?.split(", ") || [],
    toolsUsedOther: row[18],
    valuableLearning: row[19],
    valuableLearningOther: row[20],
    promptConfidence: parseInt(row[21]?.match(/\d/)?.[0] || "0"),
    responsibleUseAgreement: parseInt(row[22]?.match(/\d/)?.[0] || "0"),
    harmAddressing: row[23],
    realWaysToUse: parseInt(row[24]?.match(/\d/)?.[0] || "0"),
    wasWelcoming: row[25] === "Yes",
    welcomingExplanation: row[26],
    recommendLikelihood: parseInt(row[27]?.match(/\d/)?.[0] || "0"),
    willContinueExploring: parseInt(row[28]?.match(/\d/)?.[0] || "0"),
    wouldAttendBuildDay: row[29] === "Yes",
    buildDayExplanation: row[30],
    referralName: row[31],
    referralEmail: row[32],
    improvementSuggestion: row[33],
    highlightTakeaway: row[34],
    sharePermission: row[35] === "Yes, you may share it.",
    wouldVolunteer: row[36] === "Yes",
  };
}
