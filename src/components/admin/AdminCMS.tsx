import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminCMS = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setSections(data || []);
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

  const saveSection = async (section: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cms_sections")
        .update({ content: section.content })
        .eq("id", section.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSectionContent = (sectionId: string, field: string, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: {
            ...section.content,
            [field]: value
          }
        };
      }
      return section;
    }));
  };

  if (loading) {
    return <div>Loading CMS sections...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">CMS Content Editor</h2>

      <Tabs defaultValue={sections[0]?.section_name}>
        <TabsList>
          {sections.map(section => (
            <TabsTrigger key={section.id} value={section.section_name}>
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map(section => (
          <TabsContent key={section.id} value={section.section_name} className="space-y-4">
            {section.section_name === "hero" && (
              <div className="space-y-4">
                <div>
                  <Label>Heading</Label>
                  <Input
                    value={section.content.heading || ""}
                    onChange={(e) => updateSectionContent(section.id, "heading", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subheading</Label>
                  <Textarea
                    value={section.content.subheading || ""}
                    onChange={(e) => updateSectionContent(section.id, "subheading", e.target.value)}
                  />
                </div>
                <div>
                  <Label>CTA Text</Label>
                  <Input
                    value={section.content.cta_text || ""}
                    onChange={(e) => updateSectionContent(section.id, "cta_text", e.target.value)}
                  />
                </div>
              </div>
            )}

            {section.section_name === "pricing" && (
              <div>
                <Label>Pricing Content (JSON)</Label>
                <Textarea
                  value={JSON.stringify(section.content, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setSections(sections.map(s => 
                        s.id === section.id ? { ...s, content: parsed } : s
                      ));
                    } catch (err) {
                      // Invalid JSON
                    }
                  }}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            )}

            <Button onClick={() => saveSection(section)} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};

export default AdminCMS;