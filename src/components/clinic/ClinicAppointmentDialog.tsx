import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClinicAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clinicId: string;
}

const ClinicAppointmentDialog = ({
  open,
  onOpenChange,
  onSuccess,
  clinicId,
}: ClinicAppointmentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showNewPatient, setShowNewPatient] = useState(false);
  
  const [appointmentData, setAppointmentData] = useState({
    patient_id: "",
    doctor_id: "",
    start_time: "",
    end_time: "",
    type: "in-person",
    notes: "",
  });

  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    sex: "",
  });

  useEffect(() => {
    if (open) {
      loadPatients();
      loadDoctors();
    }
  }, [open, clinicId]);

  const loadPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("name");

    setPatients(data || []);
  };

  const loadDoctors = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, specialization")
      .eq("clinic_id", clinicId)
      .eq("role", "doctor");

    setDoctors(data || []);
  };

  const handleCreatePatient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("patients")
        .insert({
          ...newPatient,
          user_id: user.id,
          clinic_id: clinicId,
        })
        .select()
        .single();

      if (error) throw error;

      setPatients([...patients, data]);
      setAppointmentData({ ...appointmentData, patient_id: data.id });
      setShowNewPatient(false);
      setNewPatient({
        name: "",
        phone: "",
        email: "",
        age: "",
        sex: "",
      });

      toast({
        title: "Success",
        description: "Patient created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("appointments")
        .insert({
          ...appointmentData,
          clinic_id: clinicId,
          status: "scheduled",
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      onOpenChange(false);
      onSuccess();
      setAppointmentData({
        patient_id: "",
        doctor_id: "",
        start_time: "",
        end_time: "",
        type: "in-person",
        notes: "",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appointment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointment">Appointment</TabsTrigger>
            <TabsTrigger value="new-patient">New Patient</TabsTrigger>
          </TabsList>

          <TabsContent value="appointment" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Patient</Label>
                <Select
                  value={appointmentData.patient_id}
                  onValueChange={(value) =>
                    setAppointmentData({ ...appointmentData, patient_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} {patient.phone && `- ${patient.phone}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Doctor</Label>
                <Select
                  value={appointmentData.doctor_id}
                  onValueChange={(value) =>
                    setAppointmentData({ ...appointmentData, doctor_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={appointmentData.start_time}
                    onChange={(e) =>
                      setAppointmentData({
                        ...appointmentData,
                        start_time: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={appointmentData.end_time}
                    onChange={(e) =>
                      setAppointmentData({
                        ...appointmentData,
                        end_time: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Appointment Type</Label>
                <Select
                  value={appointmentData.type}
                  onValueChange={(value) =>
                    setAppointmentData({ ...appointmentData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="telemedicine">Telemedicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData({ ...appointmentData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Appointment"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="new-patient" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Patient Name *</Label>
                <Input
                  value={newPatient.name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, name: e.target.value })
                  }
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newPatient.phone}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, phone: e.target.value })
                    }
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, email: e.target.value })
                    }
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input
                    value={newPatient.age}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, age: e.target.value })
                    }
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Sex</Label>
                  <Select
                    value={newPatient.sex}
                    onValueChange={(value) =>
                      setNewPatient({ ...newPatient, sex: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleCreatePatient}
                disabled={!newPatient.name}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Patient & Use
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicAppointmentDialog;
