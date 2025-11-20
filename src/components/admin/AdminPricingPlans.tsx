import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  yearlyPrice: number;
  yearlySavings: number;
  featured: boolean;
  badge: string;
}

interface PricingContent {
  heading: string;
  subtitle: string;
  plans: PricingPlan[];
  benefits: Array<{ icon: string; text: string }>;
}

export const AdminPricingPlans = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<PricingContent>({
    heading: "",
    subtitle: "",
    plans: [],
    benefits: [],
  });

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("content")
        .eq("section_name", "pricing_plans")
        .single();

      if (error) throw error;
      if (data?.content) {
        setContent(data.content as any as PricingContent);
      }
    } catch (error: any) {
      console.error("Error loading pricing:", error);
    }
  };

  const savePricing = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("cms_sections")
        .update({ content: content as any })
        .eq("section_name", "pricing_plans");

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing plans updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPlan = () => {
    setContent({
      ...content,
      plans: [
        ...content.plans,
        {
          id: `plan_${Date.now()}`,
          name: "New Plan",
          price: 0,
          currency: "৳",
          period: "month",
          description: "",
          features: ["Feature 1"],
          yearlyPrice: 0,
          yearlySavings: 0,
          featured: false,
          badge: "",
        },
      ],
    });
  };

  const removePlan = (index: number) => {
    const newPlans = [...content.plans];
    newPlans.splice(index, 1);
    setContent({ ...content, plans: newPlans });
  };

  const updatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...content.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setContent({ ...content, plans: newPlans });
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...content.plans];
    newPlans[planIndex].features.push("New Feature");
    setContent({ ...content, plans: newPlans });
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...content.plans];
    newPlans[planIndex].features.splice(featureIndex, 1);
    setContent({ ...content, plans: newPlans });
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const newPlans = [...content.plans];
    newPlans[planIndex].features[featureIndex] = value;
    setContent({ ...content, plans: newPlans });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pricing Plans Management</h2>
          <p className="text-muted-foreground">Edit your pricing plans and features</p>
        </div>
        <Button onClick={savePricing} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Section Heading</Label>
            <Input
              value={content.heading}
              onChange={(e) => setContent({ ...content, heading: e.target.value })}
              placeholder="e.g., Simple, Transparent Pricing"
            />
          </div>
          <div>
            <Label>Section Subtitle</Label>
            <Textarea
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              placeholder="Brief description of your pricing"
              rows={2}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Plans</h3>
        <Button onClick={addPlan} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-6">
        {content.plans.map((plan, planIndex) => (
          <Card key={plan.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Plan {planIndex + 1}</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.featured}
                      onCheckedChange={(checked) => updatePlan(planIndex, "featured", checked)}
                    />
                    <Label>Featured</Label>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removePlan(planIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Plan Name</Label>
                  <Input
                    value={plan.name}
                    onChange={(e) => updatePlan(planIndex, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Badge Text (optional)</Label>
                  <Input
                    value={plan.badge}
                    onChange={(e) => updatePlan(planIndex, "badge", e.target.value)}
                    placeholder="e.g., Most Popular"
                  />
                </div>
                <div>
                  <Label>Monthly Price</Label>
                  <Input
                    type="number"
                    value={plan.price}
                    onChange={(e) => updatePlan(planIndex, "price", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Currency Symbol</Label>
                  <Input
                    value={plan.currency}
                    onChange={(e) => updatePlan(planIndex, "currency", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Yearly Price</Label>
                  <Input
                    type="number"
                    value={plan.yearlyPrice}
                    onChange={(e) => updatePlan(planIndex, "yearlyPrice", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Yearly Savings</Label>
                  <Input
                    type="number"
                    value={plan.yearlySavings}
                    onChange={(e) => updatePlan(planIndex, "yearlySavings", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={plan.description}
                  onChange={(e) => updatePlan(planIndex, "description", e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Features</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addFeature(planIndex)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(planIndex, featureIndex)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
