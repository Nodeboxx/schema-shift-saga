import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LogoUploaderProps {
  currentLogoUrl: string;
  onUploadComplete: (url: string) => void;
}

const LogoUploader = ({ currentLogoUrl, onUploadComplete }: LogoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogoUrl);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Create file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/council-logo.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old logo if exists
      if (preview) {
        const oldPath = preview.split("/").slice(-2).join("/");
        await supabase.storage.from("council-logos").remove([oldPath]);
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("council-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("council-logos")
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Success",
        description: "Medical council logo uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const oldPath = preview.split("/").slice(-2).join("/");
      await supabase.storage.from("council-logos").remove([oldPath]);

      setPreview("");
      onUploadComplete("");

      toast({
        title: "Success",
        description: "Logo removed successfully",
      });
    } catch (error: any) {
      console.error("Remove error:", error);
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove logo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Medical Council Logo</Label>
      
      {preview ? (
        <div className="relative">
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20 flex items-center justify-center">
            <img 
              src={preview} 
              alt="Council Logo Preview" 
              className="max-h-32 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors bg-muted/20 hover:bg-muted/40">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Upload Medical Council Logo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      )}

      {uploading && (
        <div className="text-sm text-muted-foreground text-center">
          Uploading logo...
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        This logo will appear centered in your prescription header between English and Bengali doctor information
      </p>
    </div>
  );
};

export default LogoUploader;