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
