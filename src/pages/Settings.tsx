import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            size="icon"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">Profile Settings</h1>
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
