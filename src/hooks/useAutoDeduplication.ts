import { useEffect, useCallback, useRef, useState } from "react";
import { Contact, getDisplayName } from "@/types/contact";
import { mergeContacts, DuplicateGroup } from "./useDuplicateDetection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MergeOperation {
  id: string;
  timestamp: number;
  primaryContact: Contact;
  mergedContacts: Contact[];
  reason: string;
}

// Store for undo operations
const recentMerges: MergeOperation[] = [];
const UNDO_TIMEOUT_MS = 30000; // 30 seconds to undo

function normalizeEmail(email: string | undefined): string {
  return (email || "").toLowerCase().trim();
}

function normalizePhone(phone: string | undefined): string {
  return (phone || "").replace(/\D/g, "").slice(-10);
}

// Check if two contacts are "obviously" the same (high confidence match)
export function isObviousDuplicate(a: Contact, b: Contact): { isDuplicate: boolean; reason: string } {
  // Same email - very high confidence
  const emailA = normalizeEmail(a.email);
  const emailB = normalizeEmail(b.email);
  if (emailA && emailB && emailA === emailB) {
    return { isDuplicate: true, reason: "Same email address" };
  }

  // Same phone number - high confidence
  const phoneA = normalizePhone(a.phone);
  const phoneB = normalizePhone(b.phone);
  if (phoneA && phoneB && phoneA.length >= 10 && phoneA === phoneB) {
    // Additional check: at least one name match to avoid false positives
    const firstNameMatch = a.firstName?.toLowerCase() === b.firstName?.toLowerCase() && a.firstName;
    const lastNameMatch = a.lastName?.toLowerCase() === b.lastName?.toLowerCase() && a.lastName;
    
    if (firstNameMatch || lastNameMatch) {
      return { isDuplicate: true, reason: "Same phone + name match" };
    }
  }

  return { isDuplicate: false, reason: "" };
}

// Find all obvious duplicate groups
export function findObviousDuplicateGroups(contacts: Contact[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processedIds = new Set<string>();

  // Group by email first (highest confidence)
  const emailMap = new Map<string, Contact[]>();
  contacts.forEach((contact) => {
    const email = normalizeEmail(contact.email);
    if (email && email.length > 3) {
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)!.push(contact);
    }
  });

  emailMap.forEach((contactsWithEmail, email) => {
    if (contactsWithEmail.length > 1) {
      // Sort by most complete record first
      const sorted = [...contactsWithEmail].sort((a, b) => {
        const scoreA = getCompletenessScore(a);
        const scoreB = getCompletenessScore(b);
        return scoreB - scoreA;
      });
      
      const ids = sorted.map((c) => c.recordId).sort().join("-");
      if (!processedIds.has(ids)) {
        processedIds.add(ids);
        groups.push({
          id: `email-${email}`,
          reason: "Same email address",
          contacts: sorted,
          matchKey: email,
        });
      }
    }
  });

  // Group by phone + name match
  const phoneMap = new Map<string, Contact[]>();
  contacts.forEach((contact) => {
    const phone = normalizePhone(contact.phone);
    if (phone && phone.length >= 10) {
      if (!phoneMap.has(phone)) {
        phoneMap.set(phone, []);
      }
      phoneMap.get(phone)!.push(contact);
    }
  });

  phoneMap.forEach((contactsWithPhone, phone) => {
    if (contactsWithPhone.length > 1) {
      // Check if these contacts share name similarities
      const nameGroups = new Map<string, Contact[]>();
      
      contactsWithPhone.forEach(contact => {
        const firstName = (contact.firstName || "").toLowerCase().trim();
        if (firstName) {
          if (!nameGroups.has(firstName)) {
            nameGroups.set(firstName, []);
          }
          nameGroups.get(firstName)!.push(contact);
        }
      });

      nameGroups.forEach((group, firstName) => {
        if (group.length > 1) {
          const sorted = [...group].sort((a, b) => {
            const scoreA = getCompletenessScore(a);
            const scoreB = getCompletenessScore(b);
            return scoreB - scoreA;
          });
          
          const ids = sorted.map((c) => c.recordId).sort().join("-");
          if (!processedIds.has(ids)) {
            processedIds.add(ids);
            groups.push({
              id: `phone-name-${phone}-${firstName}`,
              reason: "Same phone + first name",
              contacts: sorted,
              matchKey: `${phone} (${firstName})`,
            });
          }
        }
      });
    }
  });

  return groups;
}

// Calculate completeness score for a contact
function getCompletenessScore(contact: Contact): number {
  let score = 0;
  if (contact.email) score += 3;
  if (contact.phone) score += 2;
  if (contact.firstName) score += 2;
  if (contact.lastName) score += 2;
  if (contact.fullName) score += 1;
  if (contact.city) score += 1;
  if (contact.state) score += 1;
  if (contact.jobTitle) score += 1;
  if (contact.companyName) score += 1;
  if (contact.eventsAttended) score += 2;
  if (contact.eventsActuallyAttended) score += 2;
  if (contact.npsScore) score += 1;
  if (contact.teamBuildDescription) score += 1;
  if (contact.aiExperienceLevel) score += 1;
  if (contact.incomeRange) score += 1;
  return score;
}

// Convert Contact to database row format (same as useContacts)
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
    events_actually_attended: contact.eventsActuallyAttended || null,
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

export function useAutoDeduplication(
  contacts: Contact[],
  enabled: boolean = true
) {
  const [autoMergeEnabled, setAutoMergeEnabled] = useState(() => {
    const stored = localStorage.getItem("crm-auto-merge-enabled");
    return stored !== null ? stored === "true" : true;
  });
  const [mergeInProgress, setMergeInProgress] = useState(false);
  const hasRunRef = useRef(false);
  const pendingUndoRef = useRef<string | null>(null);

  // Persist auto-merge preference
  useEffect(() => {
    localStorage.setItem("crm-auto-merge-enabled", String(autoMergeEnabled));
  }, [autoMergeEnabled]);

  // Undo a merge operation
  const undoMerge = useCallback(async (operationId: string) => {
    const operation = recentMerges.find(m => m.id === operationId);
    if (!operation) {
      toast.error("Undo expired", { description: "This merge can no longer be undone" });
      return;
    }

    try {
      // Re-insert the merged contacts
      const dbRows = operation.mergedContacts.map(c => ({
        ...contactToDbRow(c),
        id: undefined, // Let DB generate new IDs
      }));

      const { error: insertError } = await supabase
        .from('contacts')
        .insert(dbRows);

      if (insertError) {
        console.error('Error undoing merge:', insertError);
        toast.error("Failed to undo merge");
        return;
      }

      // Remove from recent merges
      const idx = recentMerges.findIndex(m => m.id === operationId);
      if (idx >= 0) {
        recentMerges.splice(idx, 1);
      }

      toast.success("Merge undone", {
        description: `${operation.mergedContacts.length} contacts restored`,
      });
    } catch (err) {
      console.error('Error undoing merge:', err);
      toast.error("Failed to undo merge");
    }
  }, []);

  // Perform auto-merge for a group
  const performAutoMerge = useCallback(async (group: DuplicateGroup) => {
    const [primary, ...secondaries] = group.contacts;
    
    // Merge all data into primary
    let merged = primary;
    secondaries.forEach((secondary) => {
      merged = mergeContacts(merged, secondary);
    });

    // Store for undo
    const operationId = `merge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const operation: MergeOperation = {
      id: operationId,
      timestamp: Date.now(),
      primaryContact: merged,
      mergedContacts: secondaries,
      reason: group.reason,
    };
    recentMerges.push(operation);

    // Clean up old operations
    const cutoff = Date.now() - UNDO_TIMEOUT_MS;
    while (recentMerges.length > 0 && recentMerges[0].timestamp < cutoff) {
      recentMerges.shift();
    }

    try {
      // Update the primary contact with merged data
      const { error: updateError } = await supabase
        .from('contacts')
        .update(contactToDbRow(merged))
        .eq('id', (primary as any).id || primary.recordId);

      if (updateError) {
        console.error('Error updating merged contact:', updateError);
        return null;
      }

      // Delete the secondary contacts
      const secondaryIds = secondaries.map((c: any) => c.id || c.recordId).filter(Boolean);
      if (secondaryIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('contacts')
          .delete()
          .in('id', secondaryIds);

        if (deleteError) {
          console.error('Error deleting merged contacts:', deleteError);
        }
      }

      return { operationId, merged, removedCount: secondaries.length, reason: group.reason };
    } catch (err) {
      console.error('Error in auto-merge:', err);
      return null;
    }
  }, []);

  // Run auto-deduplication
  const runAutoDedup = useCallback(async () => {
    if (!autoMergeEnabled || mergeInProgress || contacts.length === 0) return;

    const groups = findObviousDuplicateGroups(contacts);
    if (groups.length === 0) return;

    setMergeInProgress(true);
    
    let totalMerged = 0;
    let lastOperationId: string | null = null;

    for (const group of groups) {
      const result = await performAutoMerge(group);
      if (result) {
        totalMerged += result.removedCount;
        lastOperationId = result.operationId;
      }
    }

    setMergeInProgress(false);

    if (totalMerged > 0 && lastOperationId) {
      pendingUndoRef.current = lastOperationId;
      
      toast.success(`Auto-merged ${totalMerged} duplicate contacts`, {
        description: `${groups.length} duplicate groups resolved`,
        duration: UNDO_TIMEOUT_MS,
        action: {
          label: "Undo",
          onClick: () => {
            if (pendingUndoRef.current) {
              undoMerge(pendingUndoRef.current);
              pendingUndoRef.current = null;
            }
          },
        },
      });
    }
  }, [autoMergeEnabled, mergeInProgress, contacts, performAutoMerge, undoMerge]);

  // Auto-run on initial load (once)
  useEffect(() => {
    if (enabled && !hasRunRef.current && contacts.length > 0) {
      hasRunRef.current = true;
      // Delay to allow UI to settle
      const timer = setTimeout(() => {
        runAutoDedup();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [enabled, contacts.length, runAutoDedup]);

  return {
    autoMergeEnabled,
    setAutoMergeEnabled,
    mergeInProgress,
    runAutoDedup,
    undoMerge,
    findObviousDuplicateGroups,
  };
}
