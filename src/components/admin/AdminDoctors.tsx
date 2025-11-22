import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Doctor {
  id: string;
  email: string;
  full_name: string;
  specialization: string;
  degree_en: string;
  degree_bn: string;
  designation: string;
  avatar_url: string;
  bio: string;
  consultation_fee: number;
  available_days: string[];
  available_hours: string;
  phone: string;
  address: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "doctor")
        .order("display_order");

      if (error) throw error;
      setDoctors(data || []);
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

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor({ ...doctor });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingDoctor) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingDoctor.full_name,
          specialization: editingDoctor.specialization,
          degree_en: editingDoctor.degree_en,
          degree_bn: editingDoctor.degree_bn,
          designation: editingDoctor.designation,
          avatar_url: editingDoctor.avatar_url,
          bio: editingDoctor.bio,
          consultation_fee: editingDoctor.consultation_fee,
          available_days: editingDoctor.available_days,
          available_hours: editingDoctor.available_hours,
          phone: editingDoctor.phone,
          address: editingDoctor.address,
          is_active: editingDoctor.is_active,
          is_featured: editingDoctor.is_featured,
          display_order: editingDoctor.display_order,
        })
        .eq("id", editingDoctor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });

      loadDoctors();
      setIsDialogOpen(false);
      setEditingDoctor(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleDayAvailability = (day: string) => {
    if (!editingDoctor) return;
    
    const days = editingDoctor.available_days || [];
    const newDays = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day];
    
    setEditingDoctor({ ...editingDoctor, available_days: newDays });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Doctor Management</h2>
          <p className="text-sm md:text-base text-muted-foreground">Manage doctor profiles and visibility</p>
        </div>
      </div>

      <Card className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    {doctor.avatar_url ? (
                      <img src={doctor.avatar_url} alt={doctor.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                        {doctor.full_name?.charAt(0) || "D"}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{doctor.full_name}</TableCell>
                <TableCell>{doctor.specialization}</TableCell>
                <TableCell>{doctor.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${doctor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {doctor.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  {doctor.is_featured && <span className="text-yellow-500">⭐</span>}
                </TableCell>
                <TableCell>{doctor.display_order}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(doctor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor Profile</DialogTitle>
          </DialogHeader>

          {editingDoctor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editingDoctor.full_name || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email (Read-only)</Label>
                  <Input value={editingDoctor.email} disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Specialization</Label>
                  <Input
                    value={editingDoctor.specialization || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input
                    value={editingDoctor.designation || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Degree (English)</Label>
                  <Input
                    value={editingDoctor.degree_en || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, degree_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Degree (Bengali)</Label>
                  <Input
                    value={editingDoctor.degree_bn || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, degree_bn: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Avatar URL</Label>
                <Input
                  value={editingDoctor.avatar_url || ""}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, avatar_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={editingDoctor.bio || ""}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Consultation Fee</Label>
                  <Input
                    type="number"
                    value={editingDoctor.consultation_fee || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, consultation_fee: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editingDoctor.phone || ""}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={editingDoctor.display_order || 0}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={editingDoctor.address || ""}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, address: e.target.value })}
                />
              </div>

              <div>
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {weekDays.map(day => (
                    <Button
                      key={day}
                      type="button"
                      variant={editingDoctor.available_days?.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDayAvailability(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Available Hours</Label>
                <Input
                  value={editingDoctor.available_hours || ""}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, available_hours: e.target.value })}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDoctor.is_active}
                    onCheckedChange={(checked) => setEditingDoctor({ ...editingDoctor, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDoctor.is_featured}
                    onCheckedChange={(checked) => setEditingDoctor({ ...editingDoctor, is_featured: checked })}
                  />
                  <Label>Featured</Label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctors;
