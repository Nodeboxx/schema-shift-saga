import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from "lucide-react";

interface AboutUsContent {
  heading: string;
  subtitle: string;
  mission: {
    title: string;
    content: string[];
  };
  values: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  story: {
    title: string;
    content: string[];
  };
  cta: {
    heading: string;
    buttonText: string;
    buttonUrl: string;
  };
}

export const AdminAboutUs = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<AboutUsContent>({
    heading: "",
    subtitle: "",
    mission: { title: "", content: [] },
    values: [],
    story: { title: "", content: [] },
    cta: { heading: "", buttonText: "", buttonUrl: "" },
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("content")
        .eq("section_name", "about_us")
        .single();

      if (error) throw error;
      if (data?.content) {
        setContent(data.content as any);
      }
    } catch (error: any) {
      console.error("Error loading content:", error);
    }
  };

  const saveContent = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("cms_sections")
        .update({ content: content as any })
        .eq("section_name", "about_us");

      if (error) throw error;

      toast({
        title: "Success",
        description: "About Us page updated successfully",
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

  const addMissionParagraph = () => {
    setContent({
      ...content,
      mission: {
        ...content.mission,
        content: [...content.mission.content, "New paragraph"],
      },
    });
  };

  const updateMissionParagraph = (index: number, value: string) => {
    const newContent = [...content.mission.content];
    newContent[index] = value;
    setContent({
      ...content,
      mission: { ...content.mission, content: newContent },
    });
  };

  const removeMissionParagraph = (index: number) => {
    const newContent = [...content.mission.content];
    newContent.splice(index, 1);
    setContent({
      ...content,
      mission: { ...content.mission, content: newContent },
    });
  };

  const addValue = () => {
    setContent({
      ...content,
      values: [
        ...content.values,
        { icon: "HeartPulse", title: "New Value", description: "" },
      ],
    });
  };

  const updateValue = (index: number, field: string, value: string) => {
    const newValues = [...content.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setContent({ ...content, values: newValues });
  };

  const removeValue = (index: number) => {
    const newValues = [...content.values];
    newValues.splice(index, 1);
    setContent({ ...content, values: newValues });
  };

  const addStoryParagraph = () => {
    setContent({
      ...content,
      story: {
        ...content.story,
        content: [...content.story.content, "New paragraph"],
      },
    });
  };

  const updateStoryParagraph = (index: number, value: string) => {
    const newContent = [...content.story.content];
    newContent[index] = value;
    setContent({
      ...content,
      story: { ...content.story, content: newContent },
    });
  };

  const removeStoryParagraph = (index: number) => {
    const newContent = [...content.story.content];
    newContent.splice(index, 1);
    setContent({
      ...content,
      story: { ...content.story, content: newContent },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">About Us Page</h2>
          <p className="text-muted-foreground">Edit your About Us page content</p>
        </div>
        <Button onClick={saveContent} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Header Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Page Header</h3>
        <div className="space-y-4">
          <div>
            <Label>Main Heading</Label>
            <Input
              value={content.heading}
              onChange={(e) => setContent({ ...content, heading: e.target.value })}
              placeholder="About HealthScribe"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Textarea
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              placeholder="Brief tagline"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Mission Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Mission Section</h3>
          <Button variant="outline" size="sm" onClick={addMissionParagraph}>
            <Plus className="w-4 h-4 mr-2" />
            Add Paragraph
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input
              value={content.mission.title}
              onChange={(e) =>
                setContent({
                  ...content,
                  mission: { ...content.mission, title: e.target.value },
                })
              }
              placeholder="Our Mission"
            />
          </div>
          {content.mission.content.map((paragraph, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={paragraph}
                onChange={(e) => updateMissionParagraph(index, e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMissionParagraph(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Values Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Values Section</h3>
          <Button variant="outline" size="sm" onClick={addValue}>
            <Plus className="w-4 h-4 mr-2" />
            Add Value
          </Button>
        </div>
        <div className="space-y-4">
          {content.values.map((value, index) => (
            <Card key={index} className="p-4 bg-muted/50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">Value {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeValue(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Icon Name</Label>
                  <Input
                    value={value.icon}
                    onChange={(e) => updateValue(index, "icon", e.target.value)}
                    placeholder="HeartPulse, Users, Target, Award"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={value.title}
                    onChange={(e) => updateValue(index, "title", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={value.description}
                    onChange={(e) => updateValue(index, "description", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Story Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Story Section</h3>
          <Button variant="outline" size="sm" onClick={addStoryParagraph}>
            <Plus className="w-4 h-4 mr-2" />
            Add Paragraph
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input
              value={content.story.title}
              onChange={(e) =>
                setContent({
                  ...content,
                  story: { ...content.story, title: e.target.value },
                })
              }
              placeholder="Our Story"
            />
          </div>
          {content.story.content.map((paragraph, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={paragraph}
                onChange={(e) => updateStoryParagraph(index, e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStoryParagraph(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Call to Action</h3>
        <div className="space-y-4">
          <div>
            <Label>Heading</Label>
            <Input
              value={content.cta.heading}
              onChange={(e) =>
                setContent({
                  ...content,
                  cta: { ...content.cta, heading: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Button Text</Label>
            <Input
              value={content.cta.buttonText}
              onChange={(e) =>
                setContent({
                  ...content,
                  cta: { ...content.cta, buttonText: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Button URL</Label>
            <Input
              value={content.cta.buttonUrl}
              onChange={(e) =>
                setContent({
                  ...content,
                  cta: { ...content.cta, buttonUrl: e.target.value },
                })
              }
              placeholder="/register"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
