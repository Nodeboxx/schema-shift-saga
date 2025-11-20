import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "scale";
  question: string;
  required: boolean;
  options?: string[];
}

export const QuestionnaireBuilder = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        type: "text",
        question: "",
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("questionnaire_templates").insert({
        title,
        description,
        category,
        doctor_id: user.id,
        questions: questions.map(({ id, ...q }) => q),
        is_active: true,
      });

      if (error) throw error;

      toast({ title: "Questionnaire template created successfully" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error creating template", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Template Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Pre-Consultation Form"
            required
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this questionnaire"
          />
        </div>

        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="pre-consultation">Pre-Consultation</SelectItem>
              <SelectItem value="follow-up">Follow-Up</SelectItem>
              <SelectItem value="symptoms">Symptoms Assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Questions</h3>
          <Button type="button" onClick={addQuestion} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Question Text</Label>
                <Input
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Short Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="radio">Single Choice</SelectItem>
                      <SelectItem value="checkbox">Multiple Choice</SelectItem>
                      <SelectItem value="scale">Rating Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Required</span>
                  </label>
                </div>
              </div>

              {(question.type === "radio" || question.type === "checkbox") && (
                <div>
                  <Label>Options (comma-separated)</Label>
                  <Input
                    value={question.options?.join(", ") || ""}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        options: e.target.value.split(",").map((o) => o.trim()),
                      })
                    }
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="submit" disabled={loading || questions.length === 0}>
        {loading ? "Creating..." : "Create Template"}
      </Button>
    </form>
  );
};
