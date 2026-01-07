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
    eventsActuallyAttended: row.events_actually_attended || '',
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

// Parse CSV contacts for import
async function parseCsvContacts(): Promise<any[]> {
  const csvResponse = await fetch("/contacts.csv");
  const csvText = await csvResponse.text();
  
  return new Promise((resolve) => {
    const contacts: any[] = [];
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row: any) => {
          const contact = parseContact(row);
          contacts.push(contactToDbRow(contact));
        });
        resolve(contacts);
      },
    });
  });
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [needsImport, setNeedsImport] = useState(false);

  // Load contacts from database ONLY
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load from database - paginate because PostgREST may cap responses (often 1000 rows)
      const pageSize = 1000;
      const allRows: any[] = [];

      for (let from = 0; ; from += pageSize) {
        const to = from + pageSize - 1;
        const { data, error: pageError } = await supabase
          .from('contacts')
          .select('*')
          .range(from, to);

        if (pageError) {
          console.error('Database contacts load error:', pageError);
          setError(pageError.message);
          setLoading(false);
          return;
        }

        const page = data ?? [];
        allRows.push(...page);

        // last page
        if (page.length < pageSize) break;
      }

      const loadedContacts = allRows.map(dbRowToContact);
      setContacts(loadedContacts);
      
      // Check if we need to import CSV data
      if (loadedContacts.length < 100) {
        // Database seems empty, might need CSV import
        setNeedsImport(true);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

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

  // Import CSV contacts to database
  const importCsvToDatabase = useCallback(async () => {
    try {
      setImporting(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to import contacts');
        setImporting(false);
        return;
      }

      // Parse CSV contacts
      const csvContacts = await parseCsvContacts();
      
      if (csvContacts.length === 0) {
        toast.info('No contacts found in CSV');
        setImporting(false);
        return;
      }

      toast.loading(`Importing ${csvContacts.length} contacts...`, { id: 'import-progress' });

      // Call edge function to import
      const response = await supabase.functions.invoke('import-csv-contacts', {
        body: { contacts: csvContacts }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      toast.dismiss('import-progress');
      
      if (result.inserted > 0) {
        toast.success(`Imported ${result.inserted} contacts`, {
          description: result.skipped > 0 ? `${result.skipped} duplicates skipped` : undefined
        });
      } else {
        toast.info('All contacts already in database');
      }

      setNeedsImport(false);
      
      // Reload contacts from database
      await loadContacts();
      
    } catch (err) {
      console.error('Error importing contacts:', err);
      toast.dismiss('import-progress');
      toast.error('Import failed', { 
        description: err instanceof Error ? err.message : 'Unknown error' 
      });
    } finally {
      setImporting(false);
    }
  }, [loadContacts]);

  // Add contacts to database
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
        toast.error('Failed to add contacts', { description: insertError.message });
      } else {
        toast.success(`${uniqueNew.length} contacts added`);
        // Real-time subscription will update the state
      }
    } catch (err) {
      console.error('Error adding contacts:', err);
      toast.error('Failed to add contacts');
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
        toast.error('Failed to merge contacts');
        return;
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

      // Update local state immediately for responsiveness
      setContacts(prev => {
        const filtered = prev.filter(c => !removedIds.includes(c.recordId));
        return filtered.map(c => 
          c.recordId === mergedContact.recordId ? mergedContact : c
        );
      });

      toast.success('Contacts merged');
    } catch (err) {
      console.error('Error merging contacts:', err);
      toast.error('Failed to merge contacts');
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
        toast.error('Failed to update contact');
      }
      // Real-time subscription will update the state
    } catch (err) {
      console.error('Error updating contact:', err);
      toast.error('Failed to update contact');
    }
  }, []);

  // Refresh contacts from database
  const refreshContacts = useCallback(async () => {
    await loadContacts();
  }, [loadContacts]);

  return { 
    contacts, 
    loading, 
    error, 
    importing,
    needsImport,
    addContacts, 
    mergeContacts, 
    updateContact,
    importCsvToDatabase,
    refreshContacts
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
      if (filters.hasFeedback && !hasEventFeedback(contact)) return false;
      if (filters.buildDayOnly && !hasBuildDayData(contact)) return false;
      if (filters.dec6Workshop && !isDec6Workshop(contact)) return false;
      if (filters.dec13LTF && !isDec13LTF(contact)) return false;
      if (filters.sept27BuildDay && !isSept27BuildDay(contact)) return false;

      return true;
    });
  }, [contacts, filters]);
}

// Helper to get unique values for filters
export function getUniqueValues(contacts: Contact[], field: keyof Contact): string[] {
  const values = new Set<string>();
  contacts.forEach(contact => {
    const value = contact[field];
    if (value && typeof value === 'string' && value.trim()) {
      values.add(value.trim());
    }
  });
  return Array.from(values).sort();
}
