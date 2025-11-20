import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, DollarSign, Users, TrendingUp, Calendar, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyRecurring: 0,
    churnRate: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          clinic:clinics(name),
          user:profiles!subscriptions_user_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: any[]) => {
    const active = ordersData.filter(o => o.status === "active");
    const totalRevenue = ordersData.reduce((sum, o) => sum + (o.amount || 0), 0);
    const monthlyRevenue = active.reduce((sum, o) => sum + (o.amount || 0), 0);
    
    setStats({
      totalRevenue,
      activeSubscriptions: active.length,
      monthlyRecurring: monthlyRevenue,
      churnRate: ordersData.length > 0 ? ((ordersData.length - active.length) / ordersData.length * 100) : 0
    });
  };

  const handleApprove = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order approved successfully"
      });

      loadOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeny = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order denied"
      });

      loadOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      active: "bg-green-500/10 text-green-700 dark:text-green-400",
      cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
      expired: "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || styles.pending}>
        {status}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => 
    order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: `$${stats.totalRevenue}`, icon: DollarSign, gradient: "from-green-500 to-green-600" },
          { title: "Active Subscriptions", value: stats.activeSubscriptions, icon: Users, gradient: "from-blue-500 to-blue-600" },
          { title: "Monthly Recurring", value: `$${stats.monthlyRecurring}`, icon: TrendingUp, gradient: "from-purple-500 to-purple-600" },
          { title: "Churn Rate", value: `${stats.churnRate.toFixed(0)}%`, icon: Calendar, gradient: "from-orange-500 to-orange-600" }
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
          <h3 className="text-2xl font-bold">Subscription Orders</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user?.full_name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">{order.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.clinic?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${order.amount || 0}
                    </TableCell>
                    <TableCell className="capitalize">{order.billing_cycle || "monthly"}</TableCell>
                    <TableCell>{getStatusBadge(order.status || "pending")}</TableCell>
                    <TableCell>
                      {order.start_date ? new Date(order.start_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {order.end_date ? new Date(order.end_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(order.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeny(order.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground text-right">
          Showing {filteredOrders.length} of {orders.length} orders • Total Revenue: ${stats.totalRevenue}
        </div>
      </Card>
    </div>
  );
};
