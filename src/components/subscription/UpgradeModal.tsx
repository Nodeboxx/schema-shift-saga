import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  yearlyPrice: number;
}

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const UpgradeModal = ({ open, onOpenChange, onSuccess }: UpgradeModalProps) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'wire'>('card');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("content")
        .eq("section_name", "pricing_plans")
        .single();

      if (error) throw error;
      if (data?.content) {
        const content = data.content as any;
        setPlans(content.plans || []);
      }
    } catch (error: any) {
      console.error("Error loading plans:", error);
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a plan",
        variant: "destructive"
      });
      return;
    }

    if (!agreed) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const formData = new FormData(e.target as HTMLFormElement);
      const displayPrice = billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price;
      const status = (paymentMethod === 'bkash' || paymentMethod === 'wire') ? 'pending' : 'active';

      const { error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          tier: selectedPlan.id as any,
          status: status,
          amount: displayPrice,
          billing_cycle: billingCycle,
          payment_method: paymentMethod,
          payment_reference: formData.get('transaction_id') as string || formData.get('card') as string || 'wire_transfer',
        });

      if (error) throw error;

      if (status === 'active') {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

        await supabase
          .from("profiles")
          .update({
            subscription_tier: selectedPlan.id as any,
            subscription_status: "active",
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: endDate.toISOString(),
          })
          .eq("id", user.id);
      }

      toast({
        title: "Success!",
        description: status === 'pending' 
          ? "Your upgrade request has been submitted for approval" 
          : "Your subscription has been upgraded"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upgrade Your Subscription</DialogTitle>
        </DialogHeader>

        {!selectedPlan ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('monthly')}
                size="sm"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                onClick={() => setBillingCycle('yearly')}
                size="sm"
              >
                Yearly
              </Button>
              {billingCycle === 'yearly' && (
                <Badge variant="secondary">Save up to 20%</Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {plans.filter(p => p.id !== 'free').map((plan) => {
                const displayPrice = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
                return (
                  <div key={plan.id} className="border rounded-lg p-6 space-y-4 hover:border-primary transition-colors">
                    <div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <div className="text-3xl font-bold mt-2">
                        {plan.currency}{displayPrice}
                        <span className="text-lg text-muted-foreground">/{billingCycle === 'yearly' ? 'year' : plan.period}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => setSelectedPlan(plan)} className="w-full">
                      Select {plan.name}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpgrade} className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{selectedPlan.name}</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPlan(null)}>
                  Change Plan
                </Button>
              </div>
              <div className="text-2xl font-bold">
                {selectedPlan.currency}{billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price}
                <span className="text-sm text-muted-foreground">/{billingCycle === 'yearly' ? 'year' : selectedPlan.period}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                >
                  💳 Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'bkash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('bkash')}
                >
                  📱 bKash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'wire' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('wire')}
                >
                  🏦 Wire
                </Button>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <>
                <div>
                  <Label htmlFor="card">Card Number</Label>
                  <Input id="card" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'bkash' && (
              <>
                <div>
                  <Label htmlFor="bkash_number">bKash Number</Label>
                  <Input id="bkash_number" placeholder="01XXXXXXXXX" required />
                </div>
                <div>
                  <Label htmlFor="transaction_id">Transaction ID</Label>
                  <Input id="transaction_id" placeholder="ABCD1234567" required />
                </div>
              </>
            )}

            {paymentMethod === 'wire' && (
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Wire Transfer Details:</p>
                <p>Bank: Example Bank Ltd.</p>
                <p>Account: MedDexPro Technologies</p>
                <p>Account Number: 1234567890</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox 
                id="terms" 
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the terms and conditions
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Complete Upgrade"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
