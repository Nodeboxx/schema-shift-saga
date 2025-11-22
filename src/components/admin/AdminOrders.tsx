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
        .from("orders")
        .select(`
          *,
          profiles!inner(full_name, email)
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
    const approved = ordersData.filter(o => o.status === "approved");
    const pending = ordersData.filter(o => o.status === "pending");
    const totalRevenue = approved.reduce((sum, o) => sum + (o.amount || 0), 0);
    
    setStats({
      totalRevenue,
      activeSubscriptions: approved.length,
      monthlyRecurring: totalRevenue,
      churnRate: ordersData.length > 0 ? (pending.length / ordersData.length * 100) : 0
    });
  };

  const mapPlanIdToTier = (planId: string): 'free' | 'pro' | 'enterprise' => {
    // Map custom plan names to valid subscription tier enum values
    const lowerPlanId = planId.toLowerCase();
    
    if (lowerPlanId.includes('free') || lowerPlanId.includes('basic')) {
      return 'free';
    } else if (lowerPlanId.includes('enterprise') || lowerPlanId.includes('lifetime')) {
      return 'enterprise';
    } else {
      // Default to pro for any paid plans
      return 'pro';
    }
  };

  const handleApprove = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const isLifetime = order.plan_id === 'lifetime' || order.plan_name?.toLowerCase().includes('lifetime');
      const endDate = new Date();
      
      if (isLifetime) {
        endDate.setFullYear(endDate.getFullYear() + 100);
      } else {
        endDate.setMonth(endDate.getMonth() + (order.billing_cycle === 'yearly' ? 12 : 1));
      }

      // Map the plan_id to a valid subscription tier
      const subscriptionTier = mapPlanIdToTier(order.plan_id);

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      const { error: subError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: order.user_id,
          order_id: orderId,
          tier: subscriptionTier,
          status: "active",
          amount: order.amount,
          billing_cycle: order.billing_cycle,
          payment_method: order.payment_method,
          is_lifetime: isLifetime,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        });

      if (subError) throw subError;

      await supabase
        .from("profiles")
        .update({
          subscription_tier: subscriptionTier,
          subscription_status: "active",
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: endDate.toISOString(),
        })
        .eq("id", order.user_id);

      toast({
        title: "Success",
        description: "Order approved and subscription activated"
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("orders")
        .update({ 
          status: "rejected",
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order rejected"
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
    order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3">
          <h3 className="text-xl md:text-2xl font-bold">Subscription Orders</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
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
                        <div className="font-medium">{order.profiles?.full_name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">{order.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.plan_name}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">{order.billing_cycle}</div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {order.currency}{order.amount || 0}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{order.payment_method}</div>
                        {order.payment_reference && (
                          <div className="text-xs text-muted-foreground font-mono">{order.payment_reference}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status || "pending")}</TableCell>
                    <TableCell>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
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
