// Project types for Build Day submissions

export interface Project {
  id: string;
  submissionId: string;
  submittedAt: string;
  teamRepName: string;
  teamRepEmail: string;
  teamMembers: string[];
  projectName: string;
  description: string;
  fileUrls: string[];
  projectLinks: string[];
  eventDate: string;
  eventName: string;
}

export function parseProject(row: string[]): Project {
  const submittedAt = row[2];
  const eventDate = submittedAt?.split(" ")[0] || "";
  
  // Determine event name based on date
  let eventName = "Build Day";
  if (eventDate.startsWith("2025-06-27") || eventDate.startsWith("2025-06-28")) {
    eventName = "June 27-28, 2025 ASPIRE Build Day";
  } else if (eventDate.startsWith("2025-09-27")) {
    eventName = "September 27, 2025 ASPIRE Build Day";
  } else if (eventDate.startsWith("2025-12-06")) {
    eventName = "December 6, 2025 ASPIRE Workshop";
  }

  // Parse team members (they're newline separated in the CSV)
  const teamMembersRaw = row[5] || "";
  const teamMembers = teamMembersRaw
    .split(/[\n,]/)
    .map(m => m.trim())
    .filter(m => m.length > 0);

  // Parse file URLs
  const fileUrls = (row[8] || "")
    .split(/[\n,]/)
    .map(u => u.trim())
    .filter(u => u.length > 0);

  // Parse project links
  const projectLinks = (row[9] || "")
    .split(/[\n]/)
    .map(u => u.trim())
    .filter(u => u.length > 0 && (u.startsWith("http") || u.startsWith("Https")));

  return {
    id: row[0],
    submissionId: row[0],
    submittedAt,
    teamRepName: row[3],
    teamRepEmail: row[4],
    teamMembers,
    projectName: row[6],
    description: row[7],
    fileUrls,
    projectLinks,
    eventDate,
    eventName,
  };
}

export function extractUniqueEvents(projects: Project[]): string[] {
  return [...new Set(projects.map(p => p.eventName))].sort();
}
