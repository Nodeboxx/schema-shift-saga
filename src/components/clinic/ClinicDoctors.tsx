import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, UserPlus } from "lucide-react";
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
  const [newDoctor, setNewDoctor] = useState({
    email: "",
    fullName: "",
    specialty: "",
    licenseNumber: "",
    password: "",
  });

  useEffect(() => {
    loadDoctors();
  }, [clinicId]);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("role", "doctor");

      if (error) throw error;
      setDoctors(data || []);
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
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newDoctor.email,
        password: newDoctor.password,
        options: {
          data: {
            full_name: newDoctor.fullName,
            specialty: newDoctor.specialty,
            license_number: newDoctor.licenseNumber,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with clinic_id
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ clinic_id: clinicId })
          .eq("id", authData.user.id);

        if (profileError) throw profileError;
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

  if (loading) {
    return <Card className="p-6"><div>Loading doctors...</div></Card>;
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Doctors</h3>
            <p className="text-sm text-muted-foreground">Manage doctor accounts</p>
          </div>
          <Button onClick={() => setAddDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDoctor(doctor.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
    </>
  );
};

export default ClinicDoctors;
