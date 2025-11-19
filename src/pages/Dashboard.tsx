import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Plus, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Prescription Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={handleCreateNew} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create New Prescription
            </Button>
            <Button onClick={handleLogout} size="lg" variant="outline" className="gap-2">
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6">
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

          <div className="space-y-2">
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? "No prescriptions found" : "No saved prescriptions yet"}
              </div>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  onClick={() => handleOpenPrescription(prescription.id)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">{prescription.patient_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age: {prescription.patient_age || "N/A"} | Date:{" "}
                        {prescription.prescription_date
                          ? new Date(prescription.prescription_date).toLocaleDateString()
                          : new Date(prescription.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(prescription.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
