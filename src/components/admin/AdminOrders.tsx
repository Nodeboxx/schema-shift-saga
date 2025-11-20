import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const AdminOrders = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyRecurring: 0,
    churnRate: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user:profiles!subscriptions_user_id_fkey(full_name, email),
          clinic:clinics(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      
      // Calculate stats
      const totalRevenue = (data || []).reduce((sum, sub) => sum + (sub.amount || 0), 0);
      const activeCount = (data || []).filter(sub => sub.status === 'active').length;
      const monthlyRevenue = (data || [])
        .filter(sub => sub.status === 'active' && sub.billing_cycle === 'monthly')
        .reduce((sum, sub) => sum + (sub.amount || 0), 0);

      setStats({
        totalRevenue,
        activeSubscriptions: activeCount,
        monthlyRecurring: monthlyRevenue,
        churnRate: 0 // Calculate based on cancellations
      });
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
      case 'active':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-500';
      case 'pro':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            gradient: 'from-green-500 to-green-600'
          },
          {
            title: 'Active Subscriptions',
            value: stats.activeSubscriptions,
            icon: User,
            gradient: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Monthly Recurring',
            value: `$${stats.monthlyRecurring.toLocaleString()}`,
            icon: TrendingUp,
            gradient: 'from-purple-500 to-purple-600'
          },
          {
            title: 'Churn Rate',
            value: `${stats.churnRate}%`,
            icon: Calendar,
            gradient: 'from-orange-500 to-orange-600'
          }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${stat.gradient}`} />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Subscription Orders</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">
                      {sub.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sub.user?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{sub.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.clinic?.name || 'Individual'}</TableCell>
                    <TableCell>
                      <Badge className={getTierColor(sub.tier)}>
                        {sub.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${sub.amount || 0} {sub.currency || 'USD'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sub.billing_cycle || 'monthly'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sub.status)}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.start_date ? format(new Date(sub.start_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {sub.end_date ? format(new Date(sub.end_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {filteredSubscriptions.length} of {subscriptions.length} orders
          </div>
          <div>
            Total Revenue: ${stats.totalRevenue.toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  );
};
