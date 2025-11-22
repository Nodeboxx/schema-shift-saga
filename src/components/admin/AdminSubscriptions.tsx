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
  role?: string;
}

interface ClinicSubscription {
  id: string;
  name: string;
  email: string | null;
  subscription_tier: string;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  owner_email?: string;
  billing_cycle?: string;
}

export const AdminSubscriptions = () => {
  const [profiles, setProfiles] = useState<ProfileSubscription[]>([]);
  const [clinics, setClinics] = useState<ClinicSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"doctors" | "clinics">("doctors");
  const [editingProfile, setEditingProfile] = useState<ProfileSubscription | null>(null);
  const [editingClinic, setEditingClinic] = useState<ClinicSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [viewMode]);

  const loadData = async () => {
    if (viewMode === "doctors") {
      loadProfiles();
    } else {
      loadClinics();
    }
  };

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, subscription_tier, subscription_status, subscription_start_date, subscription_end_date, trial_started_at, trial_ends_at, created_at, role")
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

  const loadClinics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clinics")
        .select(`
          id, 
          name, 
          email, 
          subscription_tier, 
          subscription_status, 
          subscription_start_date, 
          subscription_end_date, 
          billing_cycle,
          created_at,
          owner:owner_id(email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const clinicsWithOwner = (data || []).map((clinic: any) => ({
        ...clinic,
        owner_email: clinic.owner?.email || "N/A"
      }));
      
      setClinics(clinicsWithOwner);
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

  const handleUpdateClinicSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClinic) return;

    const formData = new FormData(e.currentTarget);
    const billing_cycle = formData.get("billing_cycle") as string;
    const status = formData.get("status") as string;
    const startDate = formData.get("start_date") as string;
    const endDate = formData.get("end_date") as string;

    try {
      const updates: any = {
        subscription_tier: 'enterprise', // Always enterprise for clinics
        subscription_status: status,
        billing_cycle: billing_cycle,
      };

      if (startDate) {
        updates.subscription_start_date = startDate;
      }

      if (endDate) {
        updates.subscription_end_date = endDate;
      }

      const { error } = await supabase
        .from("clinics")
        .update(updates)
        .eq("id", editingClinic.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Clinic subscription updated successfully",
      });

      setEditingClinic(null);
      loadClinics();
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

      // If this is a clinic_admin, also update their clinic
      if (editingProfile.role === 'clinic_admin') {
        const clinicUpdates: any = {
          subscription_tier: tier,
          subscription_status: status,
        };

        if (startDate) {
          clinicUpdates.subscription_start_date = startDate;
        }

        if (endDate) {
          clinicUpdates.subscription_end_date = endDate;
        }

        const { error: clinicError } = await supabase
          .from("clinics")
          .update(clinicUpdates)
          .eq("owner_id", editingProfile.id);

        if (clinicError) {
          console.error("Error updating clinic:", clinicError);
          toast({
            title: "Warning",
            description: "Profile updated but clinic sync failed. Please update clinic subscription separately.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      setEditingProfile(null);
      loadData();
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

  const filteredClinics = clinics.filter(clinic =>
    clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.owner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.subscription_tier?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "doctors" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("doctors")}
              >
                Doctors
              </Button>
              <Button
                variant={viewMode === "clinics" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("clinics")}
              >
                Clinics
              </Button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : viewMode === "doctors" ? (
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
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClinics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No clinics found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{clinic.name}</p>
                          <p className="text-sm text-muted-foreground">{clinic.email || "N/A"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{clinic.owner_email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {clinic.subscription_tier || "free"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(clinic.subscription_status || "inactive")}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {clinic.subscription_start_date 
                            ? new Date(clinic.subscription_start_date).toLocaleDateString()
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {clinic.subscription_end_date
                            ? new Date(clinic.subscription_end_date).toLocaleDateString()
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingClinic(clinic)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
                      // Set end date to 1 month from now
                      const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                      if (endDateInput) {
                        const proEnd = new Date();
                        proEnd.setMonth(proEnd.getMonth() + 1);
                        endDateInput.value = proEnd.toISOString().split('T')[0];
                      }
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
                    if (tierSelect && statusSelect) {
                      tierSelect.value = 'enterprise';
                      statusSelect.value = 'active';
                      // Set end date to 1 month from now
                      const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                      if (endDateInput) {
                        const enterpriseEnd = new Date();
                        enterpriseEnd.setMonth(enterpriseEnd.getMonth() + 1);
                        endDateInput.value = enterpriseEnd.toISOString().split('T')[0];
                      }
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

      <Dialog open={!!editingClinic} onOpenChange={() => setEditingClinic(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Subscription - {editingClinic?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateClinicSubscription} className="space-y-4">
            {/* Fixed Enterprise Tier Display */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Subscription Plan</Label>
                  <div className="text-2xl font-bold text-primary mt-1">Enterprise</div>
                  <p className="text-xs text-muted-foreground mt-1">Up to 50 doctors • Full features</p>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">Enterprise</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Billing Cycle</Label>
                <Select name="billing_cycle" defaultValue={editingClinic?.billing_cycle || "monthly"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={editingClinic?.subscription_status || "pending_approval"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
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
                  defaultValue={editingClinic?.subscription_start_date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  name="end_date"
                  defaultValue={editingClinic?.subscription_end_date?.split('T')[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Extend</Label>
              <div className="grid grid-cols-2 gap-2">
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
                      currentDate.setFullYear(currentDate.getFullYear() + 1);
                      endDateInput.value = currentDate.toISOString().split('T')[0];
                    }
                  }}
                >
                  +1 Year
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <Label className="text-sm font-medium">Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const cycleSelect = document.querySelector('select[name="billing_cycle"]') as HTMLSelectElement;
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (cycleSelect && statusSelect && endDateInput) {
                      cycleSelect.value = 'monthly';
                      statusSelect.value = 'active';
                      const monthlyEnd = new Date();
                      monthlyEnd.setMonth(monthlyEnd.getMonth() + 1);
                      endDateInput.value = monthlyEnd.toISOString().split('T')[0];
                    }
                  }}
                >
                  Activate Monthly
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const cycleSelect = document.querySelector('select[name="billing_cycle"]') as HTMLSelectElement;
                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                    if (cycleSelect && statusSelect && endDateInput) {
                      cycleSelect.value = 'yearly';
                      statusSelect.value = 'active';
                      const yearlyEnd = new Date();
                      yearlyEnd.setFullYear(yearlyEnd.getFullYear() + 1);
                      endDateInput.value = yearlyEnd.toISOString().split('T')[0];
                    }
                  }}
                >
                  Activate Yearly
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
                      statusSelect.value = 'pending_approval';
                    }
                  }}
                >
                  Pending Approval
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingClinic(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
