import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingTemplate.id) {
        const { error } = await supabase
          .from('email_templates')
          .update(editingTemplate)
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([editingTemplate]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Template saved successfully'
      });

      setIsDialogOpen(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      });

      loadTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const openNewTemplate = () => {
    setEditingTemplate({
      name: '',
      subject: '',
      body_html: '',
      body_text: '',
      category: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading templates...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Email Templates</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate?.id ? 'Edit Template' : 'New Template'}
              </DialogTitle>
            </DialogHeader>

            {editingTemplate && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={editingTemplate.subject}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingTemplate.category}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, category: e.target.value })
                    }
                    placeholder="e.g., Appointment, Prescription"
                  />
                </div>

                <div>
                  <Label htmlFor="body_html">HTML Body</Label>
                  <Textarea
                    id="body_html"
                    rows={10}
                    value={editingTemplate.body_html}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, body_html: e.target.value })
                    }
                    placeholder="<html>...</html>"
                  />
                </div>

                <div>
                  <Label htmlFor="body_text">Plain Text Body</Label>
                  <Textarea
                    id="body_text"
                    rows={5}
                    value={editingTemplate.body_text}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, body_text: e.target.value })
                    }
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  Save Template
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.subject}</TableCell>
              <TableCell>{template.category || 'N/A'}</TableCell>
              <TableCell>
                <span className={template.is_active ? 'text-green-600' : 'text-gray-400'}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
