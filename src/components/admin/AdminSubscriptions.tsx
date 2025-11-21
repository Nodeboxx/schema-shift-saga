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

interface ProfileSubscription {
  id: string;
  full_name: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

export const AdminSubscriptions = () => {
  const [profiles, setProfiles] = useState<ProfileSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProfile, setEditingProfile] = useState<ProfileSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, subscription_tier, subscription_status, subscription_start_date, subscription_end_date, trial_started_at, trial_ends_at, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
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

  const getRemainingDays = (profile: ProfileSubscription) => {
    const endDate = profile.subscription_status === "trial" 
      ? profile.trial_ends_at 
      : profile.subscription_end_date;

    if (!endDate) return 0;

    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleUpdateSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProfile) return;

    const formData = new FormData(e.currentTarget);
    const tier = formData.get("tier") as string;
    const status = formData.get("status") as string;
    const startDate = formData.get("start_date") as string;
    const endDate = formData.get("end_date") as string;

    try {
      const updates: any = {
        subscription_tier: tier,
        subscription_status: status,
      };

      if (startDate) {
        updates.subscription_start_date = startDate;
      }

      if (endDate) {
        updates.subscription_end_date = endDate;
      }

      // If setting to trial, set trial dates
      if (status === "trial") {
        updates.trial_started_at = new Date().toISOString();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        updates.trial_ends_at = trialEnd.toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", editingProfile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      setEditingProfile(null);
      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.subscription_tier?.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => {
                    const remainingDays = getRemainingDays(profile);
                    return (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{profile.full_name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {profile.subscription_tier || "free"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(profile.subscription_status || "inactive")}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {profile.subscription_start_date 
                              ? new Date(profile.subscription_start_date).toLocaleDateString()
                              : profile.trial_started_at
                              ? new Date(profile.trial_started_at).toLocaleDateString()
                              : "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {(profile.subscription_end_date || profile.trial_ends_at)
                              ? new Date(profile.subscription_end_date || profile.trial_ends_at!).toLocaleDateString()
                              : "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={remainingDays > 7 ? "default" : remainingDays > 3 ? "secondary" : "destructive"}
                          >
                            {remainingDays > 0 ? `${remainingDays} days` : "Expired"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingProfile(profile)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Subscription - {editingProfile?.full_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubscription} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tier</Label>
                <Select name="tier" defaultValue={editingProfile?.subscription_tier || "free"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={editingProfile?.subscription_status || "inactive"}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  name="start_date"
                  defaultValue={editingProfile?.subscription_start_date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  name="end_date"
                  defaultValue={editingProfile?.subscription_end_date?.split('T')[0] || editingProfile?.trial_ends_at?.split('T')[0]}
                />
              </div>
            </div>

            {/* Quick extend actions */}
            <div className="space-y-2">
              <Label>Quick Extend</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (endDateInput) {
                      const currentDate = new Date(endDateInput.value || new Date());
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
                    if (endDateInput) {
                      const currentDate = new Date(endDateInput.value || new Date());
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
                    if (endDateInput) {
                      const currentDate = new Date(endDateInput.value || new Date());
                      currentDate.setMonth(currentDate.getMonth() + 6);
                      endDateInput.value = currentDate.toISOString().split('T')[0];
                    }
                  }}
                >
                  +6 Months
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (endDateInput) {
                      const currentDate = new Date(endDateInput.value || new Date());
                      currentDate.setFullYear(currentDate.getFullYear() + 1);
                      endDateInput.value = currentDate.toISOString().split('T')[0];
                    }
                  }}
                >
                  +1 Year
                </Button>
              </div>
            </div>

            {/* Quick action presets */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <Label className="text-sm font-medium">Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const tierSelect = document.querySelector('select[name="tier"]') as HTMLSelectElement;
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (tierSelect && statusSelect && endDateInput) {
                      tierSelect.value = 'free';
                      statusSelect.value = 'trial';
                      const trialEnd = new Date();
                      trialEnd.setDate(trialEnd.getDate() + 14);
                      endDateInput.value = trialEnd.toISOString().split('T')[0];
                    }
                  }}
                >
                  Start 14-Day Trial
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const tierSelect = document.querySelector('select[name="tier"]') as HTMLSelectElement;
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    if (tierSelect && statusSelect) {
                      tierSelect.value = 'pro';
                      statusSelect.value = 'active';
                    }
                  }}
                >
                  Activate Pro
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    if (statusSelect) {
                      statusSelect.value = 'cancelled';
                    }
                  }}
                >
                  Cancel Subscription
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    if (statusSelect) {
                      statusSelect.value = 'inactive';
                    }
                  }}
                >
                  Deactivate
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const tierSelect = document.querySelector('select[name="tier"]') as HTMLSelectElement;
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (tierSelect && statusSelect && endDateInput) {
                      tierSelect.value = 'enterprise';
                      statusSelect.value = 'active';
                      const lifetimeEnd = new Date();
                      lifetimeEnd.setFullYear(lifetimeEnd.getFullYear() + 10);
                      endDateInput.value = lifetimeEnd.toISOString().split('T')[0];
                    }
                  }}
                >
                  Activate Enterprise
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const tierSelect = document.querySelector('select[name="tier"]') as HTMLSelectElement;
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    if (tierSelect && statusSelect) {
                      tierSelect.value = 'free';
                      statusSelect.value = 'inactive';
                    }
                  }}
                >
                  Set to Free
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setEditingProfile(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
