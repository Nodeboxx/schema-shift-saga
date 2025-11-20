import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Field {
  id: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "dropdown" | "date" | "number";
  options?: string[];
  defaultValue?: string;
}

interface Section {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  fields?: Field[];
  type: "form" | "richtext";
}

interface CustomTemplateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: any) => void;
}

const CustomTemplateBuilder = ({
  open,
  onOpenChange,
  onSave,
}: CustomTemplateBuilderProps) => {
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [sections, setSections] = useState<Section[]>([
    {
      id: "section_1",
      title: "New Section",
      enabled: true,
      order: 0,
      type: "form",
      fields: [],
    },
  ]);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const fieldTypes = [
    { value: "text", label: "Text Input" },
    { value: "textarea", label: "Text Area" },
    { value: "checkbox", label: "Checkbox" },
    { value: "dropdown", label: "Dropdown" },
    { value: "date", label: "Date Picker" },
    { value: "number", label: "Number Input" },
  ];

  const addSection = () => {
    const newSection: Section = {
      id: `section_${Date.now()}`,
      title: "New Section",
      enabled: true,
      order: sections.length,
      type: "form",
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const addField = (sectionId: string) => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
    };
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, fields: [...(s.fields || []), newField] }
          : s
      )
    );
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields?.filter((f) => f.id !== fieldId) }
          : s
      )
    );
  };

  const updateField = (
    sectionId: string,
    fieldId: string,
    updates: Partial<Field>
  ) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields?.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : s
      )
    );
  };

  const handleSave = () => {
    if (!templateName) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    const template = {
      id: `custom_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      specialty: "Custom",
      sections: sections,
      custom: true,
    };

    onSave(template);
    onOpenChange(false);

    toast({
      title: "Success",
      description: "Custom template created successfully",
    });

    // Reset form
    setTemplateName("");
    setTemplateDescription("");
    setSections([
      {
        id: "section_1",
        title: "New Section",
        enabled: true,
        order: 0,
        type: "form",
        fields: [],
      },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build Custom Template</DialogTitle>
          <DialogDescription>
            Create your own prescription template with custom sections and
            fields
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., My Custom Template"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe your template..."
                rows={2}
              />
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Template Sections</Label>
              <Button onClick={addSection} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Section
              </Button>
            </div>

            {sections.map((section) => (
              <Card key={section.id} className="p-4">
                <div className="space-y-3">
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateSection(section.id, { title: e.target.value })
                      }
                      className="flex-1"
                      placeholder="Section Title"
                    />
                    <Select
                      value={section.type}
                      onValueChange={(value: "form" | "richtext") =>
                        updateSection(section.id, { type: value })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="form">Form Fields</SelectItem>
                        <SelectItem value="richtext">Rich Text</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Section Fields (if form type) */}
                  {section.type === "form" && (
                    <div className="ml-8 space-y-2">
                      {section.fields?.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                        >
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(section.id, field.id, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Field Label"
                            className="flex-1 h-8 text-sm"
                          />
                          <Select
                            value={field.type}
                            onValueChange={(value: any) =>
                              updateField(section.id, field.id, { type: value })
                            }
                          >
                            <SelectTrigger className="w-[140px] h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeField(section.id, field.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addField(section.id)}
                        className="w-full"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Field
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTemplateBuilder;
