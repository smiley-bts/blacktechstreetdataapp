import { useMemo } from "react";
import { Contact, hasEventFeedback, hasBuildDayData, isDec6Workshop, isDec13LTF, isSept27BuildDay, isJune2025Event, isHappyHourAug2025, isSep2025Event, isMarch2025Event, isMay2025Event } from "@/types/contact";
import { getCompletenessScore } from "@/lib/contactCompleteness";

export interface ContactMetrics {
  // Core counts
  total: number;
  withEmail: number;
  
  // Event metrics - registered vs actually attended
  eventRegistered: number;
  eventActuallyAttended: number;
  
  // Event-specific counts
  dec6Workshop: number;
  dec13LTF: number;
  sept27BuildDay: number;
  june2025Event: number;
  happyHourAug2025: number;
  sep2025Event: number;
  march2025Event: number;
  may2025Event: number;
  
  // Unique attendee calculations
  uniqueEventAttendees: number;
  multiEventAttendees: number;
  
  // Engagement metrics
  withFeedback: number;
  buildDayParticipants: number;
  volunteersInterested: number;
  
  // AI experience levels
  aiLevels: Record<string, number>;
  emerging: number;
  intermediate: number;
  
  // NPS metrics
  npsScore: number | null;
  npsResponses: number;
  promoters: number;
  detractors: number;
  passives: number;
  
  // Data quality
  complete: number;
  incomplete: number;
  avgCompleteness: number;
  
  // Lifecycle stages
  lifecycleStages: Record<string, number>;
  leads: number;
}

export function useContactMetrics(contacts: Contact[]): ContactMetrics {
  return useMemo(() => {
    const total = contacts.length;
    const withEmail = contacts.filter(c => c.email).length;
    
    // Event metrics - registered (eventsAttended field) vs actually attended (eventsActuallyAttended field)
    const eventRegistered = contacts.filter(c => c.eventsAttended || c.sept27thReg).length;
    const eventActuallyAttended = contacts.filter(c => c.eventsActuallyAttended).length;
    
    // Event-specific counts
    const dec6Workshop = contacts.filter(isDec6Workshop).length;
    const dec13LTF = contacts.filter(isDec13LTF).length;
    const sept27BuildDay = contacts.filter(isSept27BuildDay).length;
    const june2025Event = contacts.filter(isJune2025Event).length;
    const happyHourAug2025 = contacts.filter(isHappyHourAug2025).length;
    const sep2025Event = contacts.filter(isSep2025Event).length;
    const march2025Event = contacts.filter(isMarch2025Event).length;
    const may2025Event = contacts.filter(isMay2025Event).length;
    
    // Calculate unique attendees across all events
    const attendeeEmails = new Set<string>();
    const eventCheckFns = [isDec6Workshop, isDec13LTF, isSept27BuildDay, isJune2025Event, isHappyHourAug2025, isSep2025Event, isMarch2025Event, isMay2025Event];
    
    eventCheckFns.forEach(checkFn => {
      contacts.filter(checkFn).forEach(c => {
        if (c.email) attendeeEmails.add(c.email.toLowerCase());
      });
    });
    const uniqueEventAttendees = attendeeEmails.size;
    
    // Multi-event attendees
    const attendeeCounts = new Map<string, number>();
    eventCheckFns.forEach(checkFn => {
      contacts.filter(checkFn).forEach(c => {
        if (c.email) {
          const email = c.email.toLowerCase();
          attendeeCounts.set(email, (attendeeCounts.get(email) || 0) + 1);
        }
      });
    });
    const multiEventAttendees = Array.from(attendeeCounts.values()).filter(count => count > 1).length;
    
    // Engagement metrics
    const withFeedback = contacts.filter(hasEventFeedback).length;
    const buildDayParticipants = contacts.filter(hasBuildDayData).length;
    const volunteersInterested = contacts.filter(c => c.volunteerInterest?.toLowerCase() === "yes").length;
    
    // AI experience levels
    const aiLevels: Record<string, number> = {};
    contacts.forEach(c => {
      if (c.aiExperienceLevel) {
        const level = c.aiExperienceLevel.split(":")[0].trim();
        aiLevels[level] = (aiLevels[level] || 0) + 1;
      }
    });
    const emerging = contacts.filter(c => c.aiExperienceLevel?.toLowerCase().includes("emerging")).length;
    const intermediate = contacts.filter(c => 
      c.aiExperienceLevel?.toLowerCase().includes("intermediate") ||
      c.aiExperienceLevel?.toLowerCase().includes("advanced")
    ).length;
    
    // NPS calculation (1-5 scale: 4-5 = promoter, 3 = passive, 1-2 = detractor)
    const npsResponses = contacts.filter(c => c.npsScore);
    const promoters = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
    const detractors = npsResponses.filter(c => parseInt(c.npsScore) <= 2).length;
    const passives = npsResponses.length - promoters - detractors;
    const npsScore = npsResponses.length > 0 
      ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
      : null;
    
    // Data quality
    const complete = contacts.filter(c => getCompletenessScore(c) >= 80).length;
    const incomplete = contacts.filter(c => getCompletenessScore(c) < 50).length;
    const avgCompleteness = total > 0 
      ? Math.round(contacts.reduce((sum, c) => sum + getCompletenessScore(c), 0) / total) 
      : 0;
    
    // Lifecycle stages
    const lifecycleStages: Record<string, number> = {};
    contacts.forEach(c => {
      if (c.lifecycleStage) {
        lifecycleStages[c.lifecycleStage] = (lifecycleStages[c.lifecycleStage] || 0) + 1;
      }
    });
    const leads = contacts.filter(c => c.lifecycleStage?.toLowerCase() === "lead").length;
    
    return {
      total,
      withEmail,
      eventRegistered,
      eventActuallyAttended,
      dec6Workshop,
      dec13LTF,
      sept27BuildDay,
      june2025Event,
      happyHourAug2025,
      sep2025Event,
      march2025Event,
      may2025Event,
      uniqueEventAttendees,
      multiEventAttendees,
      withFeedback,
      buildDayParticipants,
      volunteersInterested,
      aiLevels,
      emerging,
      intermediate,
      npsScore,
      npsResponses: npsResponses.length,
      promoters,
      detractors,
      passives,
      complete,
      incomplete,
      avgCompleteness,
      lifecycleStages,
      leads,
    };
  }, [contacts]);
}
