import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/alert-dialog-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { AppLayout } from "@/components/layout/AppLayout";

interface SavedPrescription {
  id: string;
  patient_name: string;
  patient_age: string | null;
  prescription_date: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<SavedPrescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<SavedPrescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadPrescriptions(session.user.id);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        loadPrescriptions(session.user.id);
      } else {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadPrescriptions = async (userId: string) => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("id, patient_name, patient_age, prescription_date, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive",
      });
      return;
    }

    setPrescriptions(data || []);
    setFilteredPrescriptions(data || []);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredPrescriptions(prescriptions);
      return;
    }

    const filtered = prescriptions.filter((p) =>
      p.patient_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPrescriptions(filtered);
  };

  const handleCreateNew = () => {
    navigate("/prescription/new");
  };

  const handleOpenPrescription = (id: string) => {
    navigate(`/prescription/${id}`);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrescriptionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;

    try {
      const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("id", prescriptionToDelete);

      if (error) throw error;

      setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionToDelete));
      setFilteredPrescriptions(filteredPrescriptions.filter((p) => p.id !== prescriptionToDelete));
      
      toast({
        title: "Success",
        description: "Prescription deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prescription",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPrescriptionToDelete(null);
    }
  };

  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back to your medical practice</p>
          </div>
          <Button onClick={handleCreateNew} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Prescription
          </Button>
        </div>

        {/* Appointments Section */}
        <div className="mb-8">
          <AppointmentCalendar compact />
        </div>

        {/* Prescriptions Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Prescriptions</h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {searchTerm ? "No prescriptions found" : "No prescriptions yet"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateNew} className="mt-4" size="lg">
                    Create Your First Prescription
                  </Button>
                )}
              </div>
            ) : (
              <>
                {paginatedPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    onClick={() => handleOpenPrescription(prescription.id)}
                    className="bg-background border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-10 h-10 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground truncate">
                          {prescription.patient_name}
                        </h3>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          {prescription.patient_age && (
                            <span>Age: {prescription.patient_age}</span>
                          )}
                          {prescription.prescription_date && (
                            <span>
                              Date: {new Date(prescription.prescription_date).toLocaleDateString()}
                            </span>
                          )}
                          <span>
                            Created: {new Date(prescription.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => handleDeleteClick(prescription.id, e)}
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Prescription"
        description="Are you sure you want to delete this prescription? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </AppLayout>
  );
};

export default Dashboard;
