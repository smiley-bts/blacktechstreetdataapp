import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  User, 
  FileText, 
  Activity, 
  Shield,
  Home,
  Users
} from 'lucide-react';
import btsLogo from '@/assets/black-tech-street-logo.png';
import { PasswordChangeCard } from '@/components/admin/PasswordChangeCard';
import { ReportsSection } from '@/components/admin/ReportsSection';
import { ActivityLogsSection } from '@/components/admin/ActivityLogsSection';
import { ContactManagementSection } from '@/components/admin/ContactManagementSection';
import { UserManagementSection } from '@/components/admin/UserManagementSection';

export default function AdminDashboard() {
  const { user, profile, loading, signOut, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

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
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {profile.display_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isOwner ? 'default' : 'secondary'} className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {isOwner ? 'Owner' : 'Admin'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                CRM
              </Button>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Display Name</p>
                    <p className="font-medium">{profile.display_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{profile.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant={isOwner ? 'default' : 'secondary'}>
                      {profile.role?.charAt(0).toUpperCase()}{profile.role?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <PasswordChangeCard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagementSection isOwner={isOwner} currentUserId={user.id} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsSection />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogsSection />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactManagementSection isOwner={isOwner} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
