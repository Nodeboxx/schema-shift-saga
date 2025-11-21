import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Check, X, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminSubscriptionStats } from "./AdminSubscriptionStats";

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  amount: number;
  billing_cycle: string;
  payment_method: string;
  payment_reference: string;
  created_at: string;
  start_date: string;
  end_date: string;
  user: {
    full_name: string;
    email: string;
  };
}

export const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          user:profiles!subscriptions_user_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (subscriptionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = subscriptions.find(s => s.id === subscriptionId);
      if (!subscription) return;

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (subscription.billing_cycle === "yearly" ? 12 : 1));

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      // Update user profile
      await supabase
        .from("profiles")
        .update({
          subscription_tier: subscription.tier as any,
          subscription_status: "active",
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: endDate.toISOString(),
        })
        .eq("id", subscription.user_id);

      // Send notification
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-subscription-notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'subscription_approved',
            subscriptionId,
            userId: subscription.user_id,
          }),
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      toast({
        title: "Success",
        description: "Subscription approved successfully",
      });

      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (subscriptionId: string) => {
    try {
      const subscription = subscriptions.find(s => s.id === subscriptionId);

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subscriptionId);

      if (error) throw error;

      // Send notification
      if (subscription) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-subscription-notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'subscription_rejected',
              subscriptionId,
              userId: subscription.user_id,
            }),
          });
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }

      toast({
        title: "Success",
        description: "Subscription rejected",
      });

      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSubscription) return;

    const formData = new FormData(e.currentTarget);
    const tier = formData.get("tier") as string;
    const status = formData.get("status") as string;
    const endDate = formData.get("end_date") as string;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tier as any,
          subscription_status: status,
          subscription_end_date: endDate,
        })
        .eq("id", editingSubscription.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      setEditingSubscription(null);
      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      pending: "secondary",
      cancelled: "destructive",
      trial: "secondary",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <>
      <AdminSubscriptionStats />
      
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{sub.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.tier}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{sub.payment_method || "N/A"}</p>
                        {sub.payment_reference && (
                          <p className="text-xs text-muted-foreground">{sub.payment_reference}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>৳{sub.amount}</TableCell>
                    <TableCell>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingSubscription(sub)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {sub.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(sub.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(sub.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubscription} className="space-y-4">
            <div>
              <Label>Tier</Label>
              <Select name="tier" defaultValue={editingSubscription?.tier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue={editingSubscription?.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                name="end_date"
                defaultValue={editingSubscription?.end_date?.split('T')[0]}
              />
            </div>

            {/* Quick actions for extending subscription */}
            <div className="space-y-2">
              <Label>Quick Extend Options</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (endDateInput && editingSubscription?.end_date) {
                      const currentDate = new Date(editingSubscription.end_date);
                      currentDate.setMonth(currentDate.getMonth() + 1);
                      endDateInput.value = currentDate.toISOString().split('T')[0];
                    }
                  }}
                >
                  +1 Month
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (endDateInput && editingSubscription?.end_date) {
                      const currentDate = new Date(editingSubscription.end_date);
                      currentDate.setMonth(currentDate.getMonth() + 3);
                      endDateInput.value = currentDate.toISOString().split('T')[0];
                    }
                  }}
                >
                  +3 Months
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (endDateInput && editingSubscription?.end_date) {
                      const currentDate = new Date(editingSubscription.end_date);
                      currentDate.setFullYear(currentDate.getFullYear() + 1);
                      endDateInput.value = currentDate.toISOString().split('T')[0];
                    }
                  }}
                >
                  +1 Year
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setEditingSubscription(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
