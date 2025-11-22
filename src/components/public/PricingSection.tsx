import { useState } from "react";
import { Check, Shield, Monitor, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
  buttonUrl?: string;
}

interface PricingSectionProps {
  content: {
    heading: string;
    subtitle: string;
    plans: PricingPlan[];
    benefits?: Array<{ icon: string; text: string }>;
  };
}

const iconMap: Record<string, any> = {
  Shield,
  Monitor,
  Clock,
};

export const PricingSection = ({ content }: PricingSectionProps) => {
  const { heading, subtitle, plans, benefits } = content;
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const getDisplayPrice = (plan: PricingPlan) => {
    return isYearly ? plan.yearlyPrice : plan.price;
  };

  const getPeriodText = () => {
    return isYearly ? "year" : "month";
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={cn(
              "font-medium transition-colors",
              !isYearly ? "text-foreground" : "text-muted-foreground"
            )}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={cn(
              "font-medium transition-colors",
              isYearly ? "text-foreground" : "text-muted-foreground"
            )}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500">
                Save up to ৳4,000
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan) => {
            const displayPrice = getDisplayPrice(plan);
            
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative p-8 hover:shadow-2xl transition-all duration-300",
                  plan.featured && "border-primary border-2 shadow-xl scale-105"
                )}
              >
                {plan.badge && (
                  <Badge
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1",
                      plan.featured ? "bg-primary" : "bg-emerald-500"
                    )}
                  >
                    {plan.badge}
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    {displayPrice > 0 ? (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          {plan.currency}
                          {isYearly ? displayPrice + 1000 : displayPrice + 200}
                        </span>
                        <span className="text-4xl font-bold text-primary">
                          {plan.currency}
                          {displayPrice.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-primary">Free</span>
                    )}
                    <span className="text-muted-foreground">/{getPeriodText()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full",
                    plan.featured && "bg-primary hover:bg-primary/90"
                  )}
                  variant={plan.featured ? "default" : "outline"}
                  onClick={() => navigate(`/checkout/${plan.id}?billing=${isYearly ? 'yearly' : 'monthly'}`)}
                >
                  Get Started
                </Button>

                {isYearly && plan.yearlySavings > 0 && (
                  <p className="text-center mt-4 text-sm">
                    <span className="text-emerald-600 font-semibold">
                      💰 Save {plan.currency}
                      {plan.yearlySavings.toLocaleString()} annually
                    </span>
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {benefits && benefits.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t">
            {benefits.map((benefit, idx) => {
              const Icon = iconMap[benefit.icon] || Shield;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
