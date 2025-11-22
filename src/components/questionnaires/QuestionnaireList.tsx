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
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base md:text-lg">{template.title}</CardTitle>
                  <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                <span className="whitespace-nowrap">Category: {template.category}</span>
                <span className="whitespace-nowrap">{template.questions.length} questions</span>
                <span className="whitespace-nowrap">Created: {new Date(template.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(template)} className="flex-1 sm:flex-initial">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(template.id, template.is_active)}
                  className="flex-1 sm:flex-initial"
                >
                  {template.is_active ? (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Inactive</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  className="flex-1 sm:flex-initial"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
