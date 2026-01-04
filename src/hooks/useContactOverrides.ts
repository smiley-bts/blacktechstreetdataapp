import { useState, useCallback } from "react";
import { Contact } from "@/types/contact";

const OVERRIDES_STORAGE_KEY = "crm-contact-overrides";

export interface ContactOverride {
  contactId: string;
  fields: Record<string, string>;
  updatedAt: string;
}

// Fields that can be edited
export const EDITABLE_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "postalCode", label: "Postal Code" },
  { key: "country", label: "Country" },
  { key: "companyName", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "industry", label: "Industry" },
  { key: "currentRole", label: "Current Role" },
  { key: "linkedinUrl", label: "LinkedIn URL" },
] as const;

export type EditableFieldKey = typeof EDITABLE_FIELDS[number]["key"];

export function useContactOverrides() {
  const [overrides, setOverrides] = useState<Record<string, ContactOverride>>(() => {
    const saved = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const getOverrides = useCallback((contactId: string): Record<string, string> => {
    return overrides[contactId]?.fields || {};
  }, [overrides]);

  const getFieldValue = useCallback((contactId: string, field: string): string | undefined => {
    return overrides[contactId]?.fields?.[field];
  }, [overrides]);

  const setFieldOverride = useCallback((contactId: string, field: string, value: string) => {
    setOverrides(prev => {
      const existing = prev[contactId]?.fields || {};
      const updated = {
        ...prev,
        [contactId]: {
          contactId,
          fields: { ...existing, [field]: value },
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setMultipleOverrides = useCallback((contactId: string, fields: Record<string, string>) => {
    setOverrides(prev => {
      const existing = prev[contactId]?.fields || {};
      const updated = {
        ...prev,
        [contactId]: {
          contactId,
          fields: { ...existing, ...fields },
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFieldOverride = useCallback((contactId: string, field: string) => {
    setOverrides(prev => {
      const existing = prev[contactId]?.fields || {};
      const { [field]: _, ...rest } = existing;
      const updated = {
        ...prev,
        [contactId]: {
          contactId,
          fields: rest,
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllOverrides = useCallback((contactId: string) => {
    setOverrides(prev => {
      const { [contactId]: _, ...rest } = prev;
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(rest));
      return rest;
    });
  }, []);

  const hasOverrides = useCallback((contactId: string): boolean => {
    const fields = overrides[contactId]?.fields || {};
    return Object.keys(fields).length > 0;
  }, [overrides]);

  const getEditedFieldCount = useCallback((contactId: string): number => {
    return Object.keys(overrides[contactId]?.fields || {}).length;
  }, [overrides]);

  // Merge original contact with overrides
  const mergeWithOverrides = useCallback((contact: Contact): Contact => {
    const contactOverrides = overrides[contact.recordId]?.fields || {};
    return {
      ...contact,
      ...contactOverrides,
      // Update fullName if first or last name was overridden
      fullName: contactOverrides.firstName || contactOverrides.lastName
        ? `${contactOverrides.firstName || contact.firstName} ${contactOverrides.lastName || contact.lastName}`.trim()
        : contact.fullName,
    };
  }, [overrides]);

  return {
    getOverrides,
    getFieldValue,
    setFieldOverride,
    setMultipleOverrides,
    removeFieldOverride,
    clearAllOverrides,
    hasOverrides,
    getEditedFieldCount,
    mergeWithOverrides,
  };
}
