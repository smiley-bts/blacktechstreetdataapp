import { Contact } from "@/types/contact";
import { June2025Signup } from "@/hooks/useJune2025Event";

export interface EventParticipant {
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  ageRange?: string;
  currentRole?: string;
  aiConfidence?: string;
  aiExperienceLevel?: string;
  zipCode?: string;
  incomeRange?: string;
}

export interface SyncResult {
  added: number;
  updated: number;
  skipped: number;
}

// Convert June 2025 signup to contact format
export function june2025SignupToContact(signup: June2025Signup, attended: boolean): Partial<Contact> {
  return {
    email: signup.email?.toLowerCase().trim(),
    firstName: signup.firstName || signup.fullName?.split(' ')[0] || '',
    lastName: signup.lastName || signup.fullName?.split(' ').slice(1).join(' ') || '',
    fullName: signup.fullName || `${signup.firstName} ${signup.lastName}`.trim(),
    phone: signup.phone,
    ageRange: signup.ageRange,
    currentRole: signup.currentRole,
    aiConfidence: signup.aiConfidence?.toString(),
    aiExperienceLevel: signup.aiFamiliarity,
    postalCode: signup.zipCode,
    incomeRange: signup.householdIncome,
    eventsAttended: attended ? 'ASPIRE June 2025' : '',
    recordSource: 'ASPIRE Signup',
  };
}

// Generate a unique record ID for new contacts
export function generateContactId(): string {
  return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Merge event data into existing contact (only update empty fields)
export function mergeContactData(existing: Contact, newData: Partial<Contact>): Contact {
  const merged = { ...existing };
  
  // Update events attended (append if not already listed)
  if (newData.eventsAttended) {
    const existingEvents = existing.eventsAttended?.split(',').map(e => e.trim()).filter(Boolean) || [];
    const newEvents = newData.eventsAttended.split(',').map(e => e.trim()).filter(Boolean);
    
    newEvents.forEach(event => {
      if (!existingEvents.includes(event)) {
        existingEvents.push(event);
      }
    });
    
    merged.eventsAttended = existingEvents.join(', ');
  }
  
  // Only fill in empty fields (don't overwrite existing data)
  const fillableFields: (keyof Contact)[] = [
    'firstName', 'lastName', 'fullName', 'phone', 'ageRange',
    'currentRole', 'aiConfidence', 'aiExperienceLevel', 'postalCode',
    'incomeRange', 'recordSource', 'city', 'state'
  ];
  
  fillableFields.forEach(field => {
    if (!merged[field] && newData[field]) {
      (merged as any)[field] = newData[field];
    }
  });
  
  return merged;
}

// Prepare contacts for database upsert
export function prepareContactsForSync(
  participants: Partial<Contact>[],
  existingContacts: Contact[]
): { toInsert: Contact[]; toUpdate: Contact[] } {
  const existingByEmail = new Map<string, Contact>();
  existingContacts.forEach(c => {
    if (c.email) {
      existingByEmail.set(c.email.toLowerCase(), c);
    }
  });
  
  const toInsert: Contact[] = [];
  const toUpdate: Contact[] = [];
  const processedEmails = new Set<string>();
  
  participants.forEach(participant => {
    if (!participant.email) return;
    
    const email = participant.email.toLowerCase();
    if (processedEmails.has(email)) return;
    processedEmails.add(email);
    
    const existing = existingByEmail.get(email);
    
    if (existing) {
      // Merge with existing contact
      const merged = mergeContactData(existing, participant);
      if (JSON.stringify(merged) !== JSON.stringify(existing)) {
        toUpdate.push(merged);
      }
    } else {
      // Create new contact
      const newContact: Contact = {
        recordId: generateContactId(),
        uid: '',
        firstName: participant.firstName || '',
        lastName: participant.lastName || '',
        fullName: participant.fullName || '',
        email: participant.email || '',
        phone: participant.phone || '',
        ageRange: participant.ageRange || '',
        city: '',
        state: '',
        postalCode: participant.postalCode || '',
        country: '',
        companyName: '',
        jobTitle: '',
        industry: '',
        currentRole: participant.currentRole || '',
        lifecycleStage: 'subscriber',
        leadStatus: '',
        contactOwner: '',
        createDate: new Date().toISOString(),
        lastActivityDate: '',
        lastModifiedDate: new Date().toISOString(),
        aiExperienceLevel: participant.aiExperienceLevel || '',
        aiConfidence: participant.aiConfidence || '',
        preWorkshopMindset: '',
        postWorkshopMindset: '',
        incomeRange: participant.incomeRange || '',
        cohort1AiLevel: '',
        cohort1Industry: '',
        eventsAttended: participant.eventsAttended || '',
        sept27thReg: '',
        marketingContactStatus: '',
        emailDomain: participant.email?.split('@')[1] || '',
        recordSource: participant.recordSource || 'ASPIRE Signup',
        communityInvolvement: '',
        volunteerInterest: '',
        linkedinUrl: '',
        npsScore: '',
        afterEventOpportunities: '',
        newConceptLearned: '',
        optionalQuote: '',
        teamBuildDescription: '',
        aiToolsUsed: '',
        rolesOnTeam: '',
        teamImpact: '',
        ahaMoment: '',
        favoritePart: '',
        oneWayToUseAI: '',
        wishCoveredMore: '',
        attendFollowUp: '',
        postEventAIConfidence: '',
        responsibleAIPreparedness: '',
        aiTaskUnderstanding: '',
        strongestSkillAfterToday: '',
        knewTeamBefore: '',
        spaceFeltWelcoming: '',
        biasResponsibility: '',
        teamCommunityDesign: '',
        rawData: {},
      };
      toInsert.push(newContact);
    }
  });
  
  return { toInsert, toUpdate };
}

// Get sync key from localStorage
export function getSyncKey(eventName: string): string {
  return `contact-sync-${eventName.toLowerCase().replace(/\s+/g, '-')}`;
}

// Check if event has been synced
export function hasEventBeenSynced(eventName: string): boolean {
  const key = getSyncKey(eventName);
  return localStorage.getItem(key) !== null;
}

// Mark event as synced
export function markEventSynced(eventName: string, count: number): void {
  const key = getSyncKey(eventName);
  localStorage.setItem(key, JSON.stringify({
    syncedAt: new Date().toISOString(),
    count,
  }));
}
