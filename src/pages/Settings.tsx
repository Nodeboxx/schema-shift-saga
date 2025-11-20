import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, FileText, Check, Wand2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prescriptionTemplates, getTemplateById } from "@/lib/prescriptionTemplates";
import CustomTemplateBuilder from "@/components/settings/CustomTemplateBuilder";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Section Component
const SortableSection = ({ section, index, onUpdate, onRemoveField, onAddField }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-3 mb-2">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <Checkbox
          checked={section.enabled}
          onCheckedChange={(checked) => onUpdate(index, { enabled: checked })}
        />
        <Input
          value={section.title}
          onChange={(e) => onUpdate(index, { title: e.target.value })}
          className="flex-1 h-8"
        />
      </div>

      {section.fields && section.fields.length > 0 && (
        <div className="ml-11 mt-3 grid grid-cols-2 gap-2">
          {section.fields.map((field: any, fieldIndex: number) => (
            <div key={fieldIndex} className="flex items-center gap-2">
              <Input
                value={field.label}
                onChange={(e) => {
                  const updatedFields = [...section.fields];
                  updatedFields[fieldIndex] = { ...field, label: e.target.value };
                  onUpdate(index, { fields: updatedFields });
                }}
                className="h-7 text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onRemoveField(index, fieldIndex)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onAddField(index)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Field
          </Button>
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customBuilderOpen, setCustomBuilderOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [profile, setProfile] = useState({
    full_name: "",
    name_bn: "",
    degree_en: "",
    degree_bn: "",
    council_logo_url: "",
    registration_number: "",
    footer_left: "",
    footer_right: "",
    left_template_sections: [] as any[],
    active_template: "general_medicine",
    custom_templates: [] as any[],
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
        council_logo_url: data.council_logo_url || "",
        registration_number: data.registration_number || "",
        footer_left: data.footer_left || "",
        footer_right: data.footer_right || "",
        left_template_sections: Array.isArray(data.left_template_sections) ? data.left_template_sections : [],
        active_template: data.active_template || "general_medicine",
        custom_templates: Array.isArray(data.custom_templates) ? data.custom_templates : [],
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = profile.left_template_sections.findIndex((s) => s.id === active.id);
      const newIndex = profile.left_template_sections.findIndex((s) => s.id === over.id);

      const reordered = arrayMove(profile.left_template_sections, oldIndex, newIndex).map(
        (section, index) => ({ ...section, order: index })
      );

      setProfile({ ...profile, left_template_sections: reordered });
    }
  };

  const handleSectionUpdate = (index: number, updates: any) => {
    const updated = [...profile.left_template_sections];
    updated[index] = { ...updated[index], ...updates };
    setProfile({ ...profile, left_template_sections: updated });
  };

  const handleRemoveField = (sectionIndex: number, fieldIndex: number) => {
    const updated = [...profile.left_template_sections];
    const fields = updated[sectionIndex].fields.filter((_: any, i: number) => i !== fieldIndex);
    updated[sectionIndex] = { ...updated[sectionIndex], fields };
    setProfile({ ...profile, left_template_sections: updated });
  };

  const handleAddField = (sectionIndex: number) => {
    const updated = [...profile.left_template_sections];
    const fields = [...(updated[sectionIndex].fields || []), { label: "New Field", value: "" }];
    updated[sectionIndex] = { ...updated[sectionIndex], fields };
    setProfile({ ...profile, left_template_sections: updated });
  };

  const handleSaveCustomTemplate = async (template: any) => {
    const customTemplates = [...profile.custom_templates, template];
    setProfile({ ...profile, custom_templates: customTemplates });

    // Save to database
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ custom_templates: customTemplates })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom template saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          name_bn: profile.name_bn,
          degree_en: profile.degree_en,
          degree_bn: profile.degree_bn,
          council_logo_url: profile.council_logo_url,
          registration_number: profile.registration_number,
          footer_left: profile.footer_left,
          footer_right: profile.footer_right,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile information updated successfully",
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

  const handleSaveTemplate = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          left_template_sections: profile.left_template_sections,
          active_template: profile.active_template,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update template settings",
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

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Medical Council Registration (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="council_logo_url">Medical Council Logo URL</Label>
                      <Input
                        id="council_logo_url"
                        value={profile.council_logo_url}
                        onChange={(e) => setProfile({ ...profile, council_logo_url: e.target.value })}
                        placeholder="https://example.com/council-logo.png"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload your logo to a hosting service and paste the URL here (e.g., Bangladesh Medical & Dental Council)
                      </p>
                      {profile.council_logo_url && (
                        <div className="mt-3 p-4 border rounded-lg bg-muted/50 flex items-center justify-center">
                          <img 
                            src={profile.council_logo_url} 
                            alt="Medical Council Logo" 
                            className="max-h-24 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="registration_number">Registration Number</Label>
                      <Input
                        id="registration_number"
                        value={profile.registration_number}
                        onChange={(e) => setProfile({ ...profile, registration_number: e.target.value })}
                        placeholder="e.g., BMDC Reg No: A-57477"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your medical council registration number (will appear below the logo on prescriptions)
                      </p>
                    </div>
                  </div>
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
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Profile Information"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Select Prescription Template</CardTitle>
                    <CardDescription>
                      Choose a template based on your medical specialty. Each template includes relevant sections and fields.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCustomBuilderOpen(true)} variant="outline">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Build Custom Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Built-in Templates */}
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

                  {/* Custom Templates */}
                  {profile.custom_templates?.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                        profile.active_template === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border border-dashed"
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Wand2 className="w-8 h-8 text-purple-500" />
                          {profile.active_template === template.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1">{template.description}</p>
                        <p className="text-xs font-medium text-purple-600 mt-2">
                          Custom • {template.sections?.filter((s: any) => s.enabled).length} sections
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={profile.left_template_sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {profile.left_template_sections
                        ?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        .map((section: any, index: number) => (
                          <SortableSection
                            key={section.id}
                            section={section}
                            index={index}
                            onUpdate={handleSectionUpdate}
                            onRemoveField={handleRemoveField}
                            onAddField={handleAddField}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <Button
                  onClick={handleSaveTemplate}
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

        <CustomTemplateBuilder
          open={customBuilderOpen}
          onOpenChange={setCustomBuilderOpen}
          onSave={handleSaveCustomTemplate}
        />
      </div>
    </div>
  );
};

export default Settings;
