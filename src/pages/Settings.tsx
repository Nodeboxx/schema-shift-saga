import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, FileText, Check, Wand2, User, Mail, Lock, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prescriptionTemplates, getTemplateById } from "@/lib/prescriptionTemplates";
import CustomTemplateBuilder from "@/components/settings/CustomTemplateBuilder";
import LogoUploader from "@/components/settings/LogoUploader";
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
    avatar_url: "",
    email: "",
  });

  const [accountSettings, setAccountSettings] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

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
        avatar_url: data.avatar_url || "",
        email: data.email || "",
      });
      setAvatarPreview(data.avatar_url || "");
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !user) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('council-logos')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('council-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if new file selected
      if (avatarFile) {
        const uploadedUrl = await handleUploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

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
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, avatar_url: avatarUrl });
      setAvatarFile(null);

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

  const handleUpdateEmail = async () => {
    if (!accountSettings.newEmail) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: accountSettings.newEmail,
      });

      if (error) throw error;

      // Update profiles table
      await supabase
        .from("profiles")
        .update({ email: accountSettings.newEmail })
        .eq("id", user.id);

      toast({
        title: "Success",
        description: "Email updated successfully. Please check your new email for confirmation.",
      });

      setAccountSettings({ ...accountSettings, newEmail: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!accountSettings.newPassword || !accountSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (accountSettings.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: accountSettings.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setAccountSettings({
        ...accountSettings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
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
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
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

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="templates">Prescription Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account credentials and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label>Profile Avatar</Label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="mb-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a profile photo. This will be visible in the admin dashboard and doctor listings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Change Email</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Current Email</Label>
                      <Input
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new_email">New Email Address</Label>
                      <Input
                        id="new_email"
                        type="email"
                        value={accountSettings.newEmail}
                        onChange={(e) => setAccountSettings({ ...accountSettings, newEmail: e.target.value })}
                        placeholder="Enter new email address"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={saving || !accountSettings.newEmail}
                      className="gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Update Email
                    </Button>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Change Password</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={accountSettings.newPassword}
                        onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={accountSettings.confirmPassword}
                        onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={saving || !accountSettings.newPassword || !accountSettings.confirmPassword}
                      className="gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Update Password
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save All Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <div className="space-y-6">
                    <LogoUploader
                      currentLogoUrl={profile.council_logo_url}
                      onUploadComplete={(url) => setProfile({ ...profile, council_logo_url: url })}
                    />

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
    </AppLayout>
  );
};

export default Settings;
