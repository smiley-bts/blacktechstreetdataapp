import { useState, useEffect } from "react";
import Papa from "papaparse";

export interface Sep2025Signup {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  zipCode: string;
  accessibilityNeeds: string;
  tshirtSize: string;
  needsLaptop: string;
  ageRange: string;
  educationLevel: string;
  currentRole: string;
  roleOther: string;
  aiExperienceLevel: string;
  aiConfidenceSolving: string;
  aiConfidenceApplying: string;
  communityInvolvement: string;
  hasDeviceAccess: string;
  languagesSpoken: string;
  racialIdentity: string;
  incomeRange: string;
  confidentialityAgreed: boolean;
  imageReleaseAgreed: boolean;
  signatureUrl: string;
}

export function useSep2025Event() {
  const [signups, setSignups] = useState<Sep2025Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/aspire-sep2025-signup.csv");
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map((row: any): Sep2025Signup => ({
              submissionId: row["Submission ID"] || "",
              respondentId: row["Respondent ID"] || "",
              submittedAt: row["Submitted at"] || "",
              firstName: row["What's your first name?"] || "",
              lastName: row["What's your last name?"] || "",
              phone: row["What's your phone number? "] || "",
              email: row["What's your email?"] || "",
              zipCode: row["What's your ZIP code?"] || "",
              accessibilityNeeds: row["Do you have any accessibility needs you'd like us to be aware of?"] || "",
              tshirtSize: row["What's your t-shirt size?"] || "",
              needsLaptop: row["Will you need to check out a laptop during the event?"] || "",
              ageRange: row["What is your age range?"] || "",
              educationLevel: row["What's the highest level of education you've completed?"] || "",
              currentRole: row["What best describes your current role?"] || "",
              roleOther: row["If other, please provide more details."] || "",
              aiExperienceLevel: row["Which best describes your current level of experience using AI tools?"] || "",
              aiConfidenceSolving: row["How confident do you feel using AI to solve problems or create ideas?"] || "",
              aiConfidenceApplying: row["How confident do you feel applying AI tools in your work, life and community?"] || "",
              communityInvolvement: row["In what ways, big or small, do you currently feel connected to or supportive of your community? \n\nThis could include involvement with projects, nonprofits, small businesses, causes, or even personal actions or intentions. (It's okay to say you're not involved right now).\n"] || "",
              hasDeviceAccess: row["\n\nDo you currently have regular access to a smartphone, computer, and internet? \n"] || "",
              languagesSpoken: row["\n\nWhat language(s) do you primarily speak at home? (Select all that apply).\n (English)"] || "",
              racialIdentity: row["What's your racial identity?"] || "",
              incomeRange: row["Which of the following ranges best describes your total household income before taxes last year?\n"] || "",
              confidentialityAgreed: row["Agreements (I agree not to share any confidential program materials or discussions.)"]?.toLowerCase().includes("agree") || false,
              imageReleaseAgreed: row["Untitled checkboxes field (I grant permission for Black Tech Street to use my photo or video likeness for promotional purposes)"]?.toLowerCase().includes("grant") || false,
              signatureUrl: row["Signature"] || "",
            }));
            
            setSignups(parsed.filter(s => s.email));
            setLoading(false);
          },
          error: (err) => {
            console.error("Error parsing Sep 2025 signup CSV:", err);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error loading Sep 2025 signup CSV:", err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { signups, loading };
}
