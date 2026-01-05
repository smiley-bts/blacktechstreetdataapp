// Mapping of project names to local file paths
// These files are hosted in public/project-files/

export interface LocalProjectFile {
  path: string;
  type: 'pdf' | 'pptx' | 'docx' | 'image';
  label: string;
}

// Map project names (normalized) to their local files
const projectFileMap: Record<string, LocalProjectFile[]> = {
  "thrive access network": [
    // No local file uploaded yet
  ],
  "echos of truth": [
    { path: "/project-files/Echos_of_Truth_Links.docx", type: "docx", label: "Echos of Truth Links" }
  ],
  "rising heart ranch": [
    { path: "/project-files/Rising_Heart_Ranch.jpg", type: "image", label: "Rising Heart Ranch Website" }
  ],
  "project revitalize": [
    { path: "/project-files/Project_ReVitalize.jpeg", type: "image", label: "Project ReVitalize Infographic" }
  ],
  "rise-up learning hub": [
    { path: "/project-files/Rise_Up_Learning_Hub.pptx", type: "pptx", label: "Rise-up Learning Hub Presentation" }
  ],
  "life flow": [
    // No local file uploaded yet
  ],
  "youth homeless mission": [
    { path: "/project-files/Youth_Homeless_Mission.png", type: "image", label: "Youth Homeless Mission Flyer" }
  ],
  "insight academy": [
    { path: "/project-files/Insight_Academy.png", type: "image", label: "Insight Academy Screenshot" }
  ],
  "rg foods, inc. healthy food programs": [
    { path: "/project-files/Healthy_Futures_Program.pdf", type: "pdf", label: "Healthy Futures Program" }
  ],
  "purposemint": [
    // No local file uploaded yet
  ],
  "frontdesk ai": [
    // No local file uploaded yet
  ],
  "pupbles": [
    // Pupbles file had upload issue
  ],
  "level up collective": [
    { path: "/project-files/Level_Up_Collective.pdf", type: "pdf", label: "Level Up Collective" }
  ],
  "future ready labs": [
    // No local file uploaded yet
  ],
  "her life coach, llc - life coaching for women": [
    { path: "/project-files/Her_Life_Coach_Flyer_Final-2.pdf", type: "pdf", label: "Her Life Coach Flyer" }
  ],
  "labor market observatory": [
    { path: "/project-files/Labor_Market_Observatory.pdf", type: "pdf", label: "Labor Market Observatory" }
  ],
  "mise en cost": [
    { path: "/project-files/Mise_en_Cost_Pitch_Deck.pptx", type: "pptx", label: "Mise en Cost Pitch Deck" }
  ],
  "tulsatogether": [
    // No local file uploaded yet
  ],
  // === 6/27-28 ASPIRE Event Projects ===
  "vibecheck nd": [
    { path: "/project-files/VibeCheck_ND.png", type: "image", label: "VibeCheck ND Promo" }
  ],
  "greenwood strong": [
    { path: "/project-files/Greenwood_Strong.pdf", type: "pdf", label: "Greenwood Strong Pitch Deck" }
  ],
  "tulsacares4you": [
    { path: "/project-files/TulsaCares4You.png", type: "image", label: "TulsaCares4You Flyer" }
  ],
  "gv sport creatives": [
    { path: "/project-files/GV_Sport_Creatives.jpg", type: "image", label: "GV Sport Creatives Team Photo" }
  ],
  "gws resource genie": [
    { path: "/project-files/GWS_Resource_Genie.pdf", type: "pdf", label: "Greenwood Guide Pitch Deck" }
  ],
  "p.r.i.d.e.": [
    { path: "/project-files/PRIDE_Hub.png", type: "image", label: "P.R.I.D.E. Hub Flyer" }
  ],
  "here 2 help": [
    { path: "/project-files/Here2Help_Tulsa.jpg", type: "image", label: "Here2Help Tulsa Screenshot" }
  ],
  "focus fuel": [
    { path: "/project-files/Focus_Fuel.jpg", type: "image", label: "Focus Fuel App Screenshot" }
  ],
  "family daily planner": [
    { path: "/project-files/Family_Daily_Planner.pdf", type: "pdf", label: "Family Daily Planner Pitch Deck" }
  ],
  "creative pathways": [
    { path: "/project-files/Creative_Pathways.png", type: "image", label: "Creative Pathways Careers Infographic" }
  ],
  "the shek space": [
    { path: "/project-files/The_SHEK_Space.pdf", type: "pdf", label: "The SHĒK Space Pitch Deck" }
  ],
  "tipsync": [
    { path: "/project-files/TIPSYNC.pdf", type: "pdf", label: "TIPSYNC Pitch Deck" }
  ],
  "truevoice": [
    { path: "/project-files/TrueVoice_Pitch_Deck.pdf", type: "pdf", label: "TrueVoice Pitch Deck" }
  ]
};

export function getLocalFilesForProject(projectName: string): LocalProjectFile[] {
  const normalizedName = projectName.toLowerCase().trim();
  
  // Try exact match first
  if (projectFileMap[normalizedName]) {
    return projectFileMap[normalizedName];
  }
  
  // Try partial match
  for (const [key, files] of Object.entries(projectFileMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return files;
    }
  }
  
  return [];
}

export function getFileIcon(type: LocalProjectFile['type']): string {
  switch (type) {
    case 'pdf': return '📄';
    case 'pptx': return '📊';
    case 'docx': return '📝';
    case 'image': return '🖼️';
    default: return '📁';
  }
}

export function isImageFile(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
}
