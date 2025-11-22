import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextToolbar from "@/components/RichTextToolbar";
import { Save } from "lucide-react";

const AdminHeaderFooter = () => {
  const [headerContent, setHeaderContent] = useState("");
  const [footerContent, setFooterContent] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: headerData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "header_content")
        .single();

      const { data: footerData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "footer_content")
        .single();

      if (headerData) setHeaderContent((headerData.value as any)?.html || "");
      if (footerData) setFooterContent((footerData.value as any)?.html || "");
    } catch (error: any) {
      console.error("Error loading settings:", error);
    }
  };

  const saveHeader = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "header_content",
          value: { html: headerContent },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Header saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveFooter = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "footer_content",
          value: { html: footerContent },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Footer saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">Header & Footer Editor</h2>
        <p className="text-sm md:text-base text-muted-foreground">Customize your site's header and footer with rich text</p>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-4">
          <Card className="p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <Label>Header Content (HTML)</Label>
                <div className="border rounded-lg mt-2">
                  <RichTextToolbar
                    onCommand={(cmd, value) => {
                      console.log("Command:", cmd, value);
                    }}
                    className="border-b p-2"
                  />
                  <textarea
                    value={headerContent}
                    onChange={(e) => setHeaderContent(e.target.value)}
                    className="w-full min-h-[300px] p-4 font-mono text-sm focus:outline-none"
                    placeholder="Enter header HTML content..."
                  />
                </div>
              </div>

              {headerContent && (
                <div>
                  <Label>Preview</Label>
                  <div
                    className="border rounded-lg p-4 bg-background mt-2"
                    dangerouslySetInnerHTML={{ __html: headerContent }}
                  />
                </div>
              )}

              <Button onClick={saveHeader} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Header
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card className="p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <Label>Footer Content (HTML)</Label>
                <div className="border rounded-lg mt-2">
                  <RichTextToolbar
                    onCommand={(cmd, value) => {
                      console.log("Command:", cmd, value);
                    }}
                    className="border-b p-2"
                  />
                  <textarea
                    value={footerContent}
                    onChange={(e) => setFooterContent(e.target.value)}
                    className="w-full min-h-[300px] p-4 font-mono text-sm focus:outline-none"
                    placeholder="Enter footer HTML content..."
                  />
                </div>
              </div>

              {footerContent && (
                <div>
                  <Label>Preview</Label>
                  <div
                    className="border rounded-lg p-4 bg-background mt-2"
                    dangerouslySetInnerHTML={{ __html: footerContent }}
                  />
                </div>
              )}

              <Button onClick={saveFooter} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Footer
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminHeaderFooter;
