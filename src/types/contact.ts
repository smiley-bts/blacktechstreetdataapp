// HubSpot CRM Contact Types
export interface Contact {
  // Core Identifiers
  recordId: string;
  uid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  
  // Demographics
  ageRange: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Professional Info
  companyName: string;
  jobTitle: string;
  industry: string;
  currentRole: string;
  
  // CRM Status
  lifecycleStage: string;
  leadStatus: string;
  contactOwner: string;
  createDate: string;
  lastActivityDate: string;
  lastModifiedDate: string;
  
  // AI Experience & Survey Responses
  aiExperienceLevel: string;
  aiConfidence: string;
  preWorkshopMindset: string;
  postWorkshopMindset: string;
  incomeRange: string;
  
  // Program/Cohort
  cohort1AiLevel: string;
  cohort1Industry: string;
  eventsAttended: string;
  eventsActuallyAttended: string; // Tracks who actually showed up vs just registered
  sept27thReg: string;
  
  // Marketing
  marketingContactStatus: string;
  emailDomain: string;
  recordSource: string;
  
  // Community & Engagement
  communityInvolvement: string;
  volunteerInterest: string;

  // ============ NEW FIELDS ============
  
  // LinkedIn & Social
  linkedinUrl: string;
  
  // Event Feedback - NPS & Post-Event
  npsScore: string; // "How likely are you to recommend this event to someone else?"
  afterEventOpportunities: string; // "After today, I see clear opportunities..."
  newConceptLearned: string; // "New AI Concept or Tool Learned"
  optionalQuote: string; // "Optional: Share a quote..."
  
  // Build Day Specific
  teamBuildDescription: string; // "What did your team build today?"
  aiToolsUsed: string; // "What AI tools did you use..."
  rolesOnTeam: string; // "What role(s) did you primarily take on..."
  teamImpact: string; // "What impact do you feel you had on your team..."
  ahaMoment: string; // "What was the biggest aha moment..."
  favoritePart: string; // "What was your favorite part of the Innovation Build Day?"
  oneWayToUseAI: string; // "What's one real way you plan to use AI..."
  wishCoveredMore: string; // "What's one thing you wish we had covered..."
  attendFollowUp: string; // "Would you attend a follow-up session..."
  
  // AI Confidence & Understanding
  postEventAIConfidence: string; // "On a scale of 1–5, how confident..."
  responsibleAIPreparedness: string; // "How prepared do you feel to use AI responsibly..."
  aiTaskUnderstanding: string; // "I understand which types of AI tools..."
  strongestSkillAfterToday: string; // "Which skill do you feel strongest in..."
  
  // Team Dynamics
  knewTeamBefore: string; // "Did you know any of your team members before today?"
  spaceFeltWelcoming: string; // "Do you feel this space was welcoming..."
  biasResponsibility: string; // "If an AI tool gives biased or harmful results..."
  teamCommunityDesign: string; // "How did your team ensure your AI idea was designed to serve..."
  
  // Release Form
  releaseSigned: boolean;
  releaseDate: string;
  releaseSignatureUrl: string;
  imageReleaseAgreed: boolean;
  confidentialityAgreed: boolean;
  
  // Raw data for additional fields
  rawData: Record<string, string>;
}

export interface ContactFilter {
  search: string;
  lifecycleStage: string[];
  aiExperienceLevel: string[];
  ageRange: string[];
  incomeRange: string[];
  cohort: string[];
  tags: string[];
  eventAttendeesOnly: boolean;
  buildDayOnly: boolean;
  // Event-specific filters
  dec6Workshop: boolean;
  dec13LTF: boolean;
  sept27BuildDay: boolean;
  june2025Event: boolean; // June 27-28, 2025 ASPIRE event
  happyHourAug2025: boolean; // August 27, 2025 Happy Hour
  hasFeedback: boolean;
  hasProject: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: ContactFilter;
  createdAt: string;
}

// Field mappings from CSV headers to our interface
export const csvFieldMappings: Record<string, keyof Contact | 'rawData'> = {
  "Record ID": "recordId",
  "UID": "uid",
  "First Name": "firstName",
  "Last Name": "lastName",
  "Full Name": "fullName",
  "Email": "email",
  "Phone Number": "phone",
  "Age Range": "ageRange",
  "City": "city",
  "State/Region": "state",
  "Postal Code": "postalCode",
  "Country/Region": "country",
  "Company Name": "companyName",
  "Job Title": "jobTitle",
  "Industry": "industry",
  "What Best Describes Your Current Role?": "currentRole",
  "Lifecycle Stage": "lifecycleStage",
  "Lead Status": "leadStatus",
  "Contact owner": "contactOwner",
  "Create Date": "createDate",
  "Last Activity Date": "lastActivityDate",
  "Last Modified Date": "lastModifiedDate",
  "Sept 27th AI Experience Level": "aiExperienceLevel",
  "AI Fluency Confidence (1–5)": "aiConfidence",
  "Pre-Workshop Mindset About AI": "preWorkshopMindset",
  "Post-Workshop Mindset About AI": "postWorkshopMindset",
  "Sept 27th Income Question": "incomeRange",
  "COHORT 1 AI Level": "cohort1AiLevel",
  "COHORT 1 Current Industry": "cohort1Industry",
  "Events Attended": "eventsAttended",
  "Sept 27th Reg": "sept27thReg",
  "Marketing contact status": "marketingContactStatus",
  "Email Domain": "emailDomain",
  "Record source": "recordSource",
  "In what ways, big or small, do you currently feel connected to or supportive of your community? This could include involvement with projects, nonprofits, small businesses, causes, or even personal actions or intentions.": "communityInvolvement",
  "Volunteer at Future Events": "volunteerInterest",
  
  // NEW FIELD MAPPINGS
  "LinkedIn URL": "linkedinUrl",
  "How likely are you to recommend this event to someone else?": "npsScore",
  "After today, I see clear opportunities to continue using AI tools in my work, life, or creative projects.": "afterEventOpportunities",
  "New AI Concept or Tool Learned": "newConceptLearned",
  "Optional: Share a quote about what this experience meant to you.": "optionalQuote",
  "What did your team build today? (Share a description and links to examples.)": "teamBuildDescription",
  "What AI tools did you use to bring your idea to life? \n(Check all that apply.)": "aiToolsUsed",
  "What role(s) did you primarily take on during your team's project? (Check all that apply)": "rolesOnTeam",
  "What impact do you feel you had on your team through this role (or roles)?": "teamImpact",
  'What was the biggest "aha moment" or discovery you had during today\'s session?': "ahaMoment",
  "What was your favorite part of the Innovation Build Day?": "favoritePart",
  "What's one real way you plan to use AI in your life, work, or community starting this month?": "oneWayToUseAI",
  "What's one thing you wish we had covered more or differently?": "wishCoveredMore",
  "Would you attend a follow-up session to continue working with your team to develop your prototype into a real product or startup?": "attendFollowUp",
  "On a scale of 1–5, how confident do you feel applying AI tools in your work, life, and community after today?": "postEventAIConfidence",
  "How prepared do you feel to use AI responsibly (with care, critical thinking, and community impact in mind)?": "responsibleAIPreparedness",
  "I understand which types of AI tools are best suited for different tasks.": "aiTaskUnderstanding",
  "Which skill do you feel strongest in after today?": "strongestSkillAfterToday",
  "Did you know any of your team members before today?": "knewTeamBefore",
  "Do you feel this space was welcoming to all skill levels? Why or why not?": "spaceFeltWelcoming",
  "If an AI tool gives biased or harmful results, who is responsible, and how should that be addressed?": "biasResponsibility",
  "How did your team ensure your AI idea was designed to serve the needs of the broader community and avoid unintended harm?": "teamCommunityDesign",
};

export function parseContact(row: Record<string, string>): Contact {
  const contact: Partial<Contact> = {
    rawData: { ...row }
  };
  
  // Map known fields
  for (const [csvField, contactField] of Object.entries(csvFieldMappings)) {
    if (contactField !== 'rawData' && row[csvField] !== undefined) {
      (contact as any)[contactField] = row[csvField] || '';
    }
  }
  
  // Ensure required fields have defaults
  return {
    recordId: contact.recordId || '',
    uid: contact.uid || '',
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    fullName: contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
    email: contact.email || '',
    phone: contact.phone || '',
    ageRange: contact.ageRange || '',
    city: contact.city || '',
    state: contact.state || '',
    postalCode: contact.postalCode || '',
    country: contact.country || '',
    companyName: contact.companyName || '',
    jobTitle: contact.jobTitle || '',
    industry: contact.industry || '',
    currentRole: contact.currentRole || '',
    lifecycleStage: contact.lifecycleStage || '',
    leadStatus: contact.leadStatus || '',
    contactOwner: contact.contactOwner || '',
    createDate: contact.createDate || '',
    lastActivityDate: contact.lastActivityDate || '',
    lastModifiedDate: contact.lastModifiedDate || '',
    aiExperienceLevel: contact.aiExperienceLevel || '',
    aiConfidence: contact.aiConfidence || '',
    preWorkshopMindset: contact.preWorkshopMindset || '',
    postWorkshopMindset: contact.postWorkshopMindset || '',
    incomeRange: contact.incomeRange || '',
    cohort1AiLevel: contact.cohort1AiLevel || '',
    cohort1Industry: contact.cohort1Industry || '',
    eventsAttended: contact.eventsAttended || '',
    eventsActuallyAttended: contact.eventsActuallyAttended || '',
    sept27thReg: contact.sept27thReg || '',
    marketingContactStatus: contact.marketingContactStatus || '',
    emailDomain: contact.emailDomain || '',
    recordSource: contact.recordSource || '',
    communityInvolvement: contact.communityInvolvement || '',
    volunteerInterest: contact.volunteerInterest || '',
    // New fields
    linkedinUrl: contact.linkedinUrl || '',
    npsScore: contact.npsScore || '',
    afterEventOpportunities: contact.afterEventOpportunities || '',
    newConceptLearned: contact.newConceptLearned || '',
    optionalQuote: contact.optionalQuote || '',
    teamBuildDescription: contact.teamBuildDescription || '',
    aiToolsUsed: contact.aiToolsUsed || '',
    rolesOnTeam: contact.rolesOnTeam || '',
    teamImpact: contact.teamImpact || '',
    ahaMoment: contact.ahaMoment || '',
    favoritePart: contact.favoritePart || '',
    oneWayToUseAI: contact.oneWayToUseAI || '',
    wishCoveredMore: contact.wishCoveredMore || '',
    attendFollowUp: contact.attendFollowUp || '',
    postEventAIConfidence: contact.postEventAIConfidence || '',
    responsibleAIPreparedness: contact.responsibleAIPreparedness || '',
    aiTaskUnderstanding: contact.aiTaskUnderstanding || '',
    strongestSkillAfterToday: contact.strongestSkillAfterToday || '',
    knewTeamBefore: contact.knewTeamBefore || '',
    spaceFeltWelcoming: contact.spaceFeltWelcoming || '',
    biasResponsibility: contact.biasResponsibility || '',
    teamCommunityDesign: contact.teamCommunityDesign || '',
    // Release form fields
    releaseSigned: contact.releaseSigned || false,
    releaseDate: contact.releaseDate || '',
    releaseSignatureUrl: contact.releaseSignatureUrl || '',
    imageReleaseAgreed: contact.imageReleaseAgreed || false,
    confidentialityAgreed: contact.confidentialityAgreed || false,
    rawData: contact.rawData || {},
  };
}

// Helper to check if contact has event feedback
export function hasEventFeedback(contact: Contact): boolean {
  return !!(
    contact.npsScore ||
    contact.ahaMoment ||
    contact.favoritePart ||
    contact.newConceptLearned ||
    contact.optionalQuote
  );
}

// Helper to check if contact participated in Build Day
export function hasBuildDayData(contact: Contact): boolean {
  return !!(
    contact.teamBuildDescription ||
    contact.aiToolsUsed ||
    contact.rolesOnTeam ||
    contact.teamImpact
  );
}

// Helper to check if contact is an event attendee
export function isEventAttendee(contact: Contact): boolean {
  return !!(
    contact.eventsAttended ||
    contact.sept27thReg ||
    hasEventFeedback(contact) ||
    hasBuildDayData(contact)
  );
}

// Helper to check Dec 6 Workshop attendance (via feedback survey data)
export function isDec6Workshop(contact: Contact): boolean {
  // Dec 6 attendees would have post-workshop mindset, NPS, or the specific feedback fields
  return !!(
    contact.postWorkshopMindset ||
    (contact.npsScore && contact.strongestSkillAfterToday) ||
    contact.spaceFeltWelcoming
  );
}

// Helper to check Dec 13 LTF (Lead The Future - youth program)
export function isDec13LTF(contact: Contact): boolean {
  // LTF data would come from the ltf-feedback CSV which has grade level data
  // We can detect LTF participants by checking for specific patterns
  return !!(
    contact.rawData?.["Which grade are you currently in? (Optional)"] ||
    contact.rawData?.["The workshop was engaging and held my attention."]
  );
}

// Helper to check Sept 27 Build Day participation  
export function isSept27BuildDay(contact: Contact): boolean {
  return !!(
    contact.sept27thReg ||
    contact.teamBuildDescription ||
    (contact.eventsAttended && contact.eventsAttended.includes("Sept"))
  );
}

// Helper to check June 27-28, 2025 event participation
export function isJune2025Event(contact: Contact): boolean {
  return !!(
    (contact.eventsAttended && (contact.eventsAttended.includes("June") || contact.eventsAttended.includes("Jun"))) ||
    contact.rawData?.["june2025_attended"]
  );
}

// Check if contact attended Happy Hour Aug 2025
export function isHappyHourAug2025(contact: Contact): boolean {
  return !!(
    contact.eventsAttended && contact.eventsAttended.includes("Happy Hour Aug 2025")
  );
}

// Check if contact registered for ASPIRE Sep 27 2025
export function isSep2025Event(contact: Contact): boolean {
  return !!(
    contact.sept27thReg === 'Yes' ||
    (contact.eventsAttended && contact.eventsAttended.includes("ASPIRE Sep 27 2025"))
  );
}

// Blocklist of corporate/non-name terms
const NON_NAME_TERMS = new Set([
  'info', 'admin', 'contact', 'support', 'hello', 'team', 'sales', 'hr',
  'marketing', 'office', 'general', 'service', 'help', 'billing', 'accounts',
  'executive director', 'director', 'manager', 'president', 'ceo', 'cfo', 'cto',
  'founder', 'owner', 'partner', 'associate', 'coordinator', 'specialist',
  'analyst', 'consultant', 'advisor', 'assistant', 'administrator', 'supervisor',
  'lead', 'head', 'chief', 'principal', 'senior', 'junior', 'intern',
  'representative', 'agent', 'officer', 'secretary', 'treasurer', 'chair',
  'board', 'committee', 'department', 'division', 'unit', 'group', 'section',
  'unknown', 'n/a', 'na', 'none', 'test', 'demo', 'sample', 'example',
]);

// Check if a name looks like a real name (not a corporate term)
function isValidName(name: string): boolean {
  if (!name || name.length < 2) return false;
  const normalized = name.toLowerCase().trim();
  
  // Check against blocklist
  if (NON_NAME_TERMS.has(normalized)) return false;
  
  // Check if any blocklist term is contained in the name
  for (const term of NON_NAME_TERMS) {
    if (normalized === term || (term.length > 4 && normalized.includes(term))) {
      return false;
    }
  }
  
  // Names with only one word that are all caps or all lowercase are suspicious
  const words = normalized.split(' ').filter(Boolean);
  if (words.length === 1 && (name === name.toUpperCase() || name === name.toLowerCase())) {
    // Single word, check if it looks corporate
    if (normalized.length < 3) return false;
  }
  
  return true;
}

// Check if a contact has a valid display name (not falling back to UID or ID)
export function hasValidDisplayName(contact: Contact): boolean {
  const fullName = contact.fullName?.trim();
  if (fullName && isValidName(fullName)) return true;
  
  const combined = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  if (combined && isValidName(combined)) return true;
  
  if (contact.firstName && isValidName(contact.firstName)) return true;
  
  return false;
}

// Smart display name with validation and UID fallback
export function getDisplayName(contact: Contact): string {
  // Try full name first
  const fullName = contact.fullName?.trim();
  if (fullName && isValidName(fullName)) return fullName;
  
  // Try first + last name
  const combined = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  if (combined && isValidName(combined)) return combined;
  
  // Try just first name if it's valid
  if (contact.firstName && isValidName(contact.firstName)) {
    return contact.firstName.trim();
  }
  
  // Fallback to UID if available
  if (contact.uid?.trim()) return contact.uid.trim();
  
  // Last resort: use record ID
  return `ID: ${contact.recordId?.slice(-6) || '???'}`;
}

// Get initials from display name
export function getContactInitials(contact: Contact): string {
  const name = getDisplayName(contact);
  const words = name.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
