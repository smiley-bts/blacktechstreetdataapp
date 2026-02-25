import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Laptop,
  CalendarDays,
  LogOut,
  Shield,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';
import btsLogo from '@/assets/black-tech-street-logo.png';

const actions = [
  {
    title: 'Event Check-In / Out',
    description: 'Check attendees in and out at events',
    icon: UserCheck,
    href: '/staff/events',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    title: 'Laptop Checkout',
    description: 'Track laptop loans and returns',
    icon: Laptop,
    href: '/staff/laptops',
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    title: 'View Events',
    description: 'Browse upcoming and past events',
    icon: CalendarDays,
    href: '/staff/events',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'CRM Dashboard',
    description: 'View contacts, reports, and analytics',
    icon: ClipboardList,
    href: '/',
    color: 'bg-purple-500/10 text-purple-500',
  },
];

function StaffHomeContent() {
  const { profile, signOut, isOwner, isAdmin, canManageUsers } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const roleName = isOwner ? 'Owner' : isAdmin ? 'Admin' : 'Staff';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={btsLogo}
                alt="Black Tech Street Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">BTS Staff Hub</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {profile?.display_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {roleName}
              </Badge>
              {canManageUsers && (
                <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">What do you need to do?</h2>
          <p className="text-muted-foreground mt-1">Select an action below to get started.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          {actions.map((action) => (
            <Card
              key={action.href + action.title}
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg active:scale-[0.98]"
              onClick={() => navigate(action.href)}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`rounded-xl p-3 ${action.color}`}>
                  <action.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function StaffHome() {
  return (
    <ProtectedRoute requireAdmin>
      <StaffHomeContent />
    </ProtectedRoute>
  );
}
