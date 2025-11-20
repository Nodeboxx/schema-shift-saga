import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:profiles!appointments_doctor_id_fkey(full_name, email),
          patient:patients(name),
          clinic:clinics(name)
        `)
        .order('start_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAppointments(data || []);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'in_consultation':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'no_show':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">All Appointments</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(apt.start_time), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(apt.start_time), 'hh:mm a')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{apt.patient?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{apt.doctor?.full_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{apt.doctor?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{apt.clinic?.name || 'Independent'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{apt.type || 'in-person'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(apt.status)}>
                      {apt.status?.replace('_', ' ') || 'scheduled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        (new Date(apt.end_time).getTime() - new Date(apt.start_time).getTime()) / 
                        (1000 * 60)
                      )} min
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>
    </Card>
  );
};