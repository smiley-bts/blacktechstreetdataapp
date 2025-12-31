import { useMemo } from "react";
import { Contact, getDisplayName } from "@/types/contact";

export interface DuplicateGroup {
  id: string;
  reason: string;
  contacts: Contact[];
  matchKey: string;
}

function normalizeEmail(email: string | undefined): string {
  return (email || "").toLowerCase().trim();
}

function normalizePhone(phone: string | undefined): string {
  return (phone || "").replace(/\D/g, "").slice(-10);
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "").trim();
}

export function useDuplicateDetection(contacts: Contact[]) {
  const duplicateGroups = useMemo(() => {
    const groups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    // Group by email
    const emailMap = new Map<string, Contact[]>();
    contacts.forEach((contact) => {
      const email = normalizeEmail(contact.email);
      if (email && email.length > 3) {
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email)!.push(contact);
      }
    });

    emailMap.forEach((contactsWithEmail, email) => {
      if (contactsWithEmail.length > 1) {
        const ids = contactsWithEmail.map((c) => c.recordId).sort().join("-");
        if (!processedIds.has(ids)) {
          processedIds.add(ids);
          groups.push({
            id: `email-${email}`,
            reason: "Same email address",
            contacts: contactsWithEmail,
            matchKey: email,
          });
        }
      }
    });

    // Group by phone
    const phoneMap = new Map<string, Contact[]>();
    contacts.forEach((contact) => {
      const phone = normalizePhone(contact.phone);
      if (phone && phone.length >= 10) {
        if (!phoneMap.has(phone)) {
          phoneMap.set(phone, []);
        }
        phoneMap.get(phone)!.push(contact);
      }
    });

    phoneMap.forEach((contactsWithPhone, phone) => {
      if (contactsWithPhone.length > 1) {
        const ids = contactsWithPhone.map((c) => c.recordId).sort().join("-");
        if (!processedIds.has(ids)) {
          processedIds.add(ids);
          groups.push({
            id: `phone-${phone}`,
            reason: "Same phone number",
            contacts: contactsWithPhone,
            matchKey: phone,
          });
        }
      }
    });

    // Group by similar name (first + last)
    const nameMap = new Map<string, Contact[]>();
    contacts.forEach((contact) => {
      const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
      const normalizedName = normalizeName(fullName);
      if (normalizedName && normalizedName.length > 4) {
        if (!nameMap.has(normalizedName)) {
          nameMap.set(normalizedName, []);
        }
        nameMap.get(normalizedName)!.push(contact);
      }
    });

    nameMap.forEach((contactsWithName, name) => {
      if (contactsWithName.length > 1) {
        const ids = contactsWithName.map((c) => c.recordId).sort().join("-");
        if (!processedIds.has(ids)) {
          processedIds.add(ids);
          groups.push({
            id: `name-${name}`,
            reason: "Similar name",
            contacts: contactsWithName,
            matchKey: name,
          });
        }
      }
    });

    return groups;
  }, [contacts]);

  const totalDuplicates = useMemo(() => {
    const uniqueIds = new Set<string>();
    duplicateGroups.forEach((group) => {
      group.contacts.forEach((c) => uniqueIds.add(c.recordId));
    });
    return uniqueIds.size;
  }, [duplicateGroups]);

  return { duplicateGroups, totalDuplicates };
}

export function mergeContacts(primary: Contact, secondary: Contact): Contact {
  const merged: Contact = { ...primary };

  // For each field, prefer primary's value, but use secondary's if primary is empty
  const fields: (keyof Contact)[] = [
    "firstName", "lastName", "fullName", "email", "phone", "uid",
    "city", "state", "country", "postalCode", "jobTitle", "companyName",
    "industry", "lifecycleStage", "aiExperienceLevel", "ageRange", "incomeRange",
    "currentRole", "linkedinUrl", "npsScore", "aiConfidence",
  ];

  fields.forEach((field) => {
    if (!merged[field] || merged[field] === "nan" || merged[field] === "") {
      if (secondary[field] && secondary[field] !== "nan") {
        (merged as any)[field] = secondary[field];
      }
    }
  });

  // Merge rawData
  merged.rawData = { ...secondary.rawData, ...primary.rawData };

  return merged;
}
