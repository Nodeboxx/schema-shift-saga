import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patients (name, age, sex),
          prescription_items (count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
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

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      rx.patient_name?.toLowerCase().includes(searchLower) ||
      rx.dx_text?.toLowerCase().includes(searchLower) ||
      rx.cc_text?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Loading prescriptions...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SubscriptionGate feature="prescription_history">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <FileText className="w-8 h-8" />
                  All Prescriptions
                </h1>
                <p className="text-muted-foreground mt-1">View and manage all saved prescriptions</p>
              </div>
              <Button onClick={() => navigate("/prescription")} size="lg">
                <FileText className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, diagnosis, or complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? "No prescriptions match your search" : "No prescriptions found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Age/Sex</TableHead>
                      <TableHead>Chief Complaints</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>
                          {prescription.prescription_date
                            ? format(new Date(prescription.prescription_date), "MMM dd, yyyy")
                            : format(new Date(prescription.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {prescription.patient_name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {prescription.patient_age || "-"} / {prescription.patient_sex || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {prescription.cc_text || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {prescription.dx_text || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={prescription.is_public ? "default" : "secondary"}>
                            {prescription.is_public ? "Public" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/prescription/${prescription.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigate(`/prescription/${prescription.id}`);
                                setTimeout(() => window.print(), 500);
                              }}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
            </div>
          </CardContent>
        </Card>
      </div>
      </SubscriptionGate>
    </AppLayout>
  );
};

export default PrescriptionList;
