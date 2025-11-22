import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, Calendar, Search, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ClinicPatientsProps {
  clinicId: string;
}

const ClinicPatients = ({ clinicId }: ClinicPatientsProps) => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    loadPatients();
  }, [clinicId]);

  useEffect(() => {
    // Filter patients based on search query
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(query) ||
          patient.email?.toLowerCase().includes(query) ||
          patient.phone?.toLowerCase().includes(query) ||
          patient.doctor?.full_name?.toLowerCase().includes(query)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      // Get all doctors in this clinic
      const { data: doctors, error: doctorsError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clinic_id", clinicId);

      if (doctorsError) throw doctorsError;

      const doctorIds = doctors?.map((d) => d.id) || [];

      if (doctorIds.length === 0) {
        setPatients([]);
        setFilteredPatients([]);
        setLoading(false);
        return;
      }

      // Get all patients for these doctors
      const { data, error } = await supabase
        .from("patients")
        .select(`
          *,
          doctor:profiles!patients_doctor_id_fkey(full_name, specialization)
        `)
        .in("user_id", doctorIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPatients(data || []);
      setFilteredPatients(data || []);

      // Calculate stats
      const allPatients = data || [];
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        total: allPatients.length,
        male: allPatients.filter((p) => p.sex?.toLowerCase() === "male").length,
        female: allPatients.filter((p) => p.sex?.toLowerCase() === "female").length,
        thisMonth: allPatients.filter((p) => {
          const createdDate = new Date(p.created_at);
          return createdDate >= firstDayOfMonth;
        }).length,
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (ageString: string | null) => {
    if (!ageString) return "N/A";
    // Age might be stored as "25" or "25 years" etc
    const match = ageString.match(/\d+/);
    return match ? `${match[0]} yrs` : ageString;
  };

  if (loading) {
    return <Card className="p-6"><div>Loading patients...</div></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Male</p>
              <p className="text-2xl font-bold">{stats.male}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Female</p>
              <p className="text-2xl font-bold">{stats.female}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
              <User className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold">Patients</h3>
            <p className="text-sm text-muted-foreground">All patients across clinic doctors</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery ? "No patients found matching your search" : "No patients yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age/Sex</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          {patient.medical_history && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {patient.medical_history.substring(0, 30)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{calculateAge(patient.age)}</p>
                        {patient.sex && (
                          <Badge variant="outline" className="text-xs">
                            {patient.sex}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {patient.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{patient.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {patient.doctor?.full_name || "N/A"}
                        </p>
                        {patient.doctor?.specialization && (
                          <p className="text-xs text-muted-foreground">
                            {patient.doctor.specialization}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.blood_group ? (
                        <Badge variant="secondary">{patient.blood_group}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(patient.created_at).toLocaleDateString()}
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

export default ClinicPatients;
