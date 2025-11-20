import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  is_active: boolean;
  questions: any[];
  created_at: string;
}

export const QuestionnaireList = ({ onView }: { onView: (template: Template) => void }) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("questionnaire_templates")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as Template[]);
    } catch (error: any) {
      toast({ title: "Error loading templates", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("questionnaire_templates")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: `Template ${!currentStatus ? "activated" : "deactivated"}` });
      loadTemplates();
    } catch (error: any) {
      toast({ title: "Error updating template", description: error.message, variant: "destructive" });
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase.from("questionnaire_templates").delete().eq("id", id);

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

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No questionnaire templates yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {template.title}
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Category: {template.category}</span>
                <span>{template.questions.length} questions</span>
                <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(template)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(template.id, template.is_active)}
                >
                  {template.is_active ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
