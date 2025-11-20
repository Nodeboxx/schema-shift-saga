import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('role_audit')
        .select(`
          *,
          user:user_id(email, full_name),
          performer:performed_by(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
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

  if (loading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Performed By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
              </TableCell>
              <TableCell className="font-medium">{log.action}</TableCell>
              <TableCell>
                {(log.user as any)?.email || 'N/A'}
              </TableCell>
              <TableCell>{log.role || 'N/A'}</TableCell>
              <TableCell>
                {(log.performer as any)?.email || 'System'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {logs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found
        </div>
      )}
    </Card>
  );
};
