import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2 } from "lucide-react";

interface HeaderSettings {
  logo: string;
  navigation: Array<{ label: string; url: string }>;
  announcement: string;
}

interface FooterSettings {
  columns: Array<{
    title: string;
    links: Array<{ label: string; url: string }>;
  }>;
  copyright: string;
  social: Array<{ platform: string; url: string }>;
}

const AdminSiteSettings = () => {
  const [header, setHeader] = useState<HeaderSettings>({
    logo: "",
    navigation: [],
    announcement: ""
  });
  const [footer, setFooter] = useState<FooterSettings>({
    columns: [],
    copyright: "",
    social: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", ["header", "footer"]);

      if (error) throw error;

      data?.forEach((setting: any) => {
        if (setting.key === "header") {
          setHeader(setting.value);
        } else if (setting.key === "footer") {
          setFooter(setting.value);
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type: "header" | "footer") => {
    setSaving(true);
    try {
      const value = type === "header" ? header : footer;
      
      const { error } = await supabase
        .from("site_settings")
        .upsert([{
          key: type,
          value: value as any,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} settings saved`
      });
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

  const addNavItem = () => {
    setHeader({
      ...header,
      navigation: [...header.navigation, { label: "", url: "" }]
    });
  };

  const removeNavItem = (index: number) => {
    setHeader({
      ...header,
      navigation: header.navigation.filter((_, i) => i !== index)
    });
  };

  const updateNavItem = (index: number, field: "label" | "url", value: string) => {
    const newNav = [...header.navigation];
    newNav[index][field] = value;
    setHeader({ ...header, navigation: newNav });
  };

  const addFooterColumn = () => {
    setFooter({
      ...footer,
      columns: [...footer.columns, { title: "", links: [] }]
    });
  };

  const removeFooterColumn = (index: number) => {
    setFooter({
      ...footer,
      columns: footer.columns.filter((_, i) => i !== index)
    });
  };

  const addFooterLink = (columnIndex: number) => {
    const newColumns = [...footer.columns];
    newColumns[columnIndex].links.push({ label: "", url: "" });
    setFooter({ ...footer, columns: newColumns });
  };

  const removeFooterLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...footer.columns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex);
    setFooter({ ...footer, columns: newColumns });
  };

  const addSocialLink = () => {
    setFooter({
      ...footer,
      social: [...footer.social, { platform: "", url: "" }]
    });
  };

  const removeSocialLink = (index: number) => {
    setFooter({
      ...footer,
      social: footer.social.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Site Settings</h2>
        <p className="text-muted-foreground">Manage header, footer, and global settings</p>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label>Logo URL</Label>
                <Input
                  value={header.logo}
                  onChange={(e) => setHeader({ ...header, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label>Announcement Bar</Label>
                <Input
                  value={header.announcement}
                  onChange={(e) => setHeader({ ...header, announcement: e.target.value })}
                  placeholder="Special offer: 20% off for new users!"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Navigation Menu</Label>
                  <Button size="sm" onClick={addNavItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {header.navigation.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item.label}
                        onChange={(e) => updateNavItem(index, "label", e.target.value)}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => updateNavItem(index, "url", e.target.value)}
                        placeholder="/url"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeNavItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => saveSettings("header")} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Header
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label>Copyright Text</Label>
                <Input
                  value={footer.copyright}
                  onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                  placeholder="© 2025 MedScribe. All rights reserved."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Footer Columns</Label>
                  <Button size="sm" onClick={addFooterColumn}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </div>

                <div className="space-y-6">
                  {footer.columns.map((column, columnIndex) => (
                    <Card key={columnIndex} className="p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={column.title}
                            onChange={(e) => {
                              const newColumns = [...footer.columns];
                              newColumns[columnIndex].title = e.target.value;
                              setFooter({ ...footer, columns: newColumns });
                            }}
                            placeholder="Column Title"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFooterColumn(columnIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2 pl-4">
                          {column.links.map((link, linkIndex) => (
                            <div key={linkIndex} className="flex gap-2">
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  const newColumns = [...footer.columns];
                                  newColumns[columnIndex].links[linkIndex].label = e.target.value;
                                  setFooter({ ...footer, columns: newColumns });
                                }}
                                placeholder="Link Label"
                                className="flex-1"
                              />
                              <Input
                                value={link.url}
                                onChange={(e) => {
                                  const newColumns = [...footer.columns];
                                  newColumns[columnIndex].links[linkIndex].url = e.target.value;
                                  setFooter({ ...footer, columns: newColumns });
                                }}
                                placeholder="/url"
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFooterLink(columnIndex, linkIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addFooterLink(columnIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Link
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Social Media</Label>
                  <Button size="sm" onClick={addSocialLink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social
                  </Button>
                </div>

                <div className="space-y-3">
                  {footer.social.map((social, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={social.platform}
                        onChange={(e) => {
                          const newSocial = [...footer.social];
                          newSocial[index].platform = e.target.value;
                          setFooter({ ...footer, social: newSocial });
                        }}
                        placeholder="Platform (facebook, twitter, etc.)"
                        className="flex-1"
                      />
                      <Input
                        value={social.url}
                        onChange={(e) => {
                          const newSocial = [...footer.social];
                          newSocial[index].url = e.target.value;
                          setFooter({ ...footer, social: newSocial });
                        }}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSocialLink(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => saveSettings("footer")} disabled={saving}>
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

export default AdminSiteSettings;
