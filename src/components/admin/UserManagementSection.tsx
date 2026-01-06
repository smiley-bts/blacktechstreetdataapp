import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Shield,
  Crown,
  RefreshCw,
  Mail,
  KeyRound,
  Ban,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: 'admin' | 'owner';
  created_at: string;
  disabled?: boolean;
}

interface UserManagementSectionProps {
  isOwner: boolean;
  currentUserId: string;
}

export function UserManagementSection({ isOwner, currentUserId }: UserManagementSectionProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset password dialog
  const [resetPasswordDialog, setResetPasswordDialog] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Disable account dialog
  const [disableDialog, setDisableDialog] = useState<AdminUser | null>(null);

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

      // If owner, fetch disabled status for each user
      if (isOwner) {
        for (const user of combinedUsers) {
          if (user.role !== 'owner') {
            try {
              const { data } = await supabase.functions.invoke('manage-admin', {
                body: { action: 'get_status', targetUserId: user.id },
              });
              if (data?.success) {
                user.disabled = data.banned;
              }
            } catch (e) {
              // Ignore errors for status check
            }
          }
        }
      }

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

  const handleResetPassword = async () => {
    if (!resetPasswordDialog || !newPassword) return;
    if (newPassword.length < 8) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(resetPasswordDialog.id);
    try {
      const { data, error } = await supabase.functions.invoke('manage-admin', {
        body: {
          action: 'reset_password',
          targetUserId: resetPasswordDialog.id,
          newPassword,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Password Reset',
        description: `Password for ${resetPasswordDialog.display_name} has been reset successfully`,
      });
      setResetPasswordDialog(null);
      setNewPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAccount = async (user: AdminUser, disable: boolean) => {
    setActionLoading(user.id);
    try {
      const { data, error } = await supabase.functions.invoke('manage-admin', {
        body: {
          action: disable ? 'disable_account' : 'enable_account',
          targetUserId: user.id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: disable ? 'Account Disabled' : 'Account Enabled',
        description: `${user.display_name}'s account has been ${disable ? 'disabled' : 'enabled'}`,
      });
      setDisableDialog(null);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error toggling account:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update account',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin Users
              </CardTitle>
              <CardDescription>
                {isOwner 
                  ? 'Manage admin users - reset passwords and disable accounts' 
                  : 'View admin team members'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="border-border/60"
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
                        ? 'bg-primary/5 border-primary/30' 
                        : user.disabled
                        ? 'bg-destructive/5 border-destructive/30'
                        : 'bg-muted/30 border-border/60 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`p-2 rounded-full ${
                        user.role === 'owner' ? 'bg-amber-500/10' : user.disabled ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        {user.role === 'owner' ? (
                          <Crown className="h-5 w-5 text-amber-500" />
                        ) : user.disabled ? (
                          <Ban className="h-5 w-5 text-destructive" />
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
                            <Badge variant="outline" className="text-xs border-border/60">You</Badge>
                          )}
                          {user.disabled && (
                            <Badge variant="destructive" className="text-xs">Disabled</Badge>
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
                    <div className="flex items-center gap-2">
                      {isOwner && user.role !== 'owner' && user.id !== currentUserId && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResetPasswordDialog(user)}
                            disabled={actionLoading === user.id}
                            className="border-border/60"
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <KeyRound className="h-4 w-4" />
                            )}
                            <span className="sr-only md:not-sr-only md:ml-2">Reset</span>
                          </Button>
                          <Button
                            variant={user.disabled ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => user.disabled ? handleToggleAccount(user, false) : setDisableDialog(user)}
                            disabled={actionLoading === user.id}
                            className={user.disabled ? "border-border/60" : ""}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.disabled ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                            <span className="sr-only md:not-sr-only md:ml-2">
                              {user.disabled ? 'Enable' : 'Disable'}
                            </span>
                          </Button>
                        </>
                      )}
                      <Badge 
                        variant={user.role === 'owner' ? 'default' : 'secondary'}
                        className={user.role === 'owner' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                      >
                        {user.role === 'owner' ? 'Owner' : 'Admin'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/60">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Admin users are created through the setup process. 
              {isOwner ? ' You can reset passwords and disable accounts for admins.' : ' Contact the system owner to manage accounts.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordDialog} onOpenChange={(open) => !open && setResetPasswordDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for {resetPasswordDialog?.display_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {newPassword && newPassword.length < 8 && (
              <p className="text-xs text-destructive">Password must be at least 8 characters</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={!newPassword || newPassword.length < 8 || actionLoading === resetPasswordDialog?.id}
            >
              {actionLoading === resetPasswordDialog?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Account Confirmation */}
      <AlertDialog open={!!disableDialog} onOpenChange={(open) => !open && setDisableDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Disable Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable {disableDialog?.display_name}'s account? 
              They will no longer be able to log in until re-enabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disableDialog && handleToggleAccount(disableDialog, true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disable Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
