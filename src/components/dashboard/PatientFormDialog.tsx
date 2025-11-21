import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VoiceTextarea } from "@/components/voice/VoiceTextarea";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Patient {
  id?: string;
  name: string;
  age: string | null;
  sex: string | null;
  phone: string | null;
  email: string | null;
  blood_group: string | null;
  allergies: string | null;
  medical_history: string | null;
  custom_test_results?: any[];
}

interface CustomTestField {
  id: string;
  label: string;
  value: string;
  date?: string;
}

interface PatientFormDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const PatientFormDialog = ({ patient, open, onOpenChange, onSuccess }: PatientFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [customFields, setCustomFields] = useState<CustomTestField[]>([]);
  const [formData, setFormData] = useState<Patient>({
    name: "",
    age: null,
    sex: null,
    phone: null,
    email: null,
    blood_group: null,
    allergies: null,
    medical_history: null,
    custom_test_results: [],
  });

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      setCustomFields(patient.custom_test_results || []);
    } else {
      setFormData({
        name: "",
        age: null,
        sex: null,
        phone: null,
        email: null,
        blood_group: null,
        allergies: null,
        medical_history: null,
        custom_test_results: [],
      });
      setCustomFields([]);
    }
    setFiles([]);
  }, [patient, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { id: crypto.randomUUID(), label: "", value: "", date: new Date().toISOString().split('T')[0] }
    ]);
  };

  const updateCustomField = (id: string, field: keyof CustomTestField, value: string) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const uploadFiles = async (patientId: string) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${patientId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('patient-medical-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: metadataError } = await supabase
          .from('patient_medical_files')
          .insert({
            patient_id: patientId,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user.id,
            description: '',
          });

        if (metadataError) throw metadataError;
      }
    } catch (error: any) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const dataToSave = {
        ...formData,
        custom_test_results: JSON.parse(JSON.stringify(customFields)), // Convert to JSON
      };

      if (patient?.id) {
        // Update existing patient
        const { error } = await supabase
          .from("patients")
          .update(dataToSave)
          .eq("id", patient.id);

        if (error) throw error;

        // Upload files if any
        if (files.length > 0) {
          await uploadFiles(patient.id);
        }

        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
      } else {
        // Create new patient
        const { data: newPatient, error } = await supabase
          .from("patients")
          .insert({
            ...dataToSave,
            user_id: user.id,
            doctor_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Upload files if any
        if (files.length > 0 && newPatient) {
          await uploadFiles(newPatient.id);
        }

        toast({
          title: "Success",
          description: "Patient added successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
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
          <DialogTitle>{patient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                value={formData.age || ""}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g., 35"
                required
              />
            </div>

            <div>
              <Label htmlFor="sex">Sex *</Label>
              <Select value={formData.sex || ""} onValueChange={(value) => setFormData({ ...formData, sex: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880..."
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select
                value={formData.blood_group || ""}
                onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="allergies">Allergies</Label>
              <VoiceTextarea
                value={formData.allergies || ""}
                onChange={(value) => setFormData({ ...formData, allergies: value })}
                placeholder="List any known allergies..."
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="medical_history">Medical History</Label>
              <VoiceTextarea
                value={formData.medical_history || ""}
                onChange={(value) => setFormData({ ...formData, medical_history: value })}
                placeholder="Previous conditions, surgeries, etc..."
                rows={3}
              />
            </div>

            {/* Custom Test Result Fields */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Test Results</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Test Field
                </Button>
              </div>
              <div className="space-y-3">
                {customFields.map((field) => (
                  <Card key={field.id} className="p-3">
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <Input
                          placeholder="Test name (e.g., Blood Sugar)"
                          value={field.label}
                          onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Result value"
                          value={field.value}
                          onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="date"
                          value={field.date || ""}
                          onChange={(e) => updateCustomField(field.id, 'date', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomField(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Medical File Upload */}
            <div className="col-span-2">
              <Label>Upload Medical Documents</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span className="truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? "Saving..." : patient ? "Update Patient" : "Add Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
