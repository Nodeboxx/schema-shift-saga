import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Code, Monitor, GripVertical, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Section {
  id: string;
  section_name: string;
  title: string | null;
  content: any;
  display_order: number;
  is_published: boolean;
}

const VisualHomepageEditor = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<"visual" | "code">("visual");
  const [editingId, setEditingId] = useState<string | null>(null);
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
      setSections(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading sections",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (section: Section) => {
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
        title: "Saved",
        description: "Section updated successfully"
      });
      setEditingId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addNewSection = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .insert({
          section_name: `section_${Date.now()}`,
          title: "New Section",
          content: { 
            title: "Click to edit title",
            subtitle: "Click to edit subtitle",
            html: "<p>Click to edit content...</p>"
          },
          display_order: sections.length,
          is_published: true
        })
        .select()
        .single();

      if (error) throw error;

      setSections([...sections, data]);
      toast({
        title: "Section added",
        description: "New section created successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    
    try {
      const { error } = await supabase
        .from("cms_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== id));
      toast({
        title: "Deleted",
        description: "Section removed"
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      try {
        await Promise.all(
          newSections.map((section, idx) =>
            supabase
              .from("cms_sections")
              .update({ display_order: idx })
              .eq("id", section.id)
          )
        );
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const SortableSection = ({ section }: { section: Section }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
    const isEditing = editingId === section.id;

    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={`group relative border-2 rounded-lg ${isEditing ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'} bg-card transition-all`}
        onClick={() => !isEditing && setEditingId(section.id)}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 left-2 z-10">
          <div {...attributes} {...listeners} className="cursor-move p-2 bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>

        {/* Delete Button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            deleteSection(section.id);
          }}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>

        {activeMode === "visual" ? (
          <div className="p-8">
            {/* Visual Preview */}
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={section.content?.title || ""}
                  onChange={(e) => updateSection(section.id, { content: { ...section.content, title: e.target.value } })}
                  className="text-2xl font-bold border-2 border-primary"
                  placeholder="Title"
                  onClick={(e) => e.stopPropagation()}
                />
                <Input
                  value={section.content?.subtitle || ""}
                  onChange={(e) => updateSection(section.id, { content: { ...section.content, subtitle: e.target.value } })}
                  className="text-lg text-muted-foreground border-2 border-primary"
                  placeholder="Subtitle"
                  onClick={(e) => e.stopPropagation()}
                />
                <textarea
                  value={section.content?.html || ""}
                  onChange={(e) => updateSection(section.id, { content: { ...section.content, html: e.target.value } })}
                  className="w-full min-h-[150px] p-4 border-2 border-primary rounded-md font-mono text-sm"
                  placeholder="HTML content..."
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-2">
                  <Button onClick={(e) => { e.stopPropagation(); saveSection(section); }}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer hover:bg-accent/50 transition-colors p-4 rounded">
                {section.content?.title && (
                  <h2 className="text-3xl font-bold mb-2">{section.content.title}</h2>
                )}
                {section.content?.subtitle && (
                  <p className="text-lg text-muted-foreground mb-4">{section.content.subtitle}</p>
                )}
                {section.content?.html && (
                  <div dangerouslySetInnerHTML={{ __html: section.content.html }} />
                )}
                {!section.content?.title && !section.content?.subtitle && !section.content?.html && (
                  <p className="text-muted-foreground italic">Click to edit this section</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {/* Code Mode */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Section Name</label>
                <Input
                  value={section.section_name}
                  onChange={(e) => updateSection(section.id, { section_name: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content (JSON)</label>
                <textarea
                  value={JSON.stringify(section.content, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateSection(section.id, { content: parsed });
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="w-full min-h-[200px] p-4 border rounded-md font-mono text-sm"
                />
              </div>
              <Button onClick={() => saveSection(section)}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    );
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
          <h2 className="text-3xl font-bold">Homepage Visual Editor</h2>
          <p className="text-muted-foreground">Click any section to edit. Drag to reorder.</p>
        </div>
        <div className="flex gap-2">
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
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={addNewSection}>
            <Plus className="w-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sections.map((section) => (
              <SortableSection key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default VisualHomepageEditor;
