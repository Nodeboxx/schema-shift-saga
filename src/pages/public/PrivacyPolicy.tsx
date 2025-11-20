import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_pages")
        .select("content")
        .eq("slug", "privacy-policy")
        .single();

      if (error) throw error;
      if (data?.content) {
        setContent(data.content);
      }
    } catch (error: any) {
      console.error("Error loading content:", error);
    }
  };

  if (!content) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <p>Loading...</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Last Updated: {content.lastUpdated}
          </p>

          <div className="prose prose-slate max-w-none space-y-6">
            {content.sections?.map((section: any, index: number) => (
              <section key={index}>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  {section.content}
                </p>
                {section.bullets && (
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    {section.bullets.map((bullet: string, idx: number) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {section.contact && (
                  <div className="mt-3 text-muted-foreground">
                    {section.contact.email && <p>Email: {section.contact.email}</p>}
                    {section.contact.dpo && <p>Data Protection Officer: {section.contact.dpo}</p>}
                  </div>
                )}
              </section>
            ))}
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
