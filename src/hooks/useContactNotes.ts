import { useState, useCallback } from "react";

const NOTES_STORAGE_KEY = "crm-contact-notes";

export interface ContactNote {
  contactId: string;
  note: string;
  updatedAt: string;
}

export function useContactNotes() {
  const [notes, setNotes] = useState<Record<string, ContactNote>>(() => {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const getNote = useCallback((contactId: string): string => {
    return notes[contactId]?.note || "";
  }, [notes]);

  const setNote = useCallback((contactId: string, note: string) => {
    const updated = {
      ...notes,
      [contactId]: {
        contactId,
        note,
        updatedAt: new Date().toISOString(),
      },
    };
    setNotes(updated);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
  }, [notes]);

  const hasNote = useCallback((contactId: string): boolean => {
    return !!(notes[contactId]?.note?.trim());
  }, [notes]);

  return { getNote, setNote, hasNote };
}
