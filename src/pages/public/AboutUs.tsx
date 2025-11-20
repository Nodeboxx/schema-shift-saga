import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HeartPulse, Users, Target, Award } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  HeartPulse,
  Users,
  Target,
  Award,
};

const AboutUs = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("content")
        .eq("section_name", "about_us")
        .single();

      if (error) throw error;
      if (data?.content) {
        setContent(data.content);
      }
    } catch (error: any) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <p>Loading...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!content) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <p>Content not found</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">{content.heading}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {content.subtitle}
            </p>
          </div>

          <Card className="p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-semibold mb-6">{content.mission.title}</h2>
            {content.mission.content.map((paragraph: string, index: number) => (
              <p key={index} className="text-lg text-muted-foreground leading-relaxed mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {content.values.map((value: any, index: number) => {
                const Icon = iconMap[value.icon] || HeartPulse;
                return (
                  <Card key={index} className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-purple-500/10">
            <h2 className="text-3xl font-semibold mb-6">{content.story.title}</h2>
            {content.story.content.map((paragraph: string, index: number) => (
              <p key={index} className="text-lg text-muted-foreground leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </Card>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-6">{content.cta.heading}</h2>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-purple-600" 
              onClick={() => navigate(content.cta.buttonUrl)}
            >
              {content.cta.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AboutUs;
