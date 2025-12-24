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
  sept27thReg: string;
  
  // Marketing
  marketingContactStatus: string;
  emailDomain: string;
  recordSource: string;
  
  // Community & Engagement
  communityInvolvement: string;
  volunteerInterest: string;
  
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
    sept27thReg: contact.sept27thReg || '',
    marketingContactStatus: contact.marketingContactStatus || '',
    emailDomain: contact.emailDomain || '',
    recordSource: contact.recordSource || '',
    communityInvolvement: contact.communityInvolvement || '',
    volunteerInterest: contact.volunteerInterest || '',
    rawData: contact.rawData || {},
  };
}
