import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PatientDetailDialog } from "./PatientDetailDialog";
import { PatientFormDialog } from "./PatientFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Patient {
  id: string;
  name: string;
  age: string | null;
  sex: string | null;
  phone: string | null;
  email: string | null;
  blood_group: string | null;
  allergies: string | null;
  medical_history: string | null;
  created_at: string;
  auth_user_id?: string | null;
  invitation_sent_at?: string | null;
  invitation_accepted_at?: string | null;
}

export const MyPatientsTab = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading patients",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailDialogOpen(true);
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setFormDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });

      loadPatients();
    } catch (error: any) {
      toast({
        title: "Error deleting patient",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Patient Database</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Add patients and send invitations to create their accounts
            </p>
          </div>
          <Button onClick={handleAddPatient}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Patient Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No patients found" : "No patients yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow 
                  key={patient.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewPatient(patient)}
                >
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age || "-"}</TableCell>
                  <TableCell>{patient.sex || "-"}</TableCell>
                  <TableCell>{patient.phone || "-"}</TableCell>
                  <TableCell>{patient.email || "-"}</TableCell>
                  <TableCell>{patient.blood_group || "-"}</TableCell>
                  <TableCell>
                    {patient.auth_user_id ? (
                      <Badge variant="default" className="text-xs">✓ Registered</Badge>
                    ) : patient.invitation_sent_at ? (
                      <Badge variant="secondary" className="text-xs">Invited</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Not Invited</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPatient(patient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(patient)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Summary */}
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPatients.length} of {patients.length} total patients
        </p>
      </Card>

      <PatientDetailDialog
        patient={selectedPatient}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      <PatientFormDialog
        patient={editingPatient}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={loadPatients}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {patientToDelete?.name}? This action cannot be undone and will remove all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
