import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ClinicBrandingProps {
  clinic: any;
  onUpdate: () => void;
}

const ClinicBranding = ({ clinic, onUpdate }: ClinicBrandingProps) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ logo?: boolean; header?: boolean }>({});
  const [formData, setFormData] = useState({
    name: clinic.name || "",
    logo_url: clinic.logo_url || "",
    header_image_url: clinic.header_image_url || "",
    address: clinic.address || "",
    phone: clinic.phone || "",
    email: clinic.email || "",
    website: clinic.website || ""
  });
  const { toast } = useToast();

  const handleFileUpload = async (file: File, type: 'logo' | 'header') => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading({ ...uploading, [type]: true });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${clinic.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clinic-branding')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('clinic-branding')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        [type === 'logo' ? 'logo_url' : 'header_image_url']: publicUrl
      });

      toast({
        title: "Success",
        description: `${type === 'logo' ? 'Logo' : 'Header image'} uploaded successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("clinics")
        .update(formData)
        .eq("id", clinic.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Branding updated successfully"
      });

      onUpdate();
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

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Clinic Branding</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Clinic Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label>Logo</Label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="Or enter URL manually"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading.logo}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading.logo ? "Uploading..." : "Upload"}
                </Button>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
              />
              {formData.logo_url && (
                <div className="relative border rounded-lg p-4 bg-muted/50">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-24 w-auto mx-auto object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Header Image Upload */}
          <div className="space-y-3">
            <Label>Header Image</Label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  id="header_image_url"
                  value={formData.header_image_url}
                  onChange={(e) => setFormData({ ...formData, header_image_url: e.target.value })}
                  placeholder="Or enter URL manually"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('header-upload')?.click()}
                  disabled={uploading.header}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading.header ? "Uploading..." : "Upload"}
                </Button>
              </div>
              <input
                id="header-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'header');
                }}
              />
              {formData.header_image_url && (
                <div className="relative border rounded-lg p-4 bg-muted/50">
                  <img
                    src={formData.header_image_url}
                    alt="Header preview"
                    className="h-24 w-full object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
};

export default ClinicBranding;