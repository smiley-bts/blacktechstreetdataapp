/**
 * FEEDBACK DATA SYNCHRONIZATION
 * =============================
 * 
 * This module ensures feedback data from various CSV sources is properly
 * synced to contact records in the database for consistent display across
 * all CRM views (ContactCard, ContactDetailModal, EventBreakdown, etc.)
 * 
 * DATA FLOW:
 * CSV Feedback Files → Parse → Match by Email → Update Contact Record
 * 
 * MATCHING RULE: All feedback is matched to contacts by EMAIL only
 * to maintain CRM data integrity (see contactSync.ts for matching rules)
 */

import { supabase } from "@/integrations/supabase/client";

export interface FeedbackSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

/**
 * Normalize email for consistent matching
 */
function normalizeEmail(email: string | undefined): string | null {
  if (!email) return null;
  return email.toLowerCase().trim();
}

/**
 * Sync workshop feedback to contacts
 */
export async function syncWorkshopFeedbackToContacts(
  feedbackRecords: Array<{
    email?: string;
    npsScore?: number;
    favoritePart?: string;
    newConceptLearned?: string;
    ahaMoment?: string;
    confidenceAfter?: number;
    strongestSkill?: string;
    wishCoveredMore?: string;
    optionalQuote?: string;
  }>
): Promise<FeedbackSyncResult> {
  const result: FeedbackSyncResult = { synced: 0, skipped: 0, errors: [] };
  
  for (const feedback of feedbackRecords) {
    const email = normalizeEmail(feedback.email);
    if (!email) {
      result.skipped++;
      continue;
    }
    
    try {
      const updateData: Record<string, any> = {};
      
      if (feedback.npsScore !== undefined) updateData.nps_score = feedback.npsScore.toString();
      if (feedback.favoritePart) updateData.favorite_part = feedback.favoritePart;
      if (feedback.newConceptLearned) updateData.new_concept_learned = feedback.newConceptLearned;
      if (feedback.ahaMoment) updateData.aha_moment = feedback.ahaMoment;
      if (feedback.confidenceAfter !== undefined) updateData.post_event_ai_confidence = feedback.confidenceAfter.toString();
      if (feedback.strongestSkill) updateData.strongest_skill_after_today = feedback.strongestSkill;
      if (feedback.wishCoveredMore) updateData.wish_covered_more = feedback.wishCoveredMore;
      if (feedback.optionalQuote) updateData.optional_quote = feedback.optionalQuote;
      
      if (Object.keys(updateData).length === 0) {
        result.skipped++;
        continue;
      }
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .ilike('email', email);
      
      if (error) {
        result.errors.push(`${email}: ${error.message}`);
      } else {
        result.synced++;
      }
    } catch (err) {
      result.errors.push(`${email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  return result;
}

/**
 * Sync build day feedback to contacts
 */
export async function syncBuildDayFeedbackToContacts(
  feedbackRecords: Array<{
    email?: string;
    teamBuildDescription?: string;
    aiToolsUsed?: string;
    rolesOnTeam?: string;
    teamImpact?: string;
    attendFollowUp?: string;
    knewTeamBefore?: string;
    spaceFeltWelcoming?: string;
  }>
): Promise<FeedbackSyncResult> {
  const result: FeedbackSyncResult = { synced: 0, skipped: 0, errors: [] };
  
  for (const feedback of feedbackRecords) {
    const email = normalizeEmail(feedback.email);
    if (!email) {
      result.skipped++;
      continue;
    }
    
    try {
      const updateData: Record<string, any> = {};
      
      if (feedback.teamBuildDescription) updateData.team_build_description = feedback.teamBuildDescription;
      if (feedback.aiToolsUsed) updateData.ai_tools_used = feedback.aiToolsUsed;
      if (feedback.rolesOnTeam) updateData.roles_on_team = feedback.rolesOnTeam;
      if (feedback.teamImpact) updateData.team_impact = feedback.teamImpact;
      if (feedback.attendFollowUp) updateData.attend_follow_up = feedback.attendFollowUp;
      if (feedback.knewTeamBefore) updateData.knew_team_before = feedback.knewTeamBefore;
      if (feedback.spaceFeltWelcoming) updateData.space_felt_welcoming = feedback.spaceFeltWelcoming;
      
      if (Object.keys(updateData).length === 0) {
        result.skipped++;
        continue;
      }
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .ilike('email', email);
      
      if (error) {
        result.errors.push(`${email}: ${error.message}`);
      } else {
        result.synced++;
      }
    } catch (err) {
      result.errors.push(`${email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  return result;
}

/**
 * Sync pre-survey data to contacts
 */
export async function syncPreSurveyToContacts(
  surveyRecords: Array<{
    email?: string;
    aiConfidence?: number;
    aiExperienceLevel?: string;
    preWorkshopMindset?: string;
    responsibleAIPreparedness?: string;
    biasResponsibility?: string;
  }>
): Promise<FeedbackSyncResult> {
  const result: FeedbackSyncResult = { synced: 0, skipped: 0, errors: [] };
  
  for (const survey of surveyRecords) {
    const email = normalizeEmail(survey.email);
    if (!email) {
      result.skipped++;
      continue;
    }
    
    try {
      const updateData: Record<string, any> = {};
      
      if (survey.aiConfidence !== undefined) updateData.ai_confidence = survey.aiConfidence.toString();
      if (survey.aiExperienceLevel) updateData.ai_experience_level = survey.aiExperienceLevel;
      if (survey.preWorkshopMindset) updateData.pre_workshop_mindset = survey.preWorkshopMindset;
      if (survey.responsibleAIPreparedness) updateData.responsible_ai_preparedness = survey.responsibleAIPreparedness;
      if (survey.biasResponsibility) updateData.bias_responsibility = survey.biasResponsibility;
      
      if (Object.keys(updateData).length === 0) {
        result.skipped++;
        continue;
      }
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .ilike('email', email);
      
      if (error) {
        result.errors.push(`${email}: ${error.message}`);
      } else {
        result.synced++;
      }
    } catch (err) {
      result.errors.push(`${email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  return result;
}

/**
 * Check if a contact's feedback data matches database record
 * Used for debugging data consistency issues
 */
export function validateFeedbackConsistency(
  contactFromDB: any,
  feedbackFromCSV: {
    npsScore?: number;
    ahaMoment?: string;
    favoritePart?: string;
  }
): { isConsistent: boolean; mismatches: string[] } {
  const mismatches: string[] = [];
  
  if (feedbackFromCSV.npsScore !== undefined && 
      contactFromDB.nps_score !== feedbackFromCSV.npsScore.toString()) {
    mismatches.push(`NPS: DB=${contactFromDB.nps_score} CSV=${feedbackFromCSV.npsScore}`);
  }
  
  if (feedbackFromCSV.ahaMoment && 
      contactFromDB.aha_moment !== feedbackFromCSV.ahaMoment) {
    mismatches.push(`Aha Moment differs`);
  }
  
  if (feedbackFromCSV.favoritePart && 
      contactFromDB.favorite_part !== feedbackFromCSV.favoritePart) {
    mismatches.push(`Favorite Part differs`);
  }
  
  return {
    isConsistent: mismatches.length === 0,
    mismatches
  };
}
