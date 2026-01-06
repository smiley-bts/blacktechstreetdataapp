import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Shield,
  Crown,
  RefreshCw,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: 'admin' | 'owner';
  created_at: string;
}

interface UserManagementSectionProps {
  isOwner: boolean;
  currentUserId: string;
}

export function UserManagementSection({ isOwner, currentUserId }: UserManagementSectionProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine data
      const combinedUsers: AdminUser[] = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          email: profile.email,
          role: userRole?.role || 'admin',
          created_at: profile.created_at,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin Users
            </CardTitle>
            <CardDescription>
              {isOwner 
                ? 'Manage admin users and their roles' 
                : 'View admin team members'}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No admin users found</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    user.id === currentUserId 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`p-2 rounded-full ${
                      user.role === 'owner' ? 'bg-amber-500/10' : 'bg-primary/10'
                    }`}>
                      {user.role === 'owner' ? (
                        <Crown className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Shield className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {user.display_name}
                        </span>
                        {user.id === currentUserId && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">@{user.username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={user.role === 'owner' ? 'default' : 'secondary'}
                    className={user.role === 'owner' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                  >
                    {user.role === 'owner' ? 'Owner' : 'Admin'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Admin users are created through the setup process. 
            Contact the system owner to add new administrators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
