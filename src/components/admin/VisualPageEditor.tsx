import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Code, Monitor, Plus, Edit, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: any;
  meta_title?: string | null;
  meta_description?: string | null;
  is_published: boolean;
  created_at: string;
}

const VisualPageEditor = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"visual" | "code">("visual");
  const { toast } = useToast();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
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

  const createPage = () => {
    setEditingPage({
      id: "",
      title: "New Page",
      slug: "new-page",
      content: { html: "<h1>Page Title</h1><p>Start editing your page content...</p>" },
      meta_title: "",
      meta_description: "",
      is_published: false,
      created_at: ""
    });
    setOpen(true);
  };

  const savePage = async () => {
    if (!editingPage) return;

    try {
      if (editingPage.id) {
        const { error } = await supabase
          .from("custom_pages")
          .update({
            title: editingPage.title,
            slug: editingPage.slug,
            content: editingPage.content,
            meta_title: editingPage.meta_title,
            meta_description: editingPage.meta_description,
            is_published: editingPage.is_published,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingPage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("custom_pages")
          .insert({
            title: editingPage.title,
            slug: editingPage.slug,
            content: editingPage.content,
            meta_title: editingPage.meta_title,
            meta_description: editingPage.meta_description,
            is_published: editingPage.is_published
          });

        if (error) throw error;
      }

      toast({
        title: "Saved",
        description: "Page saved successfully"
      });

      setOpen(false);
      setEditingPage(null);
      loadPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page?")) return;

    try {
      const { error } = await supabase
        .from("custom_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Page removed"
      });

      loadPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const togglePublish = async (page: Page) => {
    try {
      const { error } = await supabase
        .from("custom_pages")
        .update({ is_published: !page.is_published })
        .eq("id", page.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Page ${!page.is_published ? "published" : "unpublished"}`
      });

      loadPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Page Management</h2>
          <p className="text-muted-foreground">Visual page builder with live preview</p>
        </div>
        <Button onClick={createPage}>
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">/{page.slug}</code>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={page.is_published}
                    onCheckedChange={() => togglePublish(page)}
                  />
                </TableCell>
                <TableCell>{new Date(page.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/${page.slug}`, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingPage(page);
                        setOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePage(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingPage?.id ? "Edit Page" : "Create Page"}</span>
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
            </DialogTitle>
          </DialogHeader>

          {editingPage && (
            <div className="space-y-6">
              {/* Meta Fields */}
              <div className="grid gap-4 md:grid-cols-2 border-b pb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Page Title</label>
                  <Input
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Slug (URL)</label>
                  <Input
                    value={editingPage.slug}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    placeholder="about-us"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Meta Title (SEO)</label>
                  <Input
                    value={editingPage.meta_title || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Meta Description (SEO)</label>
                  <Input
                    value={editingPage.meta_description || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                  />
                </div>
              </div>

              {/* Visual/Code Editor */}
              {activeMode === "visual" ? (
                <div className="space-y-4">
                  <label className="text-sm font-medium">Visual Preview</label>
                  <div className="border-2 border-primary rounded-lg p-8 bg-background min-h-[400px]">
                    <div
                      className="prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: editingPage.content?.html || "" }}
                    />
                  </div>
                  <label className="text-sm font-medium">Edit HTML</label>
                  <textarea
                    value={editingPage.content?.html || ""}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, html: e.target.value }
                      })
                    }
                    className="w-full min-h-[300px] p-4 font-mono text-sm border-2 rounded-md"
                    placeholder="<h1>Your content here...</h1>"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-sm font-medium">Content (JSON)</label>
                  <textarea
                    value={JSON.stringify(editingPage.content, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditingPage({ ...editingPage, content: parsed });
                      } catch (err) {
                        // Invalid JSON
                      }
                    }}
                    className="w-full min-h-[400px] p-4 font-mono text-sm border rounded-md"
                  />
                </div>
              )}

              <div className="flex items-center gap-4 border-t pt-4">
                <Switch
                  checked={editingPage.is_published}
                  onCheckedChange={(checked) =>
                    setEditingPage({ ...editingPage, is_published: checked })
                  }
                />
                <label className="text-sm font-medium">Published</label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={savePage}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Page
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisualPageEditor;
