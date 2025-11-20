import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, FileText, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prescriptionTemplates, getTemplateById } from "@/lib/prescriptionTemplates";

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    full_name: "",
    name_bn: "",
    degree_en: "",
    degree_bn: "",
    footer_left: "",
    footer_right: "",
    left_template_sections: [] as any[],
    active_template: "general_medicine",
  });

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        navigate("/login");
      }
      setLoading(false);
    };

    initAuth();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        name_bn: data.name_bn || "",
        degree_en: data.degree_en || "",
        degree_bn: data.degree_bn || "",
        footer_left: data.footer_left || "",
        footer_right: data.footer_right || "",
        left_template_sections: Array.isArray(data.left_template_sections) ? data.left_template_sections : [],
        active_template: data.active_template || "general_medicine",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setProfile({
        ...profile,
        active_template: templateId,
        left_template_sections: JSON.parse(JSON.stringify(template.sections)),
      });
      toast({
        title: "Template Selected",
        description: `${template.name} template has been applied`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            size="icon"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-4xl font-bold text-foreground">Profile Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="templates">Prescription Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Information</CardTitle>
                <CardDescription>Update your professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="full_name">Doctor Name (English)</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="name_bn">Doctor Name (Bengali)</Label>
                  <Input
                    id="name_bn"
                    value={profile.name_bn}
                    onChange={(e) => setProfile({ ...profile, name_bn: e.target.value })}
                    placeholder="ডাঃ জন ডো"
                  />
                </div>

                <div>
                  <Label htmlFor="degree_en">Degrees & Qualifications (English)</Label>
                  <Textarea
                    id="degree_en"
                    value={profile.degree_en}
                    onChange={(e) => setProfile({ ...profile, degree_en: e.target.value })}
                    placeholder="MBBS, MD&#10;Cardiologist&#10;Hospital Name"
                    rows={5}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use &lt;br/&gt; for line breaks
                  </p>
                </div>

                <div>
                  <Label htmlFor="degree_bn">Degrees & Qualifications (Bengali)</Label>
                  <Textarea
                    id="degree_bn"
                    value={profile.degree_bn}
                    onChange={(e) => setProfile({ ...profile, degree_bn: e.target.value })}
                    placeholder="এম.বি.বি.এস, এম.ডি&#10;হৃদরোগ বিশেষজ্ঞ&#10;হাসপাতালের নাম"
                    rows={5}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use &lt;br/&gt; for line breaks
                  </p>
                </div>

                <div>
                  <Label htmlFor="footer_left">Footer Left</Label>
                  <Textarea
                    id="footer_left"
                    value={profile.footer_left}
                    onChange={(e) => setProfile({ ...profile, footer_left: e.target.value })}
                    placeholder="Chamber info, contact details, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="footer_right">Footer Right</Label>
                  <Textarea
                    id="footer_right"
                    value={profile.footer_right}
                    onChange={(e) => setProfile({ ...profile, footer_right: e.target.value })}
                    placeholder="Phone: +880 123456789&#10;Email: doctor@example.com"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Prescription Template</CardTitle>
                <CardDescription>
                  Choose a template based on your medical specialty. Each template includes relevant sections and fields.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {prescriptionTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        profile.active_template === template.id
                          ? "border-primary border-2 bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="w-8 h-8 text-primary" />
                          {profile.active_template === template.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{template.namebn}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <p className="text-xs font-medium text-primary mt-2">
                          {template.sections.filter((s) => s.enabled).length} sections
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customize Template Sections</CardTitle>
                <CardDescription>
                  Enable/disable sections and customize fields for your active template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.left_template_sections
                    ?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((section: any, index: number) => (
                      <div key={section.id} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center gap-3 mb-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <Checkbox
                            checked={section.enabled}
                            onCheckedChange={(checked) => {
                              const updated = [...profile.left_template_sections];
                              updated[index] = { ...section, enabled: checked };
                              setProfile({ ...profile, left_template_sections: updated });
                            }}
                          />
                          <Input
                            value={section.title}
                            onChange={(e) => {
                              const updated = [...profile.left_template_sections];
                              updated[index] = { ...section, title: e.target.value };
                              setProfile({ ...profile, left_template_sections: updated });
                            }}
                            className="flex-1 h-8"
                          />
                        </div>

                        {/* Fields Editor for sections with fields */}
                        {section.fields && section.fields.length > 0 && (
                          <div className="ml-11 mt-3 grid grid-cols-2 gap-2">
                            {section.fields.map((field: any, fieldIndex: number) => (
                              <div key={fieldIndex} className="flex items-center gap-2">
                                <Input
                                  value={field.label}
                                  onChange={(e) => {
                                    const updated = [...profile.left_template_sections];
                                    const fields = [...section.fields];
                                    fields[fieldIndex] = { ...field, label: e.target.value };
                                    updated[index] = { ...section, fields };
                                    setProfile({ ...profile, left_template_sections: updated });
                                  }}
                                  className="h-7 text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    const updated = [...profile.left_template_sections];
                                    const fields = section.fields.filter((_: any, i: number) => i !== fieldIndex);
                                    updated[index] = { ...section, fields };
                                    setProfile({ ...profile, left_template_sections: updated });
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                const updated = [...profile.left_template_sections];
                                const fields = [...(section.fields || []), { label: "New Field", value: "" }];
                                updated[index] = { ...section, fields };
                                setProfile({ ...profile, left_template_sections: updated });
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Field
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="w-full gap-2 mt-6"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Template Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
