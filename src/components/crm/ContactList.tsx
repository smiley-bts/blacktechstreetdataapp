import { useState, useMemo } from "react";
import { Contact, ContactFilter } from "@/types/contact";
import { ContactCard, ContactCardSkeleton } from "./ContactCard";
import { ContactDetailModal } from "./ContactDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserCheck, UserPlus, Star, Sparkles } from "lucide-react";

interface ContactListProps {
  contacts: Contact[];
  loading: boolean;
  filters: ContactFilter;
}

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  filter: (contact: Contact) => boolean;
}

const tabs: TabConfig[] = [
  {
    id: "all",
    label: "All Contacts",
    icon: Users,
    filter: () => true,
  },
  {
    id: "leads",
    label: "Leads",
    icon: UserPlus,
    filter: (c) => c.lifecycleStage?.toLowerCase() === "lead",
  },
  {
    id: "subscribers",
    label: "Subscribers",
    icon: UserCheck,
    filter: (c) => c.lifecycleStage?.toLowerCase() === "subscriber",
  },
  {
    id: "emerging",
    label: "Emerging AI Users",
    icon: Sparkles,
    filter: (c) => c.aiExperienceLevel?.toLowerCase().includes("emerging"),
  },
  {
    id: "intermediate",
    label: "Intermediate+",
    icon: Star,
    filter: (c) => 
      c.aiExperienceLevel?.toLowerCase().includes("intermediate") ||
      c.aiExperienceLevel?.toLowerCase().includes("advanced") ||
      c.aiExperienceLevel?.toLowerCase().includes("expert"),
  },
];

export function ContactList({ contacts, loading, filters }: ContactListProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const tabContacts = useMemo(() => {
    const result: Record<string, Contact[]> = {};
    tabs.forEach((tab) => {
      result[tab.id] = contacts.filter(tab.filter);
    });
    return result;
  }, [contacts]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ContactCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-4 h-auto p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-xs opacity-70">
                ({tabContacts[tab.id]?.length || 0})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="m-0">
            {tabContacts[tab.id]?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <tab.icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No contacts found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tabContacts[tab.id]?.slice(0, 100).map((contact) => (
                  <ContactCard
                    key={contact.recordId}
                    contact={contact}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
              </div>
            )}
            {tabContacts[tab.id]?.length > 100 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing first 100 of {tabContacts[tab.id].length.toLocaleString()} contacts. 
                Use search/filters to narrow results.
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <ContactDetailModal
        contact={selectedContact}
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      />
    </>
  );
}
