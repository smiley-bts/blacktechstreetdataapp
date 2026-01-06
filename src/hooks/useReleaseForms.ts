import { useState, useEffect, useMemo, useCallback } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReleaseForm {
  submissionId: string;
  respondentId: string;
  submittedAt: string;
  imageReleaseAgreed: boolean;
  confidentialityAgreed: boolean;
  printedName: string;
  signatureUrl: string;
  date: string;
}

function parseReleaseForm(row: Record<string, string>): ReleaseForm {
  return {
    submissionId: row["Submission ID"] || "",
    respondentId: row["Respondent ID"] || "",
    submittedAt: row["Submitted at"] || "",
    imageReleaseAgreed: row["I Agree To Black Tech Street's Image Release"]?.toLowerCase().includes("yes") || false,
    confidentialityAgreed: row["I Agree To Black Tech Street's Confidentiality Waiver"]?.toLowerCase().includes("yes") || false,
    printedName: row["Printed Name"]?.trim() || "",
    signatureUrl: row["Signature"] || "",
    date: row["Date"] || "",
  };
}

// Normalize name for matching
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

export function useReleaseForms() {
  const [releaseForms, setReleaseForms] = useState<ReleaseForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/aspire-release-forms.csv");
        if (!response.ok) {
          setLoading(false);
          return;
        }
        
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsed = result.data
              .map((row: any) => parseReleaseForm(row))
              .filter(form => form.printedName && form.signatureUrl);
            setReleaseForms(parsed);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load release forms");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Create a map for quick lookup by normalized name
  const releaseFormsByName = useMemo(() => {
    const map = new Map<string, ReleaseForm>();
    releaseForms.forEach(form => {
      const normalizedName = normalizeName(form.printedName);
      // Keep the most recent submission if duplicate names
      const existing = map.get(normalizedName);
      if (!existing || new Date(form.submittedAt) > new Date(existing.submittedAt)) {
        map.set(normalizedName, form);
      }
    });
    return map;
  }, [releaseForms]);

  // Check if a contact has signed the release form
  const hasSignedRelease = useCallback((firstName: string, lastName: string, fullName?: string) => {
    // Try full name first
    if (fullName) {
      const normalized = normalizeName(fullName);
      if (releaseFormsByName.has(normalized)) {
        return releaseFormsByName.get(normalized);
      }
    }
    
    // Try first + last name
    const combinedName = normalizeName(`${firstName} ${lastName}`);
    if (releaseFormsByName.has(combinedName)) {
      return releaseFormsByName.get(combinedName);
    }
    
    return null;
  }, [releaseFormsByName]);

  // Download signature from Tally and upload to Supabase Storage
  const uploadSignatureToStorage = useCallback(async (form: ReleaseForm): Promise<string | null> => {
    try {
      // Fetch the signature image from Tally
      const response = await fetch(form.signatureUrl);
      if (!response.ok) {
        console.error('Failed to fetch signature:', form.signatureUrl);
        return null;
      }
      
      const blob = await response.blob();
      const fileName = `${form.submissionId}_${normalizeName(form.printedName).replace(/\s/g, '_')}.png`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('signatures')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });
      
      if (error) {
        console.error('Failed to upload signature:', error);
        return null;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading signature:', err);
      return null;
    }
  }, []);

  // Sync release forms to contacts in database
  const syncReleaseFormsToContacts = useCallback(async () => {
    if (releaseForms.length === 0) {
      toast.info("No release forms to sync");
      return { updated: 0 };
    }

    let updated = 0;
    const toastId = toast.loading("Syncing release forms...");

    try {
      // Get all contacts from database
      const { data: contacts, error: fetchError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, full_name, email, release_signed');
      
      if (fetchError) {
        throw fetchError;
      }

      // Match and update contacts
      for (const contact of contacts || []) {
        // Skip if already marked as signed
        if (contact.release_signed) continue;
        
        const form = hasSignedRelease(
          contact.first_name || '',
          contact.last_name || '',
          contact.full_name
        );
        
        if (form) {
          // Upload signature to storage
          const storedSignatureUrl = await uploadSignatureToStorage(form);
          
          // Update contact with release form data
          const { error: updateError } = await supabase
            .from('contacts')
            .update({
              release_signed: true,
              release_date: form.date,
              release_signature_url: storedSignatureUrl || form.signatureUrl,
              image_release_agreed: form.imageReleaseAgreed,
              confidentiality_agreed: form.confidentialityAgreed,
            })
            .eq('id', contact.id);
          
          if (!updateError) {
            updated++;
          }
        }
      }

      toast.success(`Release forms synced`, {
        id: toastId,
        description: `${updated} contacts updated with release form data`,
      });

      return { updated };
    } catch (err) {
      console.error('Error syncing release forms:', err);
      toast.error("Failed to sync release forms", { id: toastId });
      return { updated: 0 };
    }
  }, [releaseForms, hasSignedRelease, uploadSignatureToStorage]);

  return {
    releaseForms,
    loading,
    error,
    hasSignedRelease,
    syncReleaseFormsToContacts,
    totalForms: releaseForms.length,
  };
}
