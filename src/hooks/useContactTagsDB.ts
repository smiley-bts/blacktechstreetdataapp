import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const TAGS_STORAGE_KEY = "crm-contact-tags";

interface ContactTagData {
  contactId: string;
  tags: string[];
  updatedAt: string;
}

export const PRESET_TAGS = [
  { label: "VIP", color: "bg-amber-500" },
  { label: "Follow Up", color: "bg-blue-500" },
  { label: "Volunteer", color: "bg-emerald-500" },
  { label: "Speaker", color: "bg-purple-500" },
  { label: "Partner", color: "bg-pink-500" },
  { label: "Alumni", color: "bg-indigo-500" },
  { label: "Mentor", color: "bg-teal-500" },
  { label: "Needs Outreach", color: "bg-orange-500" },
];

export function useContactTags() {
  const { user } = useAuth();
  const [tagData, setTagData] = useState<Record<string, ContactTagData>>(() => {
    // Initialize from localStorage as fallback
    const saved = localStorage.getItem(TAGS_STORAGE_KEY);
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
          .from('contact_tags')
          .select('*');

        if (error) {
          console.error('Error loading tags from database:', error);
          return;
        }

        if (data && data.length > 0) {
          setUsesDatabase(true);
          // Group tags by contact_id
          const grouped: Record<string, ContactTagData> = {};
          data.forEach((row) => {
            if (!grouped[row.contact_id]) {
              grouped[row.contact_id] = {
                contactId: row.contact_id,
                tags: [],
                updatedAt: row.created_at,
              };
            }
            grouped[row.contact_id].tags.push(row.tag);
          });
          setTagData(grouped);
        }
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDatabase();
  }, [user]);

  // Save to localStorage as fallback
  useEffect(() => {
    if (!usesDatabase) {
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tagData));
    }
  }, [tagData, usesDatabase]);

  const getTags = useCallback((contactId: string): string[] => {
    return tagData[contactId]?.tags || [];
  }, [tagData]);

  const addTag = useCallback(async (contactId: string, tag: string) => {
    const existing = tagData[contactId]?.tags || [];
    if (existing.includes(tag)) return;

    const updated = {
      ...tagData,
      [contactId]: {
        contactId,
        tags: [...existing, tag],
        updatedAt: new Date().toISOString(),
      },
    };
    setTagData(updated);

    // Save to database if authenticated
    if (user && usesDatabase) {
      try {
        await supabase.from('contact_tags').insert({
          contact_id: contactId,
          tag,
          created_by: user.id,
        });
      } catch (error) {
        console.error('Error saving tag to database:', error);
      }
    }
  }, [tagData, user, usesDatabase]);

  const removeTag = useCallback(async (contactId: string, tag: string) => {
    const existing = tagData[contactId]?.tags || [];
    const updated = {
      ...tagData,
      [contactId]: {
        contactId,
        tags: existing.filter((t) => t !== tag),
        updatedAt: new Date().toISOString(),
      },
    };
    setTagData(updated);

    // Remove from database if authenticated
    if (user && usesDatabase) {
      try {
        await supabase
          .from('contact_tags')
          .delete()
          .eq('contact_id', contactId)
          .eq('tag', tag);
      } catch (error) {
        console.error('Error removing tag from database:', error);
      }
    }
  }, [tagData, user, usesDatabase]);

  const setTags = useCallback(async (contactId: string, tags: string[]) => {
    const updated = {
      ...tagData,
      [contactId]: {
        contactId,
        tags,
        updatedAt: new Date().toISOString(),
      },
    };
    setTagData(updated);

    // Sync to database if authenticated
    if (user && usesDatabase) {
      try {
        // Delete existing tags
        await supabase
          .from('contact_tags')
          .delete()
          .eq('contact_id', contactId);

        // Insert new tags
        if (tags.length > 0) {
          await supabase.from('contact_tags').insert(
            tags.map(tag => ({
              contact_id: contactId,
              tag,
              created_by: user.id,
            }))
          );
        }
      } catch (error) {
        console.error('Error syncing tags to database:', error);
      }
    }
  }, [tagData, user, usesDatabase]);

  const getAllUniqueTags = useCallback((): string[] => {
    const allTags = new Set<string>();
    
    // Add preset tags
    PRESET_TAGS.forEach((p) => allTags.add(p.label));
    
    // Add user-created tags
    Object.values(tagData).forEach((data) => {
      data.tags.forEach((tag) => allTags.add(tag));
    });
    
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

  // Migrate localStorage to database
  const migrateToDatabase = useCallback(async () => {
    if (!user || usesDatabase) return;
    
    setIsLoading(true);
    try {
      const localData = localStorage.getItem(TAGS_STORAGE_KEY);
      if (!localData) return;
      
      const parsed = JSON.parse(localData) as Record<string, ContactTagData>;
      const inserts: { contact_id: string; tag: string; created_by: string }[] = [];
      
      Object.values(parsed).forEach(data => {
        data.tags.forEach(tag => {
          inserts.push({
            contact_id: data.contactId,
            tag,
            created_by: user.id,
          });
        });
      });
      
      if (inserts.length > 0) {
        const { error } = await supabase.from('contact_tags').insert(inserts);
        if (!error) {
          setUsesDatabase(true);
          console.log('Migrated', inserts.length, 'tags to database');
        }
      }
    } catch (error) {
      console.error('Error migrating tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, usesDatabase]);

  return {
    getTags,
    addTag,
    removeTag,
    setTags,
    getAllUniqueTags,
    hasTags,
    getContactsWithTag,
    isLoading,
    migrateToDatabase,
    usesDatabase,
  };
}
