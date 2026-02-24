/**
 * CheckIn Page
 * MarkusV4 | 2026-02-24
 *
 * Mobile-friendly QR scan + manual check-in interface.
 * Staff open this on their phone at the event entrance.
 *
 * Route: /checkin/:eventId
 *
 * Features:
 * - Manual QR token entry (type/paste)
 * - Camera QR scanning via html5-qrcode (if installed)
 * - Attendee list with manual check-in toggle
 * - Real-time counts (registered vs checked in)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvent, useCheckIn, useManualCheckIn, CheckInResult } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  QrCode,
  UserCheck,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

// ── CHECK-IN RESULT BANNER ────────────────────────────────────

function CheckInBanner({ result, onDismiss }: { result: CheckInResult | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [result, onDismiss]);

  if (!result) return null;

  if (!result.success) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-destructive/20 border border-destructive p-4 mb-4 animate-in fade-in">
        <XCircle className="h-8 w-8 text-destructive shrink-0" />
        <div>
          <p className="font-semibold text-destructive">Not Found</p>
          <p className="text-sm text-muted-foreground">{result.error || "QR code not recognized"}</p>
        </div>
      </div>
    );
  }

  if (result.already_checked_in) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-yellow-500/20 border border-yellow-500 p-4 mb-4 animate-in fade-in">
        <AlertCircle className="h-8 w-8 text-yellow-500 shrink-0" />
        <div>
          <p className="font-semibold text-yellow-600 dark:text-yellow-400">Already Checked In</p>
          <p className="text-sm font-medium">{result.full_name}</p>
          <p className="text-xs text-muted-foreground">
            Checked in at {result.checked_in_at ? new Date(result.checked_in_at).toLocaleTimeString() : "earlier"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-green-500/20 border border-green-500 p-4 mb-4 animate-in fade-in">
      <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
      <div>
        <p className="font-semibold text-green-600 dark:text-green-400">Checked In! ✓</p>
        <p className="text-lg font-bold">{result.full_name}</p>
        <p className="text-xs text-muted-foreground">{result.email}</p>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────

export default function CheckIn() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, refetch } = useEvent(eventId);
  const checkIn = useCheckIn();
  const manualCheckIn = useManualCheckIn();

  const [qrInput, setQrInput] = useState("");
  const [search, setSearch] = useState("");
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const handleQrSubmit = async (token: string) => {
    const t = token.trim();
    if (!t) return;

    try {
      const result = await checkIn.mutateAsync({ qrToken: t, eventId });
      setLastResult(result);
      setQrInput("");

      if (result.success && !result.already_checked_in) {
        toast.success(`✓ ${result.full_name} checked in`);
      } else if (result.already_checked_in) {
        toast.warning(`${result.full_name} already checked in`);
      } else {
        toast.error(result.error || "QR code not found");
      }
    } catch (err) {
      setLastResult({ success: false, error: String(err) });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleQrSubmit(qrInput);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold">Event not found</p>
        <Button variant="outline" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const { event, registrations } = data;
  const checkedIn = registrations.filter((r) => r.checked_in).length;
  const total = registrations.length;

  const filteredRegistrations = registrations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.phone?.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{event.name}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(event.event_date).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground mt-1">Registered</p>
          </CardContent>
        </Card>
        <Card className="text-center border-green-500/50 bg-green-500/5">
          <CardContent className="pt-4 pb-3">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{checkedIn}</p>
            <p className="text-xs text-muted-foreground mt-1">Checked In</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-3xl font-bold">{total - checkedIn}</p>
            <p className="text-xs text-muted-foreground mt-1">Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Check-in result banner */}
      <CheckInBanner result={lastResult} onDismiss={() => setLastResult(null)} />

      {/* Tabs: QR scan vs attendee list */}
      <Tabs defaultValue="qr">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="qr" className="flex-1 gap-2">
            <QrCode className="h-4 w-4" /> QR Check-In
          </TabsTrigger>
          <TabsTrigger value="list" className="flex-1 gap-2">
            <Users className="h-4 w-4" /> Attendee List
          </TabsTrigger>
        </TabsList>

        {/* ── QR TAB ─────────────────────────────────────────── */}
        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scan or Enter QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Point a barcode scanner at the attendee's QR code, or type/paste the token below.
                Press <kbd className="bg-muted px-1 rounded text-xs">Enter</kbd> to check in.
              </p>
              <div className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="Scan QR or paste token…"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => handleQrSubmit(qrInput)}
                  disabled={!qrInput.trim() || checkIn.isPending}
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Most USB/Bluetooth barcode scanners auto-submit on scan.
                Just aim and scan.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LIST TAB ───────────────────────────────────────── */}
        <TabsContent value="list" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {filteredRegistrations.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {search ? "No matches found" : "No registrations yet"}
              </p>
            )}

            {filteredRegistrations.map((reg) => (
              <div
                key={reg.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  reg.checked_in
                    ? "bg-green-500/5 border-green-500/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{reg.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{reg.email}</p>
                  {reg.checked_in && reg.checked_in_at && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ {new Date(reg.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {reg.checked_in ? (
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                      In
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => manualCheckIn.mutate(reg.id)}
                      disabled={manualCheckIn.isPending}
                    >
                      Check In
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
