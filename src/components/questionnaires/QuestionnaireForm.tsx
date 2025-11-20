import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  type: "text" | "textarea" | "radio" | "checkbox" | "scale";
  question: string;
  required: boolean;
  options?: string[];
}

interface QuestionnaireFormProps {
  templateId: string;
  title: string;
  description: string;
  questions: Question[];
  patientId: string;
  appointmentId?: string;
  journeyId?: string;
  onSuccess: () => void;
}

export const QuestionnaireForm = ({
  templateId,
  title,
  description,
  questions,
  patientId,
  appointmentId,
  journeyId,
  onSuccess,
}: QuestionnaireFormProps) => {
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);

  const updateResponse = (index: number, value: any) => {
    setResponses({ ...responses, [index]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required questions
      const missingRequired = questions.some(
        (q, i) => q.required && !responses[i]
      );

      if (missingRequired) {
        toast({
          title: "Missing required fields",
          description: "Please answer all required questions",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("questionnaire_responses").insert({
        template_id: templateId,
        patient_id: patientId,
        appointment_id: appointmentId,
        journey_id: journeyId,
        responses: Object.entries(responses).map(([index, answer]) => ({
          question: questions[parseInt(index)].question,
          answer,
        })),
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({ title: "Questionnaire submitted successfully" });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error submitting questionnaire",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="space-y-3">
              <Label className="text-base">
                {question.question}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {question.type === "text" && (
                <Input
                  value={responses[index] || ""}
                  onChange={(e) => updateResponse(index, e.target.value)}
                  required={question.required}
                />
              )}

              {question.type === "textarea" && (
                <Textarea
                  value={responses[index] || ""}
                  onChange={(e) => updateResponse(index, e.target.value)}
                  required={question.required}
                  rows={4}
                />
              )}

              {question.type === "radio" && (
                <RadioGroup
                  value={responses[index]}
                  onValueChange={(value) => updateResponse(index, value)}
                  required={question.required}
                >
                  {question.options?.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${index}-${i}`} />
                      <Label htmlFor={`${index}-${i}`} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "checkbox" && (
                <div className="space-y-2">
                  {question.options?.map((option, i) => {
                    const checked = responses[index]?.includes(option);
                    return (
                      <div key={i} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${index}-${i}`}
                          checked={checked}
                          onCheckedChange={(checked) => {
                            const current = responses[index] || [];
                            const updated = checked
                              ? [...current, option]
                              : current.filter((v: string) => v !== option);
                            updateResponse(index, updated);
                          }}
                        />
                        <Label htmlFor={`${index}-${i}`} className="font-normal">
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}

              {question.type === "scale" && (
                <div className="space-y-2">
                  <Slider
                    value={[responses[index] || 5]}
                    onValueChange={([value]) => updateResponse(index, value)}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 - Poor</span>
                    <span className="font-semibold text-foreground">
                      {responses[index] || 5}
                    </span>
                    <span>10 - Excellent</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Questionnaire"}
      </Button>
    </form>
  );
};
