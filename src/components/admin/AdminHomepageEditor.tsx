import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextToolbar from "@/components/RichTextToolbar";
import { Save, Eye, Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Section {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
}

const AdminHomepageEditor = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setSections(data?.map((s: any, idx: number) => ({
        id: s.id,
        type: s.section_name,
        title: s.title || s.section_name,
        content: s.content || {},
        order: idx
      })) || []);
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

  const saveSection = async (section: Section) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cms_sections")
        .update({ 
          content: section.content,
          title: section.title,
          updated_at: new Date().toISOString()
        })
        .eq("id", section.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section saved successfully"
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

  const updateSectionContent = (sectionId: string, field: string, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: {
            ...section.content,
            [field]: value
          }
        };
      }
      return section;
    }));
  };

  const addNewSection = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .insert({
          section_name: `custom_${Date.now()}`,
          title: "New Section",
          content: { html: "", title: "New Section", subtitle: "" },
          display_order: sections.length,
          is_published: true
        })
        .select()
        .single();

      if (error) throw error;

      setSections([...sections, {
        id: data.id,
        type: data.section_name,
        title: data.title,
        content: data.content,
        order: sections.length
      }]);

      toast({
        title: "Success",
        description: "New section added"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const { error } = await supabase
        .from("cms_sections")
        .delete()
        .eq("id", sectionId);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== sectionId));

      toast({
        title: "Success",
        description: "Section deleted"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Update order in database
      try {
        await Promise.all(
          newSections.map((section, idx) =>
            supabase
              .from("cms_sections")
              .update({ display_order: idx })
              .eq("id", section.id)
          )
        );

        toast({
          title: "Success",
          description: "Section order updated",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const SortableSection = ({ section, index }: { section: Section; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: section.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <Card ref={setNodeRef} style={style} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-move">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              value={section.title}
              onChange={(e) => {
                const newSections = [...sections];
                newSections[index].title = e.target.value;
                setSections(newSections);
              }}
              className="font-semibold text-lg max-w-xs"
            />
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {section.type}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => saveSection(section)}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteSection(section.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

            <div className="space-y-4">
              {/* Common fields for all sections */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={section.content.title || ""}
                    onChange={(e) => updateSectionContent(section.id, "title", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={section.content.subtitle || ""}
                    onChange={(e) => updateSectionContent(section.id, "subtitle", e.target.value)}
                  />
                </div>
              </div>

              {/* Rich text editor */}
              <div>
                <Label>Content (HTML)</Label>
                <div className="border rounded-lg">
                  <RichTextToolbar
                    onCommand={(cmd, value) => {
                      // Handle rich text commands
                      console.log("Command:", cmd, value);
                    }}
                    className="border-b p-2"
                  />
                  <textarea
                    value={section.content.html || ""}
                    onChange={(e) => updateSectionContent(section.id, "html", e.target.value)}
                    className="w-full min-h-[200px] p-4 font-mono text-sm focus:outline-none"
                    placeholder="Enter HTML content or use the toolbar above..."
                  />
                </div>
              </div>

              {/* Preview */}
              {section.content.html && (
                <div>
                  <Label>Preview</Label>
                  <div
                    className="border rounded-lg p-4 bg-background"
                    dangerouslySetInnerHTML={{ __html: section.content.html }}
                  />
                </div>
              )}
            </div>
          </Card>
        );
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Homepage Editor</h2>
              <p className="text-muted-foreground">Drag and drop to reorder sections</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.open("/", "_blank")}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={addNewSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <SortableSection key={section.id} section={section} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      );
    };

export default AdminHomepageEditor;
