import { useState, useCallback } from "react";

const TAGS_STORAGE_KEY = "crm-contact-tags";

export interface ContactTagData {
  contactId: string;
  tags: string[];
  updatedAt: string;
}

// Preset tag suggestions
export const PRESET_TAGS = [
  { label: "VIP", color: "gold" },
  { label: "Follow-up Needed", color: "destructive" },
  { label: "High Engagement", color: "primary" },
  { label: "Mentor Candidate", color: "accent" },
  { label: "Speaker", color: "chart-purple" },
  { label: "Volunteer", color: "chart-blue" },
  { label: "Partner", color: "chart-emerald" },
  { label: "Sponsor", color: "chart-amber" },
] as const;

export function useContactTags() {
  const [tagData, setTagData] = useState<Record<string, ContactTagData>>(() => {
    const saved = localStorage.getItem(TAGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const getTags = useCallback((contactId: string): string[] => {
    return tagData[contactId]?.tags || [];
  }, [tagData]);

  const addTag = useCallback((contactId: string, tag: string) => {
    setTagData(prev => {
      const existing = prev[contactId]?.tags || [];
      if (existing.includes(tag)) return prev;
      
      const updated = {
        ...prev,
        [contactId]: {
          contactId,
          tags: [...existing, tag],
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeTag = useCallback((contactId: string, tag: string) => {
    setTagData(prev => {
      const existing = prev[contactId]?.tags || [];
      const updated = {
        ...prev,
        [contactId]: {
          contactId,
          tags: existing.filter(t => t !== tag),
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setTags = useCallback((contactId: string, tags: string[]) => {
    setTagData(prev => {
      const updated = {
        ...prev,
        [contactId]: {
          contactId,
          tags,
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getAllUniqueTags = useCallback((): string[] => {
    const allTags = new Set<string>();
    Object.values(tagData).forEach(data => {
      data.tags.forEach(tag => allTags.add(tag));
    });
    // Add preset tags
    PRESET_TAGS.forEach(preset => allTags.add(preset.label));
    return Array.from(allTags).sort();
  }, [tagData]);

  const hasTags = useCallback((contactId: string): boolean => {
    return (tagData[contactId]?.tags?.length || 0) > 0;
  }, [tagData]);

  const getContactsWithTag = useCallback((tag: string): string[] => {
    return Object.entries(tagData)
      .filter(([_, data]) => data.tags.includes(tag))
      .map(([contactId]) => contactId);
  }, [tagData]);

  return { 
    getTags, 
    addTag, 
    removeTag, 
    setTags, 
    getAllUniqueTags, 
    hasTags,
    getContactsWithTag,
  };
}
