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
import { Plus, Edit, Trash2, Save, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  price: number;
  sale_price?: number | null;
  sku?: string | null;
  stock_quantity: number;
  stock_status: string;
  featured: boolean;
  categories: string[];
  tags: string[];
  images: any;
  attributes: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
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

  const createProduct = () => {
    setEditingProduct({
      id: "",
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: 0,
      sale_price: 0,
      sku: "",
      stock_quantity: 0,
      stock_status: "in_stock",
      featured: false,
      categories: [],
      tags: [],
      images: [],
      attributes: {},
      is_published: false,
      created_at: "",
      updated_at: ""
    });
    setOpen(true);
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        const { error } = await supabase
          .from("products")
          .update({
            name: editingProduct.name,
            slug: editingProduct.slug,
            description: editingProduct.description,
            short_description: editingProduct.short_description,
            price: editingProduct.price,
            sale_price: editingProduct.sale_price,
            sku: editingProduct.sku,
            stock_quantity: editingProduct.stock_quantity,
            stock_status: editingProduct.stock_status,
            featured: editingProduct.featured,
            categories: editingProduct.categories,
            tags: editingProduct.tags,
            images: editingProduct.images,
            is_published: editingProduct.is_published,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert({
            name: editingProduct.name,
            slug: editingProduct.slug,
            description: editingProduct.description,
            short_description: editingProduct.short_description,
            price: editingProduct.price,
            sale_price: editingProduct.sale_price,
            sku: editingProduct.sku,
            stock_quantity: editingProduct.stock_quantity,
            stock_status: editingProduct.stock_status,
            featured: editingProduct.featured,
            categories: editingProduct.categories,
            tags: editingProduct.tags,
            images: editingProduct.images,
            is_published: editingProduct.is_published
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Product saved successfully"
      });

      setOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted"
      });

      loadProducts();
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
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Products
          </h2>
          <p className="text-muted-foreground">WooCommerce-style product management</p>
        </div>
        <Button onClick={createProduct}>
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{product.sku || "N/A"}</code>
                </TableCell>
                <TableCell>
                  {product.sale_price ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-muted-foreground">${product.price}</span>
                      <span className="text-green-600 font-semibold">${product.sale_price}</span>
                    </div>
                  ) : (
                    <span>${product.price}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={product.stock_quantity > 0 ? "text-green-600" : "text-destructive"}>
                    {product.stock_quantity} units
                  </span>
                </TableCell>
                <TableCell>
                  <Switch checked={product.is_published} disabled />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingProduct(product);
                        setOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteProduct(product.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Product Name *</Label>
                    <Input
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Slug *</Label>
                    <Input
                      value={editingProduct.slug}
                      onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                      placeholder="product-slug"
                    />
                  </div>
                </div>

                <div>
                  <Label>Short Description</Label>
                  <Input
                    value={editingProduct.short_description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Regular Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Sale Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.sale_price || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>SKU</Label>
                    <Input
                      value={editingProduct.sku || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={editingProduct.stock_quantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Stock Status</Label>
                  <select
                    value={editingProduct.stock_status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_status: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="on_backorder">On Backorder</option>
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div>
                  <Label>Categories (comma-separated)</Label>
                  <Input
                    value={editingProduct.categories.join(", ")}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categories: e.target.value.split(",").map(s => s.trim()) })}
                    placeholder="Healthcare, Medical Equipment"
                  />
                </div>

                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={editingProduct.tags.join(", ")}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tags: e.target.value.split(",").map(s => s.trim()) })}
                    placeholder="prescription, medical, healthcare"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingProduct.featured}
                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, featured: checked })}
                  />
                  <Label>Featured Product</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingProduct.is_published}
                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_published: checked })}
                  />
                  <Label>Published</Label>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProduct}>
              <Save className="h-4 w-4 mr-2" />
              Save Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
