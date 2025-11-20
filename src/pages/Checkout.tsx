import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, ArrowLeft } from "lucide-react";

const Checkout = () => {
  const { plan = 'free' } = useParams<{ plan: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'wire'>('card');

  const planDetails: Record<string, any> = {
    free: {
      name: "Free",
      price: 0,
      period: "forever",
      features: [
        "5 prescriptions/month",
        "Basic templates",
        "Patient records",
        "Email support"
      ]
    },
    pro: {
      name: "Pro",
      price: 29,
      period: "per month",
      features: [
        "Unlimited prescriptions",
        "Advanced templates",
        "Voice typing",
        "Priority support",
        "Custom branding",
        "Analytics dashboard"
      ]
    },
    enterprise: {
      name: "Enterprise",
      price: 99,
      period: "per month",
      features: [
        "Everything in Pro",
        "Multi-doctor clinics",
        "Team collaboration",
        "API access",
        "Dedicated support",
        "Custom integrations"
      ]
    }
  };

  const selectedPlan = planDetails[plan || "free"] || planDetails.free;

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
        navigate("/login");
        return;
      }

      // Create subscription record
      const { error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          tier: plan as any,
          status: "active",
          amount: selectedPlan.price,
          billing_cycle: "monthly"
        });

      if (error) throw error;

      // Update profile
      await supabase
        .from("profiles")
        .update({
          subscription_tier: plan as any,
          subscription_status: "active"
        })
        .eq("id", user.id);

      toast({
        title: "Success!",
        description: "Your subscription has been activated"
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
          {/* Plan Summary */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Plan Summary</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{selectedPlan.name}</h3>
              <div className="text-3xl font-bold">
                ${selectedPlan.price}
                <span className="text-lg text-muted-foreground">/{selectedPlan.period}</span>
              </div>
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
                <span>${selectedPlan.price}</span>
              </div>
            </div>
          </Card>

          {/* Payment Form */}
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
                      <li>Enter amount: ${selectedPlan.price}</li>
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
                      <span className="font-medium">Account Name:</span> MedScribe Technologies
                    </div>
                    <div>
                      <span className="font-medium">Account Number:</span> 1234567890
                    </div>
                    <div>
                      <span className="font-medium">SWIFT/BIC:</span> EXAMPLEBDXXX
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> ${selectedPlan.price}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    After transfer, please email the receipt to billing@medscribe.com
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
                    : `Pay $${selectedPlan.price}/${selectedPlan.period}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {paymentMethod === 'wire' 
                  ? 'Your subscription will be activated after payment verification' 
                  : 'Your payment is secure and encrypted. Cancel anytime.'}
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;