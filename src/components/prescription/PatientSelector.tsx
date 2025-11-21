import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: string;
  sex: string;
  weight: string;
  phone: string;
  email: string;
}

interface PatientSelectorProps {
  onPatientSelect: (patient: Patient) => void;
}

export const PatientSelector = ({ onPatientSelect }: PatientSelectorProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    sex: "",
    weight: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("patients")
        .select("id, name, age, sex, weight, phone, email")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatientId(patientId);
      onPatientSelect(patient);
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.name.trim() || !newPatient.age || !newPatient.sex || !newPatient.phone || !newPatient.email) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields: name, age, sex, phone, and email",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("patients")
        .insert([{
          user_id: user.id,
          name: newPatient.name,
          age: newPatient.age,
          sex: newPatient.sex,
          weight: newPatient.weight,
          phone: newPatient.phone,
          email: newPatient.email,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient added successfully",
      });

      setPatients([data, ...patients]);
      setSelectedPatientId(data.id);
      onPatientSelect(data);
      setShowAddForm(false);
      setNewPatient({ name: "", age: "", sex: "", weight: "", phone: "", email: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add patient",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showAddForm ? (
          <>
            <div className="space-y-2">
              <Label>Choose from existing patients</Label>
              <Select value={selectedPatientId} onValueChange={handleSelectPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent className="z-[10000] bg-popover">
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.age} - {patient.sex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAddForm(true)} 
                variant="outline" 
                className="flex-1"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Patient
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Patient Name *</Label>
              <Input
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Enter patient name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  placeholder="e.g., 25y"
                />
              </div>

              <div className="space-y-2">
                <Label>Sex *</Label>
                <Select 
                  value={newPatient.sex} 
                  onValueChange={(value) => setNewPatient({ ...newPatient, sex: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input
                  value={newPatient.weight}
                  onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                  placeholder="e.g., 70kg"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="Phone number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                placeholder="Email address"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPatient} className="flex-1">
                Add Patient
              </Button>
              <Button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewPatient({ name: "", age: "", sex: "", weight: "", phone: "", email: "" });
                }} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
