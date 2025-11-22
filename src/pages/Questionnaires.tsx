import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionnaireBuilder } from "@/components/questionnaires/QuestionnaireBuilder";
import { QuestionnaireList } from "@/components/questionnaires/QuestionnaireList";
import { Plus, FileText } from "lucide-react";

const Questionnaires = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  return (
    <AppLayout>
      <SubscriptionGate feature="questionnaires">
        <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Patient Questionnaires</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage pre-consultation questionnaires for patients
              </p>
            </div>
            <Button onClick={() => setShowBuilder(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <Tabs defaultValue="templates" className="space-y-6 md:space-y-8">
            <TabsList className="w-full grid grid-cols-2 bg-blue-50 p-1 gap-1 mb-4">
              <TabsTrigger 
                value="templates" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
              >
                My Templates
              </TabsTrigger>
              <TabsTrigger 
                value="responses" 
                className="text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 data-[state=inactive]:text-muted-foreground"
              >
                Patient Responses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-20 pt-6">
              <QuestionnaireList onView={setPreviewTemplate} />
            </TabsContent>

            <TabsContent value="responses" className="mt-20 pt-6">
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Response viewer coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">Create Questionnaire Template</DialogTitle>
              </DialogHeader>
              <QuestionnaireBuilder
                onSuccess={() => {
                  setShowBuilder(false);
                  window.location.reload();
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">{previewTemplate?.title}</DialogTitle>
              </DialogHeader>
              {previewTemplate && (
                <div className="space-y-4">
                  <p className="text-xs md:text-sm text-muted-foreground">{previewTemplate.description}</p>
                  <div className="space-y-3 md:space-y-4">
                    {previewTemplate.questions.map((q: any, i: number) => (
                      <div key={i} className="border-l-2 border-primary pl-3 md:pl-4">
                        <p className="font-medium text-sm md:text-base">
                          {i + 1}. {q.question}
                          {q.required && <span className="text-destructive ml-1">*</span>}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">Type: {q.type}</p>
                        {q.options && (
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Options: {q.options.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SubscriptionGate>
    </AppLayout>
  );
};

export default Questionnaires;
