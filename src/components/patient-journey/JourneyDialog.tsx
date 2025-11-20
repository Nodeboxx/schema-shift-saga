import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface JourneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess: () => void;
}

const JourneyDialog = ({ open, onOpenChange, patientId, onSuccess }: JourneyDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    condition_name: "",
    diagnosis_date: "",
    status: "active",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("patient_journeys").insert({
        patient_id: patientId,
        doctor_id: user.id,
        condition_name: formData.condition_name,
        diagnosis_date: formData.diagnosis_date,
        status: formData.status,
        notes: formData.notes
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient journey created successfully"
      });

      onOpenChange(false);
      onSuccess();
      setFormData({
        condition_name: "",
        diagnosis_date: "",
        status: "active",
        notes: ""
      });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Patient Journey</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="condition">Condition/Treatment</Label>
            <Input
              id="condition"
              value={formData.condition_name}
              onChange={(e) => setFormData({ ...formData, condition_name: e.target.value })}
              placeholder="e.g., Hypertension Management"
              required
            />
          </div>

          <div>
            <Label htmlFor="diagnosis_date">Diagnosis Date</Label>
            <Input
              id="diagnosis_date"
              type="date"
              value={formData.diagnosis_date}
              onChange={(e) => setFormData({ ...formData, diagnosis_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Treatment plan notes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Journey"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JourneyDialog;