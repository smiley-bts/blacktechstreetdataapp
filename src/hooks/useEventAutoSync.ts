import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Contact } from "@/types/contact";
import { 
  june2025SignupToContact, 
  happyHourRsvpToContact,
  sep2025SignupToContact,
  prepareContactsForSync, 
  hasEventBeenSynced, 
  markEventSynced 
} from "@/lib/contactSync";
import { useJune2025Event } from "./useJune2025Event";
import { useHappyHourEvent } from "./useHappyHourEvent";
import { useSep2025Event } from "./useSep2025Event";
import { supabase } from "@/integrations/supabase/client";

interface SyncStatus {
  syncing: boolean;
  lastSync: string | null;
  added: number;
  updated: number;
}

// Convert Contact to database row format (duplicated for isolation)
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
    raw_data: contact.rawData || {},
  };
}

export function useEventAutoSync(existingContacts: Contact[], contactsLoading: boolean) {
  const [status, setStatus] = useState<SyncStatus>({
    syncing: false,
    lastSync: null,
    added: 0,
    updated: 0,
  });
  const { mergedContacts: june2025Merged, loading: june2025Loading } = useJune2025Event();
  const { rsvps: happyHourRsvps, loading: happyHourLoading } = useHappyHourEvent();
  const { signups: sep2025Signups, loading: sep2025Loading } = useSep2025Event();
  
  const syncJune2025Event = useCallback(async () => {
    const eventName = "ASPIRE June 2025";
    
    // Skip if already synced or no data
    if (hasEventBeenSynced(eventName) || june2025Merged.length === 0) {
      return { added: 0, updated: 0 };
    }
    
    // Convert to contact format
    const participants = june2025Merged.map(signup => 
      june2025SignupToContact(signup, signup.attended)
    );
    
    // Prepare for sync
    const { toInsert, toUpdate } = prepareContactsForSync(participants, existingContacts);
    
    let added = 0;
    let updated = 0;
    
    // Insert new contacts
    if (toInsert.length > 0) {
      const dbRows = toInsert.map(contactToDbRow);
      const { error } = await supabase
        .from('contacts')
        .insert(dbRows);
      
      if (error) {
        console.error('Error inserting contacts:', error);
      } else {
        added = toInsert.length;
      }
    }
    
    // Update existing contacts
    if (toUpdate.length > 0) {
      for (const contact of toUpdate) {
        const { error } = await supabase
          .from('contacts')
          .update(contactToDbRow(contact))
          .eq('email', contact.email?.toLowerCase());
        
        if (!error) {
          updated++;
        }
      }
    }
    
    // Mark as synced
    if (added > 0 || updated > 0) {
      markEventSynced(eventName, added + updated);
    }
    
    return { added, updated };
  }, [june2025Merged, existingContacts]);
  
  const syncHappyHourEvent = useCallback(async () => {
    const eventName = "Community Engagement Aug 2025";
    
    // Skip if already synced or no data
    if (hasEventBeenSynced(eventName) || happyHourRsvps.length === 0) {
      return { added: 0, updated: 0 };
    }
    
    // Convert to contact format
    const participants = happyHourRsvps.map(rsvp => happyHourRsvpToContact(rsvp));
    
    // Prepare for sync
    const { toInsert, toUpdate } = prepareContactsForSync(participants, existingContacts);
    
    let added = 0;
    let updated = 0;
    
    // Insert new contacts
    if (toInsert.length > 0) {
      const dbRows = toInsert.map(contactToDbRow);
      const { error } = await supabase
        .from('contacts')
        .insert(dbRows);
      
      if (error) {
        console.error('Error inserting Community Engagement contacts:', error);
      } else {
        added = toInsert.length;
      }
    }
    
    // Update existing contacts
    if (toUpdate.length > 0) {
      for (const contact of toUpdate) {
        const { error } = await supabase
          .from('contacts')
          .update(contactToDbRow(contact))
          .eq('email', contact.email?.toLowerCase());
        
        if (!error) {
          updated++;
        }
      }
    }
    
    // Mark as synced
    if (added > 0 || updated > 0) {
      markEventSynced(eventName, added + updated);
    }
    
    return { added, updated };
  }, [happyHourRsvps, existingContacts]);
  
  const syncSep2025Event = useCallback(async () => {
    const eventName = "ASPIRE Sep 27 2025";
    
    // Skip if already synced or no data
    if (hasEventBeenSynced(eventName) || sep2025Signups.length === 0) {
      return { added: 0, updated: 0 };
    }
    
    // Convert to contact format
    const participants = sep2025Signups.map(signup => sep2025SignupToContact(signup));
    
    // Prepare for sync
    const { toInsert, toUpdate } = prepareContactsForSync(participants, existingContacts);
    
    let added = 0;
    let updated = 0;
    
    // Insert new contacts
    if (toInsert.length > 0) {
      const dbRows = toInsert.map(contactToDbRow);
      const { error } = await supabase
        .from('contacts')
        .insert(dbRows);
      
      if (error) {
        console.error('Error inserting Sep 2025 contacts:', error);
      } else {
        added = toInsert.length;
      }
    }
    
    // Update existing contacts
    if (toUpdate.length > 0) {
      for (const contact of toUpdate) {
        const { error } = await supabase
          .from('contacts')
          .update(contactToDbRow(contact))
          .eq('email', contact.email?.toLowerCase());
        
        if (!error) {
          updated++;
        }
      }
    }
    
    // Mark as synced
    if (added > 0 || updated > 0) {
      markEventSynced(eventName, added + updated);
    }
    
    return { added, updated };
  }, [sep2025Signups, existingContacts]);
  
  // Run sync when data is ready
  useEffect(() => {
    const runSync = async () => {
      // Wait for all data to load
      if (contactsLoading || june2025Loading || happyHourLoading || sep2025Loading) return;
      if (status.syncing) return;
      
      setStatus(prev => ({ ...prev, syncing: true }));
      
      try {
        // Sync all events
        const june2025Result = await syncJune2025Event();
        const happyHourResult = await syncHappyHourEvent();
        const sep2025Result = await syncSep2025Event();
        
        const totalAdded = june2025Result.added + happyHourResult.added + sep2025Result.added;
        const totalUpdated = june2025Result.updated + happyHourResult.updated + sep2025Result.updated;
        
        if (totalAdded > 0 || totalUpdated > 0) {
          toast.success("Event data synced", {
            description: `${totalAdded} new contacts added, ${totalUpdated} contacts updated`,
          });
        }
        
        setStatus({
          syncing: false,
          lastSync: new Date().toISOString(),
          added: totalAdded,
          updated: totalUpdated,
        });
      } catch (err) {
        console.error('Sync error:', err);
        setStatus(prev => ({ ...prev, syncing: false }));
      }
    };
    
    runSync();
  }, [contactsLoading, june2025Loading, happyHourLoading, sep2025Loading, syncJune2025Event, syncHappyHourEvent, syncSep2025Event, status.syncing]);
  
  // Manual sync function (resets the sync flag)
  const forceSyncAll = useCallback(async () => {
    // Clear sync flags
    localStorage.removeItem('contact-sync-aspire-june-2025');
    localStorage.removeItem('contact-sync-happy-hour-aug-2025');
    localStorage.removeItem('contact-sync-aspire-sep-27-2025');
    
    setStatus(prev => ({ ...prev, syncing: true }));
    
    const june2025Result = await syncJune2025Event();
    const happyHourResult = await syncHappyHourEvent();
    const sep2025Result = await syncSep2025Event();
    
    const totalAdded = june2025Result.added + happyHourResult.added + sep2025Result.added;
    const totalUpdated = june2025Result.updated + happyHourResult.updated + sep2025Result.updated;
    
    toast.success("Full sync complete", {
      description: `${totalAdded} added, ${totalUpdated} updated`,
    });
    
    setStatus({
      syncing: false,
      lastSync: new Date().toISOString(),
      added: totalAdded,
      updated: totalUpdated,
    });
  }, [syncJune2025Event, syncHappyHourEvent, syncSep2025Event]);
  
  return {
    ...status,
    forceSyncAll,
  };
}
