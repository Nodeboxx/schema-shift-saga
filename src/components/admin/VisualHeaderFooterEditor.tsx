import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Monitor, Code } from "lucide-react";

const VisualHeaderFooterEditor = () => {
  const [headerContent, setHeaderContent] = useState("");
  const [footerContent, setFooterContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeMode, setActiveMode] = useState<"visual" | "code">("visual");
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
        title: "Saved",
        description: "Header updated successfully",
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
        title: "Saved",
        description: "Footer updated successfully",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Header & Footer Editor</h2>
          <p className="text-muted-foreground">Visual editor for site-wide header and footer</p>
        </div>
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as "visual" | "code")}>
          <TabsList>
            <TabsTrigger value="visual">
              <Monitor className="w-4 h-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              {activeMode === "visual" ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Visual Preview</label>
                    <div className="border-2 border-primary rounded-lg p-6 bg-background min-h-[200px]">
                      {headerContent ? (
                        <div dangerouslySetInnerHTML={{ __html: headerContent }} />
                      ) : (
                        <p className="text-muted-foreground italic">No header content yet. Add HTML below.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Edit HTML</label>
                    <textarea
                      value={headerContent}
                      onChange={(e) => setHeaderContent(e.target.value)}
                      className="w-full min-h-[200px] p-4 font-mono text-sm border-2 rounded-md"
                      placeholder="<nav>Your header HTML...</nav>"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">Header HTML</label>
                  <textarea
                    value={headerContent}
                    onChange={(e) => setHeaderContent(e.target.value)}
                    className="w-full min-h-[300px] p-4 font-mono text-sm border rounded-md"
                    placeholder="<nav>Your header HTML...</nav>"
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
          <Card className="p-6">
            <div className="space-y-4">
              {activeMode === "visual" ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Visual Preview</label>
                    <div className="border-2 border-primary rounded-lg p-6 bg-background min-h-[200px]">
                      {footerContent ? (
                        <div dangerouslySetInnerHTML={{ __html: footerContent }} />
                      ) : (
                        <p className="text-muted-foreground italic">No footer content yet. Add HTML below.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Edit HTML</label>
                    <textarea
                      value={footerContent}
                      onChange={(e) => setFooterContent(e.target.value)}
                      className="w-full min-h-[200px] p-4 font-mono text-sm border-2 rounded-md"
                      placeholder="<footer>Your footer HTML...</footer>"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">Footer HTML</label>
                  <textarea
                    value={footerContent}
                    onChange={(e) => setFooterContent(e.target.value)}
                    className="w-full min-h-[300px] p-4 font-mono text-sm border rounded-md"
                    placeholder="<footer>Your footer HTML...</footer>"
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

export default VisualHeaderFooterEditor;
