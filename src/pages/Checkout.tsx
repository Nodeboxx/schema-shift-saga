import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, ArrowLeft } from "lucide-react";
import { SubscriptionAuth } from "@/components/subscription/SubscriptionAuth";
import { getTierFromPlanId } from "@/lib/planMapping";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  yearlyPrice: number;
}

const Checkout = () => {
  const { plan = 'free' } = useParams<{ plan: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'wire'>('card');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const billingCycle = searchParams.get('billing') || 'monthly';

  useEffect(() => {
    loadPlanDetails();
    checkAuth();
  }, [plan]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const loadPlanDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("content")
        .eq("section_name", "pricing_plans")
        .single();

      if (error) throw error;

      if (data?.content) {
        const content = data.content as any;
        const plans = content.plans || [];
        const planDetails = plans.find((p: PricingPlan) => p.id === plan);
        
        if (planDetails) {
          setSelectedPlan(planDetails);
        }
      }
    } catch (error: any) {
      console.error("Error loading plan:", error);
      toast({
        title: "Error",
        description: "Failed to load plan details",
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(false);
    }
  };

  const isYearly = billingCycle === 'yearly';
  
  if (loadingPlan || !selectedPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading plan details...</p>
        </div>
      </div>
    );
  }

  // Get display price based on billing cycle
  const displayPrice = isYearly ? selectedPlan.yearlyPrice : selectedPlan.price;
  const displayPeriod = isYearly ? 'year' : selectedPlan.period;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData(e.target as HTMLFormElement);
      
      // Create order record (not subscription yet)
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          plan_id: plan,
          plan_name: selectedPlan.name,
          amount: displayPrice,
          currency: selectedPlan.currency,
          billing_cycle: billingCycle,
          payment_method: paymentMethod,
          payment_reference: formData.get('transaction_id') as string || formData.get('card') as string || 'wire_transfer',
          status: (paymentMethod === 'bkash' || paymentMethod === 'wire') ? 'pending' : 'approved',
        });

      if (orderError) throw orderError;

      // For instant payments (card), auto-approve and create subscription
      if (paymentMethod !== 'bkash' && paymentMethod !== 'wire') {
        const tier = getTierFromPlanId(plan); // Map plan ID to tier
        const isLifetime = plan === 'lifetime';
        const endDate = new Date();
        
        if (isLifetime) {
          endDate.setFullYear(endDate.getFullYear() + 100);
        } else {
          endDate.setMonth(endDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));
        }

        // Create subscription
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          tier: tier as any,
          status: 'active',
          amount: displayPrice,
          billing_cycle: billingCycle,
          payment_method: paymentMethod,
          is_lifetime: isLifetime,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        });

        // Update profile with correct tier
        await supabase.from("profiles").update({
          subscription_tier: tier as any,
          subscription_status: "active",
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: endDate.toISOString(),
        }).eq("id", user.id);
      }

      toast({
        title: "Success!",
        description: (paymentMethod === 'bkash' || paymentMethod === 'wire')
          ? "Your order has been submitted. Admin will review and approve your payment."
          : "Your subscription has been activated!"
      });

      navigate("/dashboard");
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
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-5xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Show Auth if not logged in */}
          {isAuthenticated === false && (
            <SubscriptionAuth onAuthSuccess={checkAuth} />
          )}

          {/* Plan Summary */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Plan Summary</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{selectedPlan.name}</h3>
              <div className="text-3xl font-bold">
                {selectedPlan.currency}{displayPrice}
                <span className="text-lg text-muted-foreground">/{displayPeriod}</span>
              </div>
              {isYearly && selectedPlan.yearlyPrice < selectedPlan.price * 12 && (
                <p className="text-sm text-emerald-600 font-medium mt-2">
                  💰 Save {selectedPlan.currency}{(selectedPlan.price * 12) - selectedPlan.yearlyPrice} with yearly billing
                </p>
              )}
              {selectedPlan.description && (
                <p className="text-sm text-muted-foreground mt-2">{selectedPlan.description}</p>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              {selectedPlan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{selectedPlan.currency}{displayPrice}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Billing cycle: {billingCycle}
              </p>
            </div>
          </Card>

          {/* Payment Form */}
          {isAuthenticated && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full"
                  >
                    💳 Card
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'bkash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('bkash')}
                    className="w-full"
                  >
                    📱 bKash
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'wire' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('wire')}
                    className="w-full"
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
                   <div className="bg-muted p-4 rounded-lg">
                     <p className="text-sm mb-2 font-medium">bKash Payment Instructions:</p>
                     <ol className="text-sm space-y-1 list-decimal list-inside">
                       <li>Send money to: 01XXX-XXXXXX</li>
                       <li>Enter amount: {selectedPlan.currency}{displayPrice}</li>
                       <li>Copy the transaction ID</li>
                       <li>Paste it above and submit</li>
                     </ol>
                   </div>
                </>
              )}

              {paymentMethod === 'wire' && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="text-sm font-medium">Wire Transfer Details:</p>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Bank Name:</span> Example Bank Ltd.
                    </div>
                    <div>
                      <span className="font-medium">Account Name:</span> MedDexPro Technologies
                    </div>
                    <div>
                      <span className="font-medium">Account Number:</span> 1234567890
                    </div>
                    <div>
                      <span className="font-medium">SWIFT/BIC:</span> EXAMPLEBDXXX
                    </div>
                     <div>
                       <span className="font-medium">Amount:</span> {selectedPlan.currency}{displayPrice}
                     </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    After transfer, please email the receipt to billing@meddexpro.com
                  </p>
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
                {loading ? "Processing..." : (
                  paymentMethod === 'wire' 
                    ? 'Complete Subscription' 
                    : `Pay ${selectedPlan.currency}${displayPrice}/${displayPeriod}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {paymentMethod === 'wire' 
                  ? 'Your subscription will be activated after payment verification' 
                  : 'Your payment is secure and encrypted. Cancel anytime.'}
              </p>
            </form>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;