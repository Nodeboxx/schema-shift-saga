import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { Edit, Eye, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: any;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
}

const AdminPages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [open, setOpen] = useState(false);
  const [jsonView, setJsonView] = useState("");
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

  const openEditor = (page: Page) => {
    setEditingPage(page);
    setJsonView(JSON.stringify(page.content, null, 2));
    setOpen(true);
  };

  const savePage = async () => {
    if (!editingPage) return;

    try {
      // Parse JSON view to update content
      const parsedContent = JSON.parse(jsonView);

      const { error } = await supabase
        .from("custom_pages")
        .update({
          title: editingPage.title,
          slug: editingPage.slug,
          content: parsedContent,
          meta_title: editingPage.meta_title,
          meta_description: editingPage.meta_description,
          is_published: editingPage.is_published,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingPage.id);

      if (error) throw error;

      toast({
        title: "Success",
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
          <p className="text-muted-foreground">
            Edit your website pages (About Us, Contact, Privacy Policy, Terms of Service)
          </p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No pages found
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">/{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={page.is_published}
                        onCheckedChange={() => togglePublish(page)}
                      />
                      <span className="text-sm">
                        {page.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(page.created_at).toLocaleDateString()}
                  </TableCell>
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
                        variant="default"
                        onClick={() => openEditor(page)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Page: {editingPage?.title}</DialogTitle>
          </DialogHeader>

          {editingPage && (
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                <TabsTrigger value="json">JSON Editor</TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Page Title</Label>
                    <Input
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>URL Slug</Label>
                    <Input
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Meta Title (SEO)</Label>
                    <Input
                      value={editingPage.meta_title || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                      placeholder="SEO title for search engines"
                    />
                  </div>
                  <div>
                    <Label>Meta Description (SEO)</Label>
                    <Input
                      value={editingPage.meta_description || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                      placeholder="SEO description for search engines"
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    💡 <strong>Tip:</strong> For advanced editing of page content (text, sections, etc.),
                    use the JSON Editor tab. The content is stored as structured data.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current page type: <code className="bg-background px-2 py-0.5 rounded">
                      {editingPage.content?.type || "N/A"}
                    </code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPage.is_published}
                    onCheckedChange={(checked) =>
                      setEditingPage({ ...editingPage, is_published: checked })
                    }
                  />
                  <Label>Publish this page</Label>
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-4 mt-4">
                <div>
                  <Label>Content JSON</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Edit the page content structure directly in JSON format
                  </p>
                  <Textarea
                    value={jsonView}
                    onChange={(e) => setJsonView(e.target.value)}
                    className="font-mono text-sm min-h-[500px]"
                    placeholder="Page content as JSON..."
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePage}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
