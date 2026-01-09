import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EVENT_OPTIONS = [
  { value: "March 2025 Pre-Survey", label: "March 6th Pre-Survey/Interest" },
  { value: "May 15 2025 Workshop", label: "May 15th Workshop" },
  { value: "May 30 2025 Workshop", label: "May 30th Workshop" },
  { value: "June 2025 Day 1", label: "June 27th Day 1" },
  { value: "June 2025 Day 2", label: "June 28th Day 2" },
  { value: "Happy Hour Aug 2025", label: "Happy Hour August 27th" },
  { value: "LTF Dec 2025", label: "LTF Workshop" },
  { value: "Sep 2025 Build Day", label: "September 27th Build Day" },
];

interface SyncResult {
  success: boolean;
  dryRun: boolean;
  summary: {
    totalRecords: number;
    matched: number;
    unmatched: number;
    updated: number;
    errors: number;
  };
  matched: { name: string; email?: string; contactId: string; event: string }[];
  unmatched: { name: string; email?: string; event: string }[];
  errors: string[];
}

export function AttendanceImportModal() {
  const [open, setOpen] = useState(false);
  const [rawData, setRawData] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  const parseAttendanceData = useCallback((data: string, event: string) => {
    const lines = data.split('\n').filter(line => line.trim());
    const records: { name: string; email?: string; event: string }[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Try to extract email if present (common formats)
      const emailMatch = trimmed.match(/[\w.-]+@[\w.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0].toLowerCase() : undefined;
      
      // Remove email from name if present
      let name = trimmed;
      if (email) {
        name = name.replace(email, '').replace(/[,<>()]/g, '').trim();
      }
      
      // Skip header rows or empty names
      if (name.toLowerCase().includes('name') && name.toLowerCase().includes('email')) continue;
      if (!name || name.length < 2) continue;
      
      records.push({ name, email, event });
    }
    
    return records;
  }, []);

  const handlePreview = useCallback(async () => {
    if (!rawData.trim() || !selectedEvent) {
      toast.error("Please enter attendance data and select an event");
      return;
    }

    setLoading(true);
    try {
      const attendanceRecords = parseAttendanceData(rawData, selectedEvent);
      
      if (attendanceRecords.length === 0) {
        toast.error("No valid attendance records found");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-attendance', {
        body: { attendanceRecords, dryRun: true }
      });

      if (error) throw error;

      setResult(data);
      setActiveTab("preview");
      toast.success(`Found ${data.summary.matched} matches out of ${data.summary.totalRecords} records`);
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error(error.message || "Failed to preview attendance data");
    } finally {
      setLoading(false);
    }
  }, [rawData, selectedEvent, parseAttendanceData]);

  const handleSync = useCallback(async () => {
    if (!rawData.trim() || !selectedEvent) return;

    setLoading(true);
    try {
      const attendanceRecords = parseAttendanceData(rawData, selectedEvent);
      
      const { data, error } = await supabase.functions.invoke('sync-attendance', {
        body: { attendanceRecords, dryRun: false }
      });

      if (error) throw error;

      setResult(data);
      setActiveTab("results");
      toast.success(`Successfully updated ${data.summary.updated} contacts!`);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || "Failed to sync attendance data");
    } finally {
      setLoading(false);
    }
  }, [rawData, selectedEvent, parseAttendanceData]);

  const handleClose = () => {
    setOpen(false);
    setRawData("");
    setSelectedEvent("");
    setResult(null);
    setActiveTab("input");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Upload className="h-4 w-4" />
          <span className="hidden md:inline">Sync Attendance</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Sync Attendance Data
          </DialogTitle>
          <DialogDescription>
            Import attendance data from Excel/CSV to update contact records
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">1. Input</TabsTrigger>
            <TabsTrigger value="preview" disabled={!result}>2. Preview</TabsTrigger>
            <TabsTrigger value="results" disabled={!result || result.dryRun}>3. Results</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="flex-1 flex flex-col gap-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the event these attendees attended" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-sm font-medium mb-2 block">
                Paste Attendance Data
                <span className="text-muted-foreground font-normal ml-2">(one name per line, optional email)</span>
              </label>
              <Textarea
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder={"John Doe\nJane Smith, jane@email.com\nBob Johnson <bob@example.com>"}
                className="flex-1 min-h-[200px] font-mono text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handlePreview} disabled={loading || !rawData.trim() || !selectedEvent}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Preview Matches
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 flex flex-col gap-4 mt-4 min-h-0">
            {result && (
              <>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{result.summary.totalRecords}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{result.summary.matched}</p>
                    <p className="text-xs text-muted-foreground">Matched</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">{result.summary.unmatched}</p>
                    <p className="text-xs text-muted-foreground">Unmatched</p>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-destructive">{result.summary.errors}</p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 border rounded-lg min-h-0">
                  <div className="p-4 space-y-4">
                    {result.matched.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Matched ({result.matched.length})
                        </h4>
                        <div className="space-y-1">
                          {result.matched.slice(0, 20).map((m, i) => (
                            <div key={i} className="text-sm flex items-center gap-2 text-muted-foreground">
                              <Badge variant="outline" className="text-xs">Match</Badge>
                              {m.name} {m.email ? `(${m.email})` : ''}
                            </div>
                          ))}
                          {result.matched.length > 20 && (
                            <p className="text-xs text-muted-foreground">...and {result.matched.length - 20} more</p>
                          )}
                        </div>
                      </div>
                    )}

                    {result.unmatched.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-amber-600" />
                          Unmatched ({result.unmatched.length})
                        </h4>
                        <div className="space-y-1">
                          {result.unmatched.slice(0, 20).map((u, i) => (
                            <div key={i} className="text-sm flex items-center gap-2 text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">No Match</Badge>
                              {u.name} {u.email ? `(${u.email})` : ''}
                            </div>
                          ))}
                          {result.unmatched.length > 20 && (
                            <p className="text-xs text-muted-foreground">...and {result.unmatched.length - 20} more</p>
                          )}
                        </div>
                      </div>
                    )}

                    {result.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          Errors ({result.errors.length})
                        </h4>
                        <div className="space-y-1">
                          {result.errors.map((e, i) => (
                            <p key={i} className="text-sm text-destructive">{e}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("input")}>Back</Button>
                  <Button onClick={handleSync} disabled={loading || result.summary.matched === 0}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sync {result.summary.matched} Contacts
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="results" className="flex-1 flex flex-col gap-4 mt-4">
            {result && !result.dryRun && (
              <>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
                    Sync Complete!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Successfully updated <strong>{result.summary.updated}</strong> contacts with attendance data for <strong>{selectedEvent}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{result.summary.totalRecords}</p>
                    <p className="text-xs text-muted-foreground">Processed</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{result.summary.updated}</p>
                    <p className="text-xs text-muted-foreground">Updated</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">{result.summary.unmatched}</p>
                    <p className="text-xs text-muted-foreground">Unmatched</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleClose}>Done</Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
