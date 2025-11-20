import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Edit, Trash2, Plus } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  category: string;
  is_active: boolean;
  variables: string[];
}

export const NotificationTemplates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      setTemplates((data || []) as Template[]);
    } catch (error: any) {
      toast({ title: "Error loading templates", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (template: Partial<Template>) => {
    try {
      if (template.id) {
        const { error } = await supabase
          .from("email_templates")
          .update(template)
          .eq("id", template.id);
        if (error) throw error;
        toast({ title: "Template updated successfully" });
      } else {
        const { name, subject, body_html, category, is_active } = template;
        const { error } = await supabase.from("email_templates").insert({
          name: name!,
          subject: subject!,
          body_html: body_html!,
          category,
          is_active,
        });
        if (error) throw error;
        toast({ title: "Template created successfully" });
      }
      setShowDialog(false);
      setEditTemplate(null);
      loadTemplates();
    } catch (error: any) {
      toast({ title: "Error saving template", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      const { error } = await supabase.from("email_templates").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Template deleted successfully" });
      loadTemplates();
    } catch (error: any) {
      toast({ title: "Error deleting template", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Button onClick={() => { setEditTemplate(null); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No templates yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                    <p className="text-xs text-muted-foreground">Category: {template.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditTemplate(template); setShowDialog(true); }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <TemplateDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        template={editTemplate}
        onSave={handleSave}
      />
    </div>
  );
};

const TemplateDialog = ({
  open,
  onOpenChange,
  template,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onSave: (template: Partial<Template>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body_html: "",
    category: "appointment",
    is_active: true,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body_html: template.body_html,
        category: template.category,
        is_active: template.is_active,
      });
    } else {
      setFormData({
        name: "",
        subject: "",
        body_html: "",
        category: "appointment",
        is_active: true,
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(template ? { ...formData, id: template.id } : formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="confirmation">Confirmation</SelectItem>
                <SelectItem value="health_advice">Health Advice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Email Body (HTML)</Label>
            <Textarea
              value={formData.body_html}
              onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
              rows={10}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available variables: {"{patient_name}"}, {"{doctor_name}"}, {"{appointment_date}"}, {"{clinic_name}"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <Label>Active</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
