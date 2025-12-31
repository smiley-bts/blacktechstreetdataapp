import { useState, useEffect, useMemo, useCallback } from "react";
import Papa from "papaparse";
import { Contact, ContactFilter, parseContact, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay } from "@/types/contact";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/contacts.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedContacts = results.data.map((row: any) => parseContact(row));
            setContacts(parsedContacts);
            setLoading(false);
          },
          error: (err: any) => {
            setError(err.message);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const addContacts = useCallback((newContacts: Contact[]) => {
    setContacts(prev => {
      // Merge by recordId or email to avoid duplicates
      const existingIds = new Set(prev.map(c => c.recordId));
      const existingEmails = new Set(prev.map(c => c.email?.toLowerCase()).filter(Boolean));
      
      const uniqueNew = newContacts.filter(c => {
        const isDuplicateId = c.recordId && existingIds.has(c.recordId);
        const isDuplicateEmail = c.email && existingEmails.has(c.email.toLowerCase());
        return !isDuplicateId && !isDuplicateEmail;
      });
      
      return [...prev, ...uniqueNew];
    });
  }, []);

  return { contacts, loading, error, addContacts };
}

export function useFilteredContacts(contacts: Contact[], filters: ContactFilter) {
  return useMemo(() => {
    return contacts.filter((contact) => {
      // Search filter (UID, name, email, phone)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchMatch = 
          contact.uid?.toLowerCase().includes(searchLower) ||
          contact.firstName?.toLowerCase().includes(searchLower) ||
          contact.lastName?.toLowerCase().includes(searchLower) ||
          contact.fullName?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.phone?.includes(filters.search) ||
          contact.recordId?.includes(filters.search);
        
        if (!searchMatch) return false;
      }

      // Lifecycle stage filter
      if (filters.lifecycleStage.length > 0) {
        if (!filters.lifecycleStage.includes(contact.lifecycleStage)) return false;
      }

      // AI Experience filter
      if (filters.aiExperienceLevel.length > 0) {
        const hasMatch = filters.aiExperienceLevel.some(level => 
          contact.aiExperienceLevel?.toLowerCase().includes(level.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      // Age range filter
      if (filters.ageRange.length > 0) {
        if (!filters.ageRange.includes(contact.ageRange)) return false;
      }

      // Income range filter  
      if (filters.incomeRange.length > 0) {
        if (!filters.incomeRange.includes(contact.incomeRange)) return false;
      }

      // Event-specific filters
      if (filters.dec6Workshop && !isDec6Workshop(contact)) return false;
      if (filters.dec13LTF && !isDec13LTF(contact)) return false;
      if (filters.sept27BuildDay && !isSept27BuildDay(contact)) return false;
      if (filters.hasFeedback && !hasEventFeedback(contact)) return false;
      if (filters.hasProject && !hasBuildDayData(contact)) return false;

      return true;
    });
  }, [contacts, filters]);
}

export function getUniqueValues(contacts: Contact[], field: keyof Contact): string[] {
  const values = new Set<string>();
  contacts.forEach((contact) => {
    const value = contact[field];
    if (value && typeof value === 'string' && value.trim()) {
      values.add(value.trim());
    }
  });
  return Array.from(values).sort();
}
