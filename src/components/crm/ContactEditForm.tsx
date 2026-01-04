import { useState, useEffect } from "react";
import { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, X, RotateCcw, Pencil } from "lucide-react";
import { EDITABLE_FIELDS, EditableFieldKey } from "@/hooks/useContactOverrides";
import { toast } from "@/hooks/use-toast";

interface ContactEditFormProps {
  contact: Contact;
  overrides: Record<string, string>;
  onSave: (fields: Record<string, string>) => void;
  onClear: () => void;
  onCancel: () => void;
}

export function ContactEditForm({
  contact,
  overrides,
  onSave,
  onClear,
  onCancel,
}: ContactEditFormProps) {
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize with current overrides
    setEditedFields({ ...overrides });
  }, [overrides]);

  const getValue = (key: string): string => {
    // Priority: edited value > override > original
    if (editedFields[key] !== undefined) return editedFields[key];
    if (overrides[key] !== undefined) return overrides[key];
    return (contact as any)[key] || "";
  };

  const handleChange = (key: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Only save fields that differ from original
    const changedFields: Record<string, string> = {};
    
    EDITABLE_FIELDS.forEach(({ key }) => {
      const editedValue = editedFields[key];
      const originalValue = (contact as any)[key] || "";
      
      if (editedValue !== undefined && editedValue !== originalValue) {
        changedFields[key] = editedValue;
      }
    });

    onSave(changedFields);
    toast({ title: "Changes saved!", description: "Contact information updated locally" });
  };

  const hasChanges = () => {
    return EDITABLE_FIELDS.some(({ key }) => {
      const editedValue = editedFields[key];
      const originalValue = (contact as any)[key] || "";
      const overrideValue = overrides[key];
      
      // Compare to what's currently saved (override or original)
      const currentValue = overrideValue !== undefined ? overrideValue : originalValue;
      return editedValue !== undefined && editedValue !== currentValue;
    });
  };

  const isEdited = (key: string): boolean => {
    return overrides[key] !== undefined || editedFields[key] !== undefined;
  };

  const hasAnyOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-foreground">Edit Contact</h4>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyOverrides && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset All
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Changes are saved locally in your browser. 
        {hasAnyOverrides && (
          <Badge variant="outline" className="ml-2 text-xs">
            {Object.keys(overrides).length} field(s) edited
          </Badge>
        )}
      </p>

      <ScrollArea className="h-[320px] pr-4">
        <div className="space-y-4">
          {EDITABLE_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor={key} className="text-sm">
                  {label}
                </Label>
                {isEdited(key) && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    Edited
                  </Badge>
                )}
              </div>
              <Input
                id={key}
                value={getValue(key)}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className={isEdited(key) ? "border-primary/50" : ""}
              />
              {overrides[key] !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Original: {(contact as any)[key] || "(empty)"}
                </p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges()}>
          <Save className="h-4 w-4 mr-1" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
