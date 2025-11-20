import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
      .single();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
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

        <div className="bg-card rounded-lg shadow-lg p-6 space-y-6">
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
            <Label htmlFor="footer_left">Footer Left (Chamber/Clinic Info)</Label>
            <Textarea
              id="footer_left"
              value={profile.footer_left}
              onChange={(e) => setProfile({ ...profile, footer_left: e.target.value })}
              placeholder="Chamber: City Hospital&#10;Visiting Hours: 5-8 PM"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="footer_right">Footer Right (Contact Info)</Label>
            <Textarea
              id="footer_right"
              value={profile.footer_right}
              onChange={(e) => setProfile({ ...profile, footer_right: e.target.value })}
              placeholder="Phone: +880 123456789&#10;Email: doctor@example.com"
              rows={3}
            />
          </div>

          {/* Left Column Template Configuration */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4">Left Column Template</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Customize sections for your prescription's left column. Enable/disable sections for different medical specialties.
            </p>

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

                    {/* P/H Fields Editor */}
                    {section.id === "ph" && section.fields && (
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
