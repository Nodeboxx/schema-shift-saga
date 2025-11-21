import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";

export const AdminSubscriptionStats = () => {
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    trialUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get all subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("status, amount, billing_cycle");

      // Get trial users
      const { count: trialCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "trial");

      if (subscriptions) {
        const active = subscriptions.filter(s => s.status === "active");
        const monthlyRev = active.reduce((sum, s) => {
          // Convert yearly to monthly
          const monthly = s.billing_cycle === "yearly" ? s.amount / 12 : s.amount;
          return sum + monthly;
        }, 0);

        setStats({
          totalSubscriptions: subscriptions.length,
          activeSubscriptions: active.length,
          monthlyRevenue: Math.round(monthlyRev),
          trialUsers: trialCount || 0,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">Currently active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳{stats.monthlyRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">MRR</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.trialUsers}</div>
          <p className="text-xs text-muted-foreground">On free trial</p>
        </CardContent>
      </Card>
    </div>
  );
};
