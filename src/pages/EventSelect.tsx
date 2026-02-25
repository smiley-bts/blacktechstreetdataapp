import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEvents, BTSEvent } from '@/hooks/useEvents';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  UserCheck,
  Plus,
} from 'lucide-react';
import btsLogo from '@/assets/black-tech-street-logo.png';
import { format } from 'date-fns';

function EventCard({ event, onSelect }: { event: BTSEvent; onSelect: () => void }) {
  const checkedIn = event.checked_in_count ?? 0;
  const total = event.registration_count ?? 0;
  const isToday = event.event_date === format(new Date(), 'yyyy-MM-dd');

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg active:scale-[0.98]"
      onClick={onSelect}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{event.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {format(new Date(event.event_date), 'MMM d, yyyy')}
              {event.start_time && ` at ${event.start_time.slice(0, 5)}`}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
            )}
          </div>
          {isToday && (
            <Badge className="bg-emerald-500 text-white">Today</Badge>
          )}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{total}</span>
            <span className="text-muted-foreground">registered</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <UserCheck className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">{checkedIn}</span>
            <span className="text-muted-foreground">checked in</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventSelectContent() {
  const { data: events, isLoading } = useEvents();
  const navigate = useNavigate();

  const sortedEvents = [...(events || [])].sort((a, b) =>
    new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/staff')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={btsLogo} alt="BTS" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-foreground">Select Event</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading events...</div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to start checking in attendees.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={() => navigate(`/staff/checkin/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function EventSelect() {
  return (
    <ProtectedRoute requireAdmin>
      <EventSelectContent />
    </ProtectedRoute>
  );
}
