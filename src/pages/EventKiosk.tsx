import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  useEvent,
  useSearchRegistrations,
  useManualCheckIn,
  useCheckOut,
  useAddWalkIn,
  EventRegistration,
} from '@/hooks/useEvents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  CheckCircle2,
  Clock,
  LogOut as LogOutIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import btsLogo from '@/assets/black-tech-street-logo.png';

type KioskMode = 'checkin' | 'checkout';

function AttendeeRow({
  reg,
  mode,
  onCheckIn,
  onCheckOut,
  isPending,
}: {
  reg: EventRegistration;
  mode: KioskMode;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isPending: boolean;
}) {
  const isCheckedIn = reg.checked_in;
  const isCheckedOut = reg.checked_out;

  if (mode === 'checkout' && !isCheckedIn) return null;
  if (mode === 'checkout' && isCheckedOut) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-lg truncate">
          {reg.full_name || `${reg.first_name || ''} ${reg.last_name || ''}`.trim() || 'Unknown'}
        </p>
        {reg.email && (
          <p className="text-sm text-muted-foreground truncate">{reg.email}</p>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4">
        {isCheckedIn && mode === 'checkin' && (
          <Badge variant="outline" className="text-emerald-500 border-emerald-500 whitespace-nowrap">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Checked In
          </Badge>
        )}

        {mode === 'checkin' && !isCheckedIn && (
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            onClick={onCheckIn}
            disabled={isPending}
          >
            <UserCheck className="h-5 w-5 mr-2" />
            Check In
          </Button>
        )}

        {mode === 'checkout' && isCheckedIn && !isCheckedOut && (
          <Button
            size="lg"
            variant="outline"
            className="border-amber-500 text-amber-500 hover:bg-amber-500/10 min-w-[120px]"
            onClick={onCheckOut}
            disabled={isPending}
          >
            <LogOutIcon className="h-5 w-5 mr-2" />
            Check Out
          </Button>
        )}
      </div>
    </div>
  );
}

function EventKioskContent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mode, setMode] = useState<KioskMode>('checkin');
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInFirst, setWalkInFirst] = useState('');
  const [walkInLast, setWalkInLast] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');

  const { data: eventData, isLoading: eventLoading } = useEvent(eventId);
  const { data: searchResults } = useSearchRegistrations(eventId, debouncedSearch);
  const checkInMutation = useManualCheckIn();
  const checkOutMutation = useCheckOut();
  const walkInMutation = useAddWalkIn();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-focus search
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleCheckIn = async (reg: EventRegistration) => {
    try {
      await checkInMutation.mutateAsync({
        registrationId: reg.id,
        userId: user?.id,
      });
      toast.success(`${reg.full_name || 'Attendee'} checked in!`);
    } catch (err) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async (reg: EventRegistration) => {
    try {
      await checkOutMutation.mutateAsync({
        registrationId: reg.id,
        userId: user?.id,
      });
      toast.success(`${reg.full_name || 'Attendee'} checked out!`);
    } catch (err) {
      toast.error('Failed to check out');
    }
  };

  const handleWalkIn = async () => {
    if (!walkInFirst.trim() || !eventId) return;
    try {
      await walkInMutation.mutateAsync({
        eventId,
        firstName: walkInFirst.trim(),
        lastName: walkInLast.trim(),
        email: walkInEmail.trim() || undefined,
        userId: user?.id,
      });
      toast.success(`${walkInFirst} ${walkInLast} added and checked in!`);
      setWalkInOpen(false);
      setWalkInFirst('');
      setWalkInLast('');
      setWalkInEmail('');
    } catch (err) {
      toast.error('Failed to add walk-in');
    }
  };

  const event = eventData?.event;
  const registrations = searchResults || eventData?.registrations || [];
  const totalRegistered = event?.registration_count ?? 0;
  const totalCheckedIn = event?.checked_in_count ?? 0;

  // For checkout mode, filter to only checked-in not-yet-checked-out
  const displayList = mode === 'checkout'
    ? registrations.filter((r) => r.checked_in && !r.checked_out)
    : registrations;

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-lg">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Event not found</p>
          <Button onClick={() => navigate('/staff/events')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/staff/events')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <img src={btsLogo} alt="BTS" className="h-8 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-foreground">{event.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {mode === 'checkin' ? 'Check-In Kiosk' : 'Check-Out Kiosk'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{totalCheckedIn}</p>
                <p className="text-xs text-muted-foreground">Checked In</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{totalRegistered}</p>
                <p className="text-xs text-muted-foreground">Registered</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Toggle + Search */}
      <div className="border-b border-border bg-card shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'checkin'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMode('checkin')}
              >
                <UserCheck className="h-4 w-4 inline mr-1.5" />
                Check In
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'checkout'
                    ? 'bg-amber-600 text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMode('checkout')}
              >
                <LogOutIcon className="h-4 w-4 inline mr-1.5" />
                Check Out
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 text-lg"
              />
            </div>

            {/* Walk-in Button */}
            {mode === 'checkin' && (
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => setWalkInOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Walk-In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Attendee List */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-2">
          <Card>
            <CardContent className="p-0">
              {displayList.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {searchTerm
                    ? 'No attendees found matching your search'
                    : mode === 'checkout'
                    ? 'No one to check out yet'
                    : 'No registrations for this event'}
                </div>
              ) : (
                displayList.map((reg) => (
                  <AttendeeRow
                    key={reg.id}
                    reg={reg}
                    mode={mode}
                    onCheckIn={() => handleCheckIn(reg)}
                    onCheckOut={() => handleCheckOut(reg)}
                    isPending={checkInMutation.isPending || checkOutMutation.isPending}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Walk-in Dialog */}
      <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Walk-In Attendee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="walkin-first">First Name *</Label>
              <Input
                id="walkin-first"
                value={walkInFirst}
                onChange={(e) => setWalkInFirst(e.target.value)}
                placeholder="First name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walkin-last">Last Name</Label>
              <Input
                id="walkin-last"
                value={walkInLast}
                onChange={(e) => setWalkInLast(e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walkin-email">Email (optional)</Label>
              <Input
                id="walkin-email"
                type="email"
                value={walkInEmail}
                onChange={(e) => setWalkInEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalkInOpen(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleWalkIn}
              disabled={!walkInFirst.trim() || walkInMutation.isPending}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add & Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EventKiosk() {
  return (
    <ProtectedRoute requireAdmin>
      <EventKioskContent />
    </ProtectedRoute>
  );
}
