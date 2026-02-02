// Standardized Event Type Classification
// Used for program categorization, filtering, and grant-aligned reporting

export const EVENT_TYPES = {
  WORKSHOP: "workshop",
  COMMUNITY_ENGAGEMENT: "community_engagement",
  EDUCATION: "education",
  ENTERPRISE: "enterprise",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EVENT_TYPES.WORKSHOP]: "Workshop / Training",
  [EVENT_TYPES.COMMUNITY_ENGAGEMENT]: "Community Engagement",
  [EVENT_TYPES.EDUCATION]: "Education Program (K-12)",
  [EVENT_TYPES.ENTERPRISE]: "Enterprise / Partner Session",
};

export const EVENT_TYPE_DESCRIPTIONS: Record<EventType, string> = {
  [EVENT_TYPES.WORKSHOP]: "Hands-on AI training sessions, skill-building workshops, and certification programs",
  [EVENT_TYPES.COMMUNITY_ENGAGEMENT]: "Info sessions, networking events, community meetups, and outreach activities",
  [EVENT_TYPES.EDUCATION]: "K-12 programs, youth workshops, school partnerships, and educational initiatives",
  [EVENT_TYPES.ENTERPRISE]: "Corporate training, partner sessions, enterprise demos, and B2B engagements",
};

export const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  [EVENT_TYPES.WORKSHOP]: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  [EVENT_TYPES.COMMUNITY_ENGAGEMENT]: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  [EVENT_TYPES.EDUCATION]: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  [EVENT_TYPES.ENTERPRISE]: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
};

// Map legacy event names to standardized types
export function classifyEventType(eventName: string): EventType {
  const name = eventName.toLowerCase();

  // Workshop / Training
  if (
    name.includes("workshop") ||
    name.includes("training") ||
    name.includes("build day") ||
    name.includes("aspire") ||
    name.includes("ltf") ||
    name.includes("learn to fail")
  ) {
    return EVENT_TYPES.WORKSHOP;
  }

  // Education / K-12
  if (
    name.includes("k-12") ||
    name.includes("youth") ||
    name.includes("school") ||
    name.includes("student") ||
    name.includes("education")
  ) {
    return EVENT_TYPES.EDUCATION;
  }

  // Enterprise / Partner
  if (
    name.includes("enterprise") ||
    name.includes("partner") ||
    name.includes("corporate") ||
    name.includes("b2b") ||
    name.includes("microsoft") ||
    name.includes("nvidia")
  ) {
    return EVENT_TYPES.ENTERPRISE;
  }

  // Default to Community Engagement
  return EVENT_TYPES.COMMUNITY_ENGAGEMENT;
}

// Grant-aligned program rollup categories
export const GRANT_PROGRAM_CATEGORIES = {
  WORKFORCE_DEVELOPMENT: "workforce_development",
  COMMUNITY_BUILDING: "community_building",
  YOUTH_EDUCATION: "youth_education",
  PARTNERSHIP_GROWTH: "partnership_growth",
} as const;

export type GrantProgramCategory = (typeof GRANT_PROGRAM_CATEGORIES)[keyof typeof GRANT_PROGRAM_CATEGORIES];

export const GRANT_CATEGORY_LABELS: Record<GrantProgramCategory, string> = {
  [GRANT_PROGRAM_CATEGORIES.WORKFORCE_DEVELOPMENT]: "Workforce Development",
  [GRANT_PROGRAM_CATEGORIES.COMMUNITY_BUILDING]: "Community Building",
  [GRANT_PROGRAM_CATEGORIES.YOUTH_EDUCATION]: "Youth Education",
  [GRANT_PROGRAM_CATEGORIES.PARTNERSHIP_GROWTH]: "Partnership Growth",
};

// Map event types to grant categories for reporting
export const EVENT_TYPE_TO_GRANT_CATEGORY: Record<EventType, GrantProgramCategory> = {
  [EVENT_TYPES.WORKSHOP]: GRANT_PROGRAM_CATEGORIES.WORKFORCE_DEVELOPMENT,
  [EVENT_TYPES.COMMUNITY_ENGAGEMENT]: GRANT_PROGRAM_CATEGORIES.COMMUNITY_BUILDING,
  [EVENT_TYPES.EDUCATION]: GRANT_PROGRAM_CATEGORIES.YOUTH_EDUCATION,
  [EVENT_TYPES.ENTERPRISE]: GRANT_PROGRAM_CATEGORIES.PARTNERSHIP_GROWTH,
};

// Get all event types as array for selects/filters
export function getEventTypeOptions(): { value: EventType; label: string }[] {
  return Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
    value: value as EventType,
    label,
  }));
}
