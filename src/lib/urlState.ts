import { ContactFilter } from "@/types/contact";

// Serialize filter state to URL-safe string
export function serializeFilters(filters: ContactFilter): string {
  // Only include non-default values to keep URL shorter
  const compressed: Record<string, any> = {};
  
  if (filters.search) compressed.s = filters.search;
  if (filters.lifecycleStage.length) compressed.ls = filters.lifecycleStage;
  if (filters.aiExperienceLevel.length) compressed.ai = filters.aiExperienceLevel;
  if (filters.ageRange.length) compressed.ar = filters.ageRange;
  if (filters.incomeRange.length) compressed.ir = filters.incomeRange;
  if (filters.cohort.length) compressed.co = filters.cohort;
  if (filters.tags?.length) compressed.t = filters.tags;
  if (filters.eventAttendeesOnly) compressed.ea = 1;
  if (filters.buildDayOnly) compressed.bd = 1;
  if (filters.dec6Workshop) compressed.d6 = 1;
  if (filters.dec13LTF) compressed.d13 = 1;
  if (filters.sept27BuildDay) compressed.s27 = 1;
  if (filters.hasFeedback) compressed.hf = 1;
  if (filters.hasProject) compressed.hp = 1;

  if (Object.keys(compressed).length === 0) return "";
  
  return btoa(JSON.stringify(compressed));
}

// Deserialize URL string back to filter state
export function deserializeFilters(encoded: string): Partial<ContactFilter> | null {
  if (!encoded) return null;
  
  try {
    const compressed = JSON.parse(atob(encoded));
    const filters: Partial<ContactFilter> = {};
    
    if (compressed.s) filters.search = compressed.s;
    if (compressed.ls) filters.lifecycleStage = compressed.ls;
    if (compressed.ai) filters.aiExperienceLevel = compressed.ai;
    if (compressed.ar) filters.ageRange = compressed.ar;
    if (compressed.ir) filters.incomeRange = compressed.ir;
    if (compressed.co) filters.cohort = compressed.co;
    if (compressed.t) filters.tags = compressed.t;
    if (compressed.ea) filters.eventAttendeesOnly = true;
    if (compressed.bd) filters.buildDayOnly = true;
    if (compressed.d6) filters.dec6Workshop = true;
    if (compressed.d13) filters.dec13LTF = true;
    if (compressed.s27) filters.sept27BuildDay = true;
    if (compressed.hf) filters.hasFeedback = true;
    if (compressed.hp) filters.hasProject = true;
    
    return filters;
  } catch {
    return null;
  }
}

// Generate shareable URL with current filters
export function generateShareableUrl(filters: ContactFilter): string {
  const encoded = serializeFilters(filters);
  const baseUrl = window.location.origin + window.location.pathname;
  
  if (!encoded) return baseUrl;
  return `${baseUrl}?filters=${encoded}`;
}

// Get filters from URL query params
export function getFiltersFromUrl(): Partial<ContactFilter> | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("filters");
  return encoded ? deserializeFilters(encoded) : null;
}
