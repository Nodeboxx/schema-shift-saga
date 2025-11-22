import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminClinics = () => {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from("clinics")
        .select(`
          *,
          profiles:owner_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClinics(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading clinics...</div>;
  }

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Clinic Management</h2>

      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinic Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Doctors</TableHead>
            <TableHead>Patients</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinics.map((clinic) => (
            <TableRow key={clinic.id}>
              <TableCell className="font-medium">{clinic.name}</TableCell>
              <TableCell>
                {clinic.profiles?.full_name || clinic.profiles?.email || "N/A"}
              </TableCell>
              <TableCell>
                <Badge>{clinic.subscription_tier || "free"}</Badge>
              </TableCell>
              <TableCell>{clinic.max_doctors}</TableCell>
              <TableCell>{clinic.max_patients}</TableCell>
              <TableCell>
                <Badge variant={clinic.subscription_status === "active" ? "default" : "secondary"}>
                  {clinic.subscription_status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </Card>
  );
};

export default AdminClinics;
