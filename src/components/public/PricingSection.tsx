import { Check, Shield, Monitor, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
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
                  {plan.price > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        {plan.currency}
                        {plan.price + 200}
                      </span>
                      <span className="text-4xl font-bold text-primary">
                        {plan.currency}
                        {plan.price}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">/{plan.period}</span>
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
                onClick={() => navigate(plan.buttonUrl || "/register")}
              >
                Get Started
              </Button>

              {plan.yearlyPrice > 0 && (
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Yearly: {plan.currency}
                  {plan.yearlyPrice}/year
                  <br />
                  <span className="text-primary font-semibold">
                    Save {plan.currency}
                    {plan.yearlySavings}
                  </span>
                </p>
              )}
            </Card>
          ))}
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
