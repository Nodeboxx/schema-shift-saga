import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, UserPlus, Edit, Key, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ClinicDoctorsProps {
  clinicId: string;
}

const ClinicDoctors = ({ clinicId }: ClinicDoctorsProps) => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [maxDoctors, setMaxDoctors] = useState(50);
  const [currentCount, setCurrentCount] = useState(0);
  const [newDoctor, setNewDoctor] = useState({
    email: "",
    fullName: "",
    specialty: "",
    licenseNumber: "",
    password: "",
    phone: "",
    address: "",
  });
  const [editDoctor, setEditDoctor] = useState({
    fullName: "",
    specialty: "",
    licenseNumber: "",
    phone: "",
    address: "",
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadClinicInfo();
    loadDoctors();
  }, [clinicId]);

  const loadClinicInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("clinics")
        .select("max_doctors")
        .eq("id", clinicId)
        .single();

      if (error) throw error;
      setMaxDoctors(data?.max_doctors || 50);
    } catch (error: any) {
      console.error("Error loading clinic info:", error);
    }
  };

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("role", "doctor")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
      setCurrentCount(data?.filter(d => d.is_active).length || 0);
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

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check doctor limit
    if (currentCount >= maxDoctors) {
      toast({
        title: "Doctor Limit Reached",
        description: `Your plan allows maximum ${maxDoctors} doctors. Please upgrade your plan or deactivate existing doctors.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newDoctor.email,
        password: newDoctor.password,
        options: {
          data: {
            full_name: newDoctor.fullName,
            user_type: "doctor",
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with clinic_id and additional details
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            clinic_id: clinicId,
            specialization: newDoctor.specialty,
            license_number: newDoctor.licenseNumber,
            phone: newDoctor.phone,
            address: newDoctor.address,
            role: "doctor",
          })
          .eq("id", authData.user.id);

        if (profileError) throw profileError;

        // Assign doctor role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: "doctor" });

        if (roleError) console.error("Role assignment error:", roleError);
      }

      toast({
        title: "Success",
        description: "Doctor account created successfully",
      });

      setAddDialog(false);
      setNewDoctor({
        email: "",
        fullName: "",
        specialty: "",
        licenseNumber: "",
        password: "",
        phone: "",
        address: "",
      });
      loadDoctors();
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

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm("Are you sure you want to remove this doctor from the clinic?")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ clinic_id: null, is_active: false })
        .eq("id", doctorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Doctor removed from clinic",
      });

      loadDoctors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editDoctor.fullName,
          specialization: editDoctor.specialty,
          license_number: editDoctor.licenseNumber,
          phone: editDoctor.phone,
          address: editDoctor.address,
        })
        .eq("id", selectedDoctor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Doctor information updated successfully",
      });

      setEditDialog(false);
      setSelectedDoctor(null);
      loadDoctors();
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('reset-doctor-password', {
        body: {
          doctorId: selectedDoctor.id,
          newPassword: newPassword,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Password reset for ${data.doctorEmail}`,
      });

      setResetPasswordDialog(false);
      setSelectedDoctor(null);
      setNewPassword("");
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

  const openEditDialog = (doctor: any) => {
    setSelectedDoctor(doctor);
    setEditDoctor({
      fullName: doctor.full_name || "",
      specialty: doctor.specialization || "",
      licenseNumber: doctor.license_number || "",
      phone: doctor.phone || "",
      address: doctor.address || "",
    });
    setEditDialog(true);
  };

  const openResetPasswordDialog = (doctor: any) => {
    setSelectedDoctor(doctor);
    setNewPassword("");
    setResetPasswordDialog(true);
  };

  if (loading) {
    return <Card className="p-6"><div>Loading doctors...</div></Card>;
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold">Doctors Management</h3>
            <p className="text-sm text-muted-foreground">
              {currentCount} / {maxDoctors} doctors active
            </p>
          </div>
          <Button 
            onClick={() => setAddDialog(true)}
            disabled={currentCount >= maxDoctors}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>

        {currentCount >= maxDoctors && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached the maximum limit of {maxDoctors} doctors for your plan. 
              Please upgrade your plan or deactivate existing doctors to add more.
            </AlertDescription>
          </Alert>
        )}

        {doctors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No doctors added yet. Click "Add Doctor" to create accounts.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.full_name}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.specialization || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={doctor.is_active ? "default" : "secondary"}>
                      {doctor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(doctor)}
                        title="Edit doctor"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResetPasswordDialog(doctor)}
                        title="Reset password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        title="Remove doctor"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Create a new doctor account for your clinic
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={newDoctor.fullName}
                onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={newDoctor.specialty}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={newDoctor.licenseNumber}
                onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newDoctor.address}
                  onChange={(e) => setNewDoctor({ ...newDoctor, address: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditDoctor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                value={editDoctor.fullName}
                onChange={(e) => setEditDoctor({ ...editDoctor, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-specialty">Specialty</Label>
              <Input
                id="edit-specialty"
                value={editDoctor.specialty}
                onChange={(e) => setEditDoctor({ ...editDoctor, specialty: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-license">License Number</Label>
              <Input
                id="edit-license"
                value={editDoctor.licenseNumber}
                onChange={(e) => setEditDoctor({ ...editDoctor, licenseNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editDoctor.phone}
                onChange={(e) => setEditDoctor({ ...editDoctor, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={editDoctor.address}
                onChange={(e) => setEditDoctor({ ...editDoctor, address: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Doctor Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedDoctor?.full_name || selectedDoctor?.email}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will immediately change the doctor's password. Make sure to communicate the new password securely.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClinicDoctors;
