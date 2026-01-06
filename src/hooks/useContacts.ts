import { useState, useEffect, useMemo, useCallback } from "react";
import Papa from "papaparse";
import { Contact, ContactFilter, parseContact, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay } from "@/types/contact";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Convert database row to Contact interface
function dbRowToContact(row: any): Contact {
  return {
    recordId: row.record_id || row.id,
    uid: row.uid || '',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    fullName: row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    email: row.email || '',
    phone: row.phone || '',
    ageRange: row.age_range || '',
    city: row.city || '',
    state: row.state || '',
    postalCode: row.postal_code || '',
    country: row.country || '',
    companyName: row.company_name || '',
    jobTitle: row.job_title || '',
    industry: row.industry || '',
    currentRole: row.role_description || '',
    lifecycleStage: row.lifecycle_stage || '',
    leadStatus: row.lead_status || '',
    contactOwner: row.contact_owner || '',
    createDate: row.create_date || '',
    lastActivityDate: row.last_activity_date || '',
    lastModifiedDate: row.last_modified_date || '',
    aiExperienceLevel: row.ai_experience_level || '',
    aiConfidence: row.ai_confidence || '',
    preWorkshopMindset: row.pre_workshop_mindset || '',
    postWorkshopMindset: row.post_workshop_mindset || '',
    incomeRange: row.income_range || '',
    cohort1AiLevel: row.cohort1_ai_level || '',
    cohort1Industry: row.cohort1_industry || '',
    eventsAttended: row.events_attended || '',
    sept27thReg: row.sept27th_reg || '',
    marketingContactStatus: row.marketing_contact_status || '',
    emailDomain: row.email_domain || '',
    recordSource: row.record_source || '',
    communityInvolvement: row.community_involvement || '',
    volunteerInterest: row.volunteer_interest || '',
    linkedinUrl: row.linkedin_url || '',
    npsScore: row.nps_score || '',
    afterEventOpportunities: row.after_event_opportunities || '',
    newConceptLearned: row.new_concept_learned || '',
    optionalQuote: row.optional_quote || '',
    teamBuildDescription: row.team_build_description || '',
    aiToolsUsed: row.ai_tools_used || '',
    rolesOnTeam: row.roles_on_team || '',
    teamImpact: row.team_impact || '',
    ahaMoment: row.aha_moment || '',
    favoritePart: row.favorite_part || '',
    oneWayToUseAI: row.one_way_to_use_ai || '',
    wishCoveredMore: row.wish_covered_more || '',
    attendFollowUp: row.attend_follow_up || '',
    postEventAIConfidence: row.post_event_ai_confidence || '',
    responsibleAIPreparedness: row.responsible_ai_preparedness || '',
    aiTaskUnderstanding: row.ai_task_understanding || '',
    strongestSkillAfterToday: row.strongest_skill_after_today || '',
    knewTeamBefore: row.knew_team_before || '',
    spaceFeltWelcoming: row.space_felt_welcoming || '',
    biasResponsibility: row.bias_responsibility || '',
    teamCommunityDesign: row.team_community_design || '',
    releaseSigned: row.release_signed || false,
    releaseDate: row.release_date || '',
    releaseSignatureUrl: row.release_signature_url || '',
    imageReleaseAgreed: row.image_release_agreed || false,
    confidentialityAgreed: row.confidentiality_agreed || false,
    rawData: row.raw_data || {},
  };
}

// Convert Contact to database row format
function contactToDbRow(contact: Contact) {
  return {
    record_id: contact.recordId || null,
    uid: contact.uid || null,
    first_name: contact.firstName || null,
    last_name: contact.lastName || null,
    full_name: contact.fullName || null,
    email: contact.email || null,
    phone: contact.phone || null,
    age_range: contact.ageRange || null,
    city: contact.city || null,
    state: contact.state || null,
    postal_code: contact.postalCode || null,
    country: contact.country || null,
    company_name: contact.companyName || null,
    job_title: contact.jobTitle || null,
    industry: contact.industry || null,
    role_description: contact.currentRole || null,
    lifecycle_stage: contact.lifecycleStage || null,
    lead_status: contact.leadStatus || null,
    contact_owner: contact.contactOwner || null,
    create_date: contact.createDate || null,
    last_activity_date: contact.lastActivityDate || null,
    last_modified_date: contact.lastModifiedDate || null,
    ai_experience_level: contact.aiExperienceLevel || null,
    ai_confidence: contact.aiConfidence || null,
    pre_workshop_mindset: contact.preWorkshopMindset || null,
    post_workshop_mindset: contact.postWorkshopMindset || null,
    income_range: contact.incomeRange || null,
    cohort1_ai_level: contact.cohort1AiLevel || null,
    cohort1_industry: contact.cohort1Industry || null,
    events_attended: contact.eventsAttended || null,
    sept27th_reg: contact.sept27thReg || null,
    marketing_contact_status: contact.marketingContactStatus || null,
    email_domain: contact.emailDomain || null,
    record_source: contact.recordSource || null,
    community_involvement: contact.communityInvolvement || null,
    volunteer_interest: contact.volunteerInterest || null,
    linkedin_url: contact.linkedinUrl || null,
    nps_score: contact.npsScore || null,
    after_event_opportunities: contact.afterEventOpportunities || null,
    new_concept_learned: contact.newConceptLearned || null,
    optional_quote: contact.optionalQuote || null,
    team_build_description: contact.teamBuildDescription || null,
    ai_tools_used: contact.aiToolsUsed || null,
    roles_on_team: contact.rolesOnTeam || null,
    team_impact: contact.teamImpact || null,
    aha_moment: contact.ahaMoment || null,
    favorite_part: contact.favoritePart || null,
    one_way_to_use_ai: contact.oneWayToUseAI || null,
    wish_covered_more: contact.wishCoveredMore || null,
    attend_follow_up: contact.attendFollowUp || null,
    post_event_ai_confidence: contact.postEventAIConfidence || null,
    responsible_ai_preparedness: contact.responsibleAIPreparedness || null,
    ai_task_understanding: contact.aiTaskUnderstanding || null,
    strongest_skill_after_today: contact.strongestSkillAfterToday || null,
    knew_team_before: contact.knewTeamBefore || null,
    space_felt_welcoming: contact.spaceFeltWelcoming || null,
    bias_responsibility: contact.biasResponsibility || null,
    team_community_design: contact.teamCommunityDesign || null,
    release_signed: contact.releaseSigned || false,
    release_date: contact.releaseDate || null,
    release_signature_url: contact.releaseSignatureUrl || null,
    image_release_agreed: contact.imageReleaseAgreed || false,
    confidentiality_agreed: contact.confidentialityAgreed || false,
    raw_data: contact.rawData || {},
  };
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load contacts from database and/or CSV
  useEffect(() => {
    const loadContacts = async () => {
      try {
        // First, try to load from database
        const { data: dbContacts, error: dbError } = await supabase
          .from('contacts')
          .select('*');

        if (dbError) {
          console.warn('Database contacts load error:', dbError);
        }

        // Also load from CSV as fallback/initial data source
        const csvResponse = await fetch("/contacts.csv");
        const csvText = await csvResponse.text();
        
        const csvContacts: Contact[] = [];
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              csvContacts.push(parseContact(row));
            });
          },
        });

        // Merge database and CSV contacts, preferring database records
        const dbContactMap = new Map<string, Contact>();
        if (dbContacts && dbContacts.length > 0) {
          dbContacts.forEach(row => {
            const contact = dbRowToContact(row);
            if (contact.recordId) {
              dbContactMap.set(contact.recordId, contact);
            }
            if (contact.email) {
              dbContactMap.set(contact.email.toLowerCase(), contact);
            }
          });
        }

        // Add CSV contacts that aren't in database
        const mergedContacts: Contact[] = [];
        const seenIds = new Set<string>();
        
        // Add all database contacts first
        dbContactMap.forEach((contact, key) => {
          if (contact.recordId && !seenIds.has(contact.recordId)) {
            mergedContacts.push(contact);
            seenIds.add(contact.recordId);
          }
        });

        // Add CSV contacts that aren't duplicates
        csvContacts.forEach(contact => {
          const isDuplicate = 
            (contact.recordId && seenIds.has(contact.recordId)) ||
            (contact.email && dbContactMap.has(contact.email.toLowerCase()));
          
          if (!isDuplicate) {
            mergedContacts.push(contact);
            if (contact.recordId) seenIds.add(contact.recordId);
          }
        });

        setContacts(mergedContacts);
        setLoading(false);
      } catch (err) {
        console.error('Error loading contacts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contacts');
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('contacts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('Real-time contact update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newContact = dbRowToContact(payload.new);
            setContacts(prev => {
              // Check if already exists
              const exists = prev.some(c => 
                c.recordId === newContact.recordId || 
                (c.email && newContact.email && c.email.toLowerCase() === newContact.email.toLowerCase())
              );
              if (exists) {
                // Update existing
                return prev.map(c => 
                  c.recordId === newContact.recordId || 
                  (c.email && newContact.email && c.email.toLowerCase() === newContact.email.toLowerCase())
                    ? newContact : c
                );
              }
              return [...prev, newContact];
            });
            toast.success('New contact added', { description: newContact.fullName || newContact.email });
          } else if (payload.eventType === 'UPDATE') {
            const updatedContact = dbRowToContact(payload.new);
            setContacts(prev => prev.map(c => 
              c.recordId === updatedContact.recordId ? updatedContact : c
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.record_id;
            setContacts(prev => prev.filter(c => c.recordId !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add contacts to database (real-time will update state)
  const addContacts = useCallback(async (newContacts: Contact[]) => {
    try {
      // Filter out duplicates
      const existingIds = new Set(contacts.map(c => c.recordId));
      const existingEmails = new Set(contacts.map(c => c.email?.toLowerCase()).filter(Boolean));
      
      const uniqueNew = newContacts.filter(c => {
        const isDuplicateId = c.recordId && existingIds.has(c.recordId);
        const isDuplicateEmail = c.email && existingEmails.has(c.email.toLowerCase());
        return !isDuplicateId && !isDuplicateEmail;
      });

      if (uniqueNew.length === 0) {
        toast.info('No new contacts to add', { description: 'All contacts already exist' });
        return;
      }

      // Insert into database
      const dbRows = uniqueNew.map(contactToDbRow);
      const { error: insertError } = await supabase
        .from('contacts')
        .insert(dbRows);

      if (insertError) {
        console.error('Error inserting contacts:', insertError);
        // Fall back to local state update
        setContacts(prev => [...prev, ...uniqueNew]);
        toast.warning('Contacts added locally', { description: 'Database sync may be delayed' });
      } else {
        toast.success(`${uniqueNew.length} contacts added`, { description: 'Data synced across all views' });
      }
    } catch (err) {
      console.error('Error adding contacts:', err);
      // Fall back to local state
      setContacts(prev => [...prev, ...newContacts]);
    }
  }, [contacts]);

  // Merge contacts in database
  const mergeContacts = useCallback(async (mergedContact: Contact, removedIds: string[]) => {
    try {
      // Update the primary contact
      const { error: updateError } = await supabase
        .from('contacts')
        .upsert(contactToDbRow(mergedContact), { onConflict: 'record_id' });

      if (updateError) {
        console.error('Error updating merged contact:', updateError);
      }

      // Delete the removed contacts
      if (removedIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('contacts')
          .delete()
          .in('record_id', removedIds);

        if (deleteError) {
          console.error('Error deleting merged contacts:', deleteError);
        }
      }

      // Update local state immediately
      setContacts(prev => {
        const filtered = prev.filter(c => !removedIds.includes(c.recordId));
        return filtered.map(c => 
          c.recordId === mergedContact.recordId ? mergedContact : c
        );
      });

      toast.success('Contacts merged', { description: 'Changes synced everywhere' });
    } catch (err) {
      console.error('Error merging contacts:', err);
      // Fall back to local state update
      setContacts(prev => {
        const filtered = prev.filter(c => !removedIds.includes(c.recordId));
        return filtered.map(c => 
          c.recordId === mergedContact.recordId ? mergedContact : c
        );
      });
    }
  }, []);

  // Update a single contact
  const updateContact = useCallback(async (contact: Contact) => {
    try {
      const { error: updateError } = await supabase
        .from('contacts')
        .upsert(contactToDbRow(contact), { onConflict: 'record_id' });

      if (updateError) {
        console.error('Error updating contact:', updateError);
        // Update local state
        setContacts(prev => prev.map(c => 
          c.recordId === contact.recordId ? contact : c
        ));
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      setContacts(prev => prev.map(c => 
        c.recordId === contact.recordId ? contact : c
      ));
    }
  }, []);

  // Sync CSV contacts to database (one-time import)
  const syncCsvToDatabase = useCallback(async () => {
    try {
      const csvContacts = contacts.filter(c => c.recordId);
      const dbRows = csvContacts.map(contactToDbRow);
      
      // Upsert all contacts
      const { error } = await supabase
        .from('contacts')
        .upsert(dbRows, { onConflict: 'record_id', ignoreDuplicates: false });

      if (error) {
        console.error('Error syncing to database:', error);
        toast.error('Sync failed', { description: error.message });
      } else {
        toast.success(`${csvContacts.length} contacts synced to database`);
      }
    } catch (err) {
      console.error('Error syncing contacts:', err);
      toast.error('Sync failed');
    }
  }, [contacts]);

  return { 
    contacts, 
    loading, 
    error, 
    addContacts, 
    mergeContacts, 
    updateContact,
    syncCsvToDatabase 
  };
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