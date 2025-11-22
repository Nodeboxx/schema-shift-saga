import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Eye,
  Download,
  Calendar,
  User,
  Plus,
  Filter
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClinicPrescriptionsProps {
  clinicId: string;
}

const ClinicPrescriptions = ({ clinicId }: ClinicPrescriptionsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    today: 0,
  });

  useEffect(() => {
    loadDoctors();
    loadPrescriptions();
  }, [clinicId, doctorFilter]);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm]);

  const loadDoctors = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, specialization")
      .eq("clinic_id", clinicId)
      .eq("role", "doctor");

    setDoctors(data || []);
  };

  const loadPrescriptions = async () => {
    try {
      // Get all doctors in this clinic
      const { data: doctorsList, error: doctorsError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clinic_id", clinicId);

      if (doctorsError) throw doctorsError;

      let doctorIds = doctorsList?.map((d) => d.id) || [];

      // Apply doctor filter if specified
      if (doctorFilter !== "all") {
        doctorIds = doctorIds.filter((id) => id === doctorFilter);
      }

      if (doctorIds.length === 0) {
        setPrescriptions([]);
        setFilteredPrescriptions([]);
        setLoading(false);
        return;
      }

      // Fetch prescriptions for these doctors
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialization),
          patient:patients(name, phone, email)
        `)
        .in("doctor_id", doctorIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const prescriptionsData = data || [];
      setPrescriptions(prescriptionsData);
      setFilteredPrescriptions(prescriptionsData);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      setStats({
        total: prescriptionsData.length,
        thisMonth: prescriptionsData.filter(
          (p) => new Date(p.created_at) >= thisMonthStart
        ).length,
        today: prescriptionsData.filter(
          (p) => new Date(p.created_at) >= today
        ).length,
      });
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

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    if (searchTerm) {
      filtered = filtered.filter(
        (prescription) =>
          prescription.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prescription.patient?.phone?.includes(searchTerm) ||
          prescription.doctor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleViewPrescription = (prescriptionId: string) => {
    navigate(`/prescription/${prescriptionId}`);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div>Loading prescriptions...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Prescriptions</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-3xl font-bold mt-2 text-blue-500">{stats.thisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-3xl font-bold mt-2 text-green-500">{stats.today}</p>
            </div>
            <FileText className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Prescriptions Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold">Prescriptions</h3>
            <p className="text-sm text-muted-foreground">
              View all prescriptions from clinic doctors
            </p>
          </div>
          <Button onClick={() => navigate("/prescription")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Prescription
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, doctor, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No prescriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {prescription.patient?.name || prescription.patient_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prescription.patient?.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {prescription.doctor?.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prescription.doctor?.specialization}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {new Date(
                              prescription.prescription_date || prescription.created_at
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              prescription.created_at
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {prescription.page_count || 1} page{(prescription.page_count || 1) > 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPrescription(prescription.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClinicPrescriptions;
