import { Contact, hasValidDisplayName } from "@/types/contact";

interface CompletenessField {
  key: string;
  label: string;
  weight: number;
  check: (contact: Contact) => boolean;
}

const COMPLETENESS_FIELDS: CompletenessField[] = [
  { key: "name", label: "Name", weight: 15, check: (c) => hasValidDisplayName(c) },
  { key: "email", label: "Email", weight: 15, check: (c) => !!c.email?.trim() },
  { key: "phone", label: "Phone", weight: 10, check: (c) => !!c.phone?.trim() },
  { key: "location", label: "Location", weight: 10, check: (c) => !!(c.city?.trim() || c.state?.trim()) },
  { key: "jobTitle", label: "Job Title", weight: 10, check: (c) => !!c.jobTitle?.trim() },
  { key: "company", label: "Company", weight: 10, check: (c) => !!c.companyName?.trim() },
  { key: "aiLevel", label: "AI Experience", weight: 15, check: (c) => !!c.aiExperienceLevel?.trim() },
  { key: "lifecycleStage", label: "Lifecycle Stage", weight: 15, check: (c) => !!c.lifecycleStage?.trim() },
];

export function getCompletenessScore(contact: Contact): number {
  const totalWeight = COMPLETENESS_FIELDS.reduce((sum, f) => sum + f.weight, 0);
  const filledWeight = COMPLETENESS_FIELDS.reduce((sum, f) => {
    return sum + (f.check(contact) ? f.weight : 0);
  }, 0);
  return Math.round((filledWeight / totalWeight) * 100);
}

export function getMissingFields(contact: Contact): string[] {
  return COMPLETENESS_FIELDS
    .filter((f) => !f.check(contact))
    .map((f) => f.label);
}

export function getFilledFields(contact: Contact): string[] {
  return COMPLETENESS_FIELDS
    .filter((f) => f.check(contact))
    .map((f) => f.label);
}

export function getCompletenessColor(score: number): {
  text: string;
  bg: string;
  ring: string;
} {
  if (score >= 80) {
    return {
      text: "text-emerald-500",
      bg: "bg-emerald-500",
      ring: "ring-emerald-500/50",
    };
  }
  if (score >= 50) {
    return {
      text: "text-amber-500",
      bg: "bg-amber-500",
      ring: "ring-amber-500/50",
    };
  }
  return {
    text: "text-red-500",
    bg: "bg-red-500",
    ring: "ring-red-500/50",
  };
}

export function getCompletenessLabel(score: number): string {
  if (score >= 80) return "Complete";
  if (score >= 50) return "Partial";
  return "Incomplete";
}
