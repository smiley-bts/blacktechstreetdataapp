import { useState } from "react";
import { Download, FileSpreadsheet, Calendar, Star, Hammer, CheckSquare, Square } from "lucide-react";
import { Contact } from "@/types/contact";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ExportModalProps {
  contacts: Contact[];
  filteredContacts: Contact[];
}

interface FieldGroup {
  name: string;
  icon: React.ReactNode;
  fields: { key: keyof Contact; label: string }[];
}

const fieldGroups: FieldGroup[] = [
  {
    name: "Core Info",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    fields: [
      { key: "uid", label: "UID" },
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "fullName", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "linkedinUrl", label: "LinkedIn URL" },
    ],
  },
  {
    name: "Demographics",
    icon: <Calendar className="h-4 w-4" />,
    fields: [
      { key: "ageRange", label: "Age Range" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "postalCode", label: "Postal Code" },
      { key: "incomeRange", label: "Income Range" },
      { key: "industry", label: "Industry" },
      { key: "jobTitle", label: "Job Title" },
      { key: "currentRole", label: "Current Role" },
    ],
  },
  {
    name: "AI & Program",
    icon: <Star className="h-4 w-4" />,
    fields: [
      { key: "aiExperienceLevel", label: "AI Experience Level" },
      { key: "aiConfidence", label: "AI Confidence" },
      { key: "preWorkshopMindset", label: "Pre-Workshop Mindset" },
      { key: "postWorkshopMindset", label: "Post-Workshop Mindset" },
      { key: "cohort1AiLevel", label: "Cohort 1 AI Level" },
      { key: "eventsAttended", label: "Events Attended" },
      { key: "sept27thReg", label: "Sept 27th Registration" },
    ],
  },
  {
    name: "Event Feedback",
    icon: <Star className="h-4 w-4" />,
    fields: [
      { key: "npsScore", label: "NPS Score" },
      { key: "ahaMoment", label: "Aha Moment" },
      { key: "favoritePart", label: "Favorite Part" },
      { key: "newConceptLearned", label: "New Concept Learned" },
      { key: "optionalQuote", label: "Quote" },
      { key: "postEventAIConfidence", label: "Post-Event AI Confidence" },
      { key: "strongestSkillAfterToday", label: "Strongest Skill" },
    ],
  },
  {
    name: "Build Day",
    icon: <Hammer className="h-4 w-4" />,
    fields: [
      { key: "teamBuildDescription", label: "Team Build Description" },
      { key: "aiToolsUsed", label: "AI Tools Used" },
      { key: "rolesOnTeam", label: "Roles on Team" },
      { key: "teamImpact", label: "Team Impact" },
      { key: "oneWayToUseAI", label: "One Way to Use AI" },
      { key: "attendFollowUp", label: "Attend Follow-up" },
    ],
  },
  {
    name: "CRM & Status",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    fields: [
      { key: "lifecycleStage", label: "Lifecycle Stage" },
      { key: "leadStatus", label: "Lead Status" },
      { key: "contactOwner", label: "Contact Owner" },
      { key: "createDate", label: "Create Date" },
      { key: "lastActivityDate", label: "Last Activity" },
      { key: "volunteerInterest", label: "Volunteer Interest" },
    ],
  },
];

const presetExports = [
  {
    name: "Quick Contact List",
    description: "Name, Email, Phone, LinkedIn",
    fields: ["fullName", "email", "phone", "linkedinUrl"] as (keyof Contact)[],
  },
  {
    name: "Event Attendee Report",
    description: "Contact info + AI level + Events",
    fields: ["fullName", "email", "phone", "aiExperienceLevel", "eventsAttended", "npsScore", "ahaMoment"] as (keyof Contact)[],
  },
  {
    name: "Build Day Participants",
    description: "Team projects and AI tools used",
    fields: ["fullName", "email", "teamBuildDescription", "aiToolsUsed", "rolesOnTeam", "oneWayToUseAI"] as (keyof Contact)[],
  },
  {
    name: "Demographics Deep Dive",
    description: "Full demographic breakdown",
    fields: ["fullName", "email", "ageRange", "city", "state", "incomeRange", "industry", "jobTitle"] as (keyof Contact)[],
  },
  {
    name: "Full Export",
    description: "All available fields",
    fields: fieldGroups.flatMap(g => g.fields.map(f => f.key)),
  },
];

export function ExportModal({ contacts, filteredContacts }: ExportModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<keyof Contact>>(
    new Set(["fullName", "email", "phone", "aiExperienceLevel"])
  );
  const [exportFiltered, setExportFiltered] = useState(true);

  const toggleField = (field: keyof Contact) => {
    const newSet = new Set(selectedFields);
    if (newSet.has(field)) {
      newSet.delete(field);
    } else {
      newSet.add(field);
    }
    setSelectedFields(newSet);
  };

  const selectAllInGroup = (group: FieldGroup) => {
    const newSet = new Set(selectedFields);
    group.fields.forEach(f => newSet.add(f.key));
    setSelectedFields(newSet);
  };

  const deselectAllInGroup = (group: FieldGroup) => {
    const newSet = new Set(selectedFields);
    group.fields.forEach(f => newSet.delete(f.key));
    setSelectedFields(newSet);
  };

  const applyPreset = (preset: typeof presetExports[0]) => {
    setSelectedFields(new Set(preset.fields));
  };

  const handleExport = () => {
    const dataToExport = exportFiltered ? filteredContacts : contacts;
    const fieldsArray = Array.from(selectedFields);
    
    const headers = fieldsArray.map(field => {
      const allFields = fieldGroups.flatMap(g => g.fields);
      return allFields.find(f => f.key === field)?.label || field;
    });

    const rows = dataToExport.map(contact =>
      fieldsArray.map(field => {
        const value = contact[field];
        if (typeof value === 'object') return '';
        return String(value || '').replace(/"/g, '""');
      })
    );

    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().split("T")[0];
    const suffix = exportFiltered ? "filtered" : "all";
    a.download = `contacts-${suffix}-${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary/60 hover:bg-primary/20 transition-all duration-300">
          <Download className="h-4 w-4" />
          Export
          <Badge variant="secondary" className="ml-1 text-xs">Pro</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Export Contacts
          </DialogTitle>
          <DialogDescription>
            Choose which fields to include in your export
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="presets" className="gap-2">
              <Star className="h-4 w-4" />
              Quick Presets
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Custom Fields
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {presetExports.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 text-left transition-all duration-200 group"
                >
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {preset.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {preset.fields.length} fields
                  </p>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {fieldGroups.map((group) => {
                  const selectedInGroup = group.fields.filter(f => selectedFields.has(f.key)).length;
                  return (
                    <div key={group.name}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {group.icon}
                          <Label className="font-medium">{group.name}</Label>
                          <Badge variant="outline" className="text-xs">
                            {selectedInGroup}/{group.fields.length}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => selectAllInGroup(group)}
                          >
                            All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => deselectAllInGroup(group)}
                          >
                            None
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.fields.map((field) => (
                          <div
                            key={field.key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`export-${field.key}`}
                              checked={selectedFields.has(field.key)}
                              onCheckedChange={() => toggleField(field.key)}
                            />
                            <Label
                              htmlFor={`export-${field.key}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {field.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Export options */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="export-filtered"
                checked={exportFiltered}
                onCheckedChange={(c) => setExportFiltered(!!c)}
              />
              <Label htmlFor="export-filtered" className="text-sm">
                Export filtered only
              </Label>
            </div>
            <Badge variant="outline">
              {exportFiltered ? filteredContacts.length : contacts.length} contacts
            </Badge>
          </div>

          <Button
            onClick={handleExport}
            disabled={selectedFields.size === 0}
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            Export {selectedFields.size} Fields
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
