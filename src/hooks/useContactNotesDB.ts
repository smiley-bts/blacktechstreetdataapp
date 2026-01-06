import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const NOTES_STORAGE_KEY = "crm-contact-notes";

export interface ContactNote {
  contactId: string;
  note: string;
  updatedAt: string;
}

export function useContactNotesDB() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Record<string, ContactNote>>(() => {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState(false);
  const [usesDatabase, setUsesDatabase] = useState(false);

  // Load from database if authenticated
  useEffect(() => {
    const loadFromDatabase = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('contact_notes')
          .select('*');

        if (error) {
          console.error('Error loading notes from database:', error);
          return;
        }

        if (data) {
          setUsesDatabase(true);
          const mapped: Record<string, ContactNote> = {};
          data.forEach((row) => {
            mapped[row.contact_id] = {
              contactId: row.contact_id,
              note: row.note,
              updatedAt: row.updated_at,
            };
          });
          if (Object.keys(mapped).length > 0) {
            setNotes(mapped);
          }
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDatabase();
  }, [user]);

  // Save to localStorage as fallback
  useEffect(() => {
    if (!usesDatabase) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, usesDatabase]);

  const getNote = useCallback((contactId: string): string => {
    return notes[contactId]?.note || "";
  }, [notes]);

  const setNote = useCallback(async (contactId: string, note: string) => {
    const updated = {
      ...notes,
      [contactId]: {
        contactId,
        note,
        updatedAt: new Date().toISOString(),
      },
    };
    setNotes(updated);

    // Save to database if authenticated
    if (user && usesDatabase) {
      try {
        if (note.trim()) {
          await supabase.from('contact_notes').upsert({
            contact_id: contactId,
            note,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'contact_id' });
        } else {
          await supabase
            .from('contact_notes')
            .delete()
            .eq('contact_id', contactId);
        }
      } catch (error) {
        console.error('Error saving note to database:', error);
      }
    }
  }, [notes, user, usesDatabase]);

  const hasNote = useCallback((contactId: string): boolean => {
    return !!(notes[contactId]?.note?.trim());
  }, [notes]);

  // Migrate localStorage to database
  const migrateToDatabase = useCallback(async () => {
    if (!user || usesDatabase) return;
    
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(NOTES_STORAGE_KEY);
      if (!localData) return;
      
      const parsed = JSON.parse(localData) as Record<string, ContactNote>;
      const upserts = Object.values(parsed)
        .filter(n => n.note?.trim())
        .map(n => ({
          contact_id: n.contactId,
          note: n.note,
          updated_by: user.id,
        }));
      
      if (upserts.length > 0) {
        const { error } = await supabase.from('contact_notes').upsert(upserts, {
          onConflict: 'contact_id'
        });
        if (!error) {
          setUsesDatabase(true);
          console.log('Migrated', upserts.length, 'notes to database');
        }
      }
    } catch (error) {
      console.error('Error migrating notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, usesDatabase]);

  return { getNote, setNote, hasNote, isLoading, migrateToDatabase, usesDatabase };
}
