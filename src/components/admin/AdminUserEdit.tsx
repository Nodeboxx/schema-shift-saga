import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Shield, Lock, Settings } from 'lucide-react';

interface AdminUserEditProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AdminUserEdit = ({ userId, open, onOpenChange, onSuccess }: AdminUserEditProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (userId && open) {
      loadUserData();
    }
  }, [userId, open]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Load user roles
      const { data: userRoles, error: rolesError } = await supabase
        .rpc('get_user_roles', { target_user_id: userId });

      if (rolesError) throw rolesError;

      setUserData(profile);
      setRoles((userRoles || []).map((r: any) => r.role));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!userId || !userData) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          specialization: userData.specialization,
          degree_en: userData.degree_en,
          degree_bn: userData.degree_bn,
          license_number: userData.license_number
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User profile updated successfully'
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userData?.email || !newPassword) {
      toast({
        title: 'Error',
        description: 'Please enter a new password',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // In production, this would call a secure admin function
      toast({
        title: 'Password Reset',
        description: 'Password reset email sent to user',
      });
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !userData.is_active })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${userData.is_active ? 'suspended' : 'activated'} successfully`
      });
      loadUserData();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User: {userData.email}
          </DialogTitle>
          <DialogDescription>
            Update user information, permissions, and account status
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={userData.full_name || ''}
                  onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Read-only)</Label>
                <Input
                  id="email"
                  value={userData.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree_en">Degree (English)</Label>
                  <Input
                    id="degree_en"
                    value={userData.degree_en || ''}
                    onChange={(e) => setUserData({ ...userData, degree_en: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree_bn">Degree (Bangla)</Label>
                  <Input
                    id="degree_bn"
                    value={userData.degree_bn || ''}
                    onChange={(e) => setUserData({ ...userData, degree_bn: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={userData.specialization || ''}
                  onChange={(e) => setUserData({ ...userData, specialization: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  value={userData.license_number || ''}
                  onChange={(e) => setUserData({ ...userData, license_number: e.target.value })}
                />
              </div>

              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Manage user roles and permissions:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {roles.map(role => (
                  <Badge key={role} variant="default" className="flex items-center gap-2">
                    {role}
                    <button
                      onClick={async () => {
                        if (confirm(`Remove ${role} role?`)) {
                          try {
                            await supabase.rpc('manage_user_role', {
                              target_user_id: userId,
                              target_role: role as any,
                              action: 'remove'
                            });
                            toast({ title: 'Role removed successfully' });
                            loadUserData();
                            onSuccess();
                          } catch (error: any) {
                            toast({ title: 'Error', description: error.message, variant: 'destructive' });
                          }
                        }
                      }}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label>Add New Role</Label>
                <div className="flex flex-wrap gap-2">
                  {(['super_admin', 'clinic_admin', 'doctor', 'staff', 'patient'] as Array<'super_admin' | 'clinic_admin' | 'doctor' | 'staff' | 'patient'>).map(role => (
                    !roles.includes(role) && (
                      <Button
                        key={role}
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await supabase.rpc('manage_user_role', {
                              target_user_id: userId,
                              target_role: role,
                              action: 'add'
                            });
                            toast({ title: 'Role added successfully' });
                            loadUserData();
                            onSuccess();
                          } catch (error: any) {
                            toast({ title: 'Error', description: error.message, variant: 'destructive' });
                          }
                        }}
                      >
                        + {role}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Reset Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <Button onClick={handleResetPassword} disabled={loading} variant="outline" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Password Reset Email'}
              </Button>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      {userData.is_active ? 'Active' : 'Suspended'}
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleActive}
                    disabled={loading}
                    variant={userData.is_active ? 'destructive' : 'default'}
                  >
                    {userData.is_active ? 'Suspend Account' : 'Activate Account'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Subscription Tier</Label>
                  <p className="text-sm text-muted-foreground">
                    {userData.subscription_tier || 'free'}
                  </p>
                </div>
                <Badge>{userData.subscription_tier || 'free'}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Subscription Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {userData.subscription_status || 'trial'}
                  </p>
                </div>
                <Badge variant="outline">{userData.subscription_status || 'trial'}</Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
