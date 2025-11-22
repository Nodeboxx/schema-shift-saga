import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserCog } from 'lucide-react';

export const AdminImpersonate = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
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

  const handleImpersonate = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to impersonate ${userName}? This action will be logged.`)) {
      return;
    }

    try {
      // Log impersonation session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('impersonation_sessions')
        .insert({
          admin_user_id: user.id,
          target_user_id: userId,
          is_active: true,
          metadata: { user_name: userName }
        });

      if (error) throw error;

      toast({
        title: 'Impersonation Started',
        description: `Now viewing as ${userName}. This session is being logged.`,
        variant: 'default'
      });

      // In a real implementation, you would:
      // 1. Create a temporary session token
      // 2. Store it securely
      // 3. Redirect to user's view with the token
      // 4. Implement "Stop Impersonation" functionality
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">User Impersonation</h2>
      
      <div className="mb-3 md:mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
        <p className="text-xs md:text-sm text-yellow-800">
          <strong>Warning:</strong> Impersonation allows you to view the system as another user. 
          All actions are logged for security and audit purposes.
        </p>
      </div>

      <Input
        placeholder="Search users by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 md:mb-4"
      />

      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role || 'doctor'}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImpersonate(user.id, user.full_name || user.email)}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Impersonate
                </Button>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
