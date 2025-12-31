import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, ClipboardPaste, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { Contact, parseContact } from "@/types/contact";

interface ImportContactsModalProps {
  onImport: (contacts: Contact[]) => void;
}

export function ImportContactsModal({ onImport }: ImportContactsModalProps) {
  const [open, setOpen] = useState(false);
  const [pastedData, setPastedData] = useState("");
  const [preview, setPreview] = useState<Contact[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSVData = (csvText: string): Contact[] => {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return result.data.map((row: any) => parseContact(row));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const contacts = parseCSVData(text);
        setPreview(contacts);
        setParseError(null);
        toast({
          title: "File parsed successfully",
          description: `Found ${contacts.length} contacts ready to import`,
        });
      } catch (err: any) {
        setParseError(err.message);
        setPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handlePastedDataParse = () => {
    if (!pastedData.trim()) {
      setParseError("Please paste some data first");
      return;
    }

    try {
      const contacts = parseCSVData(pastedData);
      setPreview(contacts);
      setParseError(null);
      toast({
        title: "Data parsed successfully",
        description: `Found ${contacts.length} contacts ready to import`,
      });
    } catch (err: any) {
      setParseError(err.message);
      setPreview([]);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast({
        title: "No contacts to import",
        description: "Please upload a file or paste data first",
        variant: "destructive",
      });
      return;
    }

    onImport(preview);
    setOpen(false);
    setPreview([]);
    setPastedData("");
    toast({
      title: "Import successful!",
      description: `${preview.length} contacts have been imported`,
    });
  };

  const handleDownloadTemplate = () => {
    const template = "Record ID,First Name,Last Name,Full Name,Email,Phone,UID,City,State,Company Name,Job Title,Lifecycle Stage,AI Experience Level\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contact-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Contacts
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="file" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="file" className="gap-2">
              <FileText className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-2">
              <ClipboardPaste className="h-4 w-4" />
              Paste Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop a CSV file, or click to select
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Select CSV File
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="gap-2" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Paste CSV data including headers. First row should be column names.
              </p>
              <Textarea
                placeholder="Record ID,First Name,Last Name,Email,...&#10;123,John,Doe,john@example.com,..."
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <Button onClick={handlePastedDataParse} className="gap-2">
                <ClipboardPaste className="h-4 w-4" />
                Parse Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {parseError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Parse Error</p>
              <p className="text-sm">{parseError}</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>{preview.length} contacts ready to import</span>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Email</th>
                    <th className="px-3 py-2 text-left font-medium">UID</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((contact, idx) => (
                    <tr key={idx} className="border-t border-border/30">
                      <td className="px-3 py-2">
                        {contact.fullName || `${contact.firstName} ${contact.lastName}`.trim() || "-"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{contact.email || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{contact.uid || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="text-center text-sm text-muted-foreground py-2 bg-muted/30">
                  ...and {preview.length - 10} more
                </p>
              )}
            </div>

            <Button onClick={handleImport} className="w-full gap-2">
              <Upload className="h-4 w-4" />
              Import {preview.length} Contacts
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
