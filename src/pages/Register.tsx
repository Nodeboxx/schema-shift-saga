import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight, Home, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  featured: boolean;
  badge: string;
}

const Register = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<"details" | "plan">("details");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roleList = (roles || []).map((r: any) => r.role);

      if (roleList.includes("super_admin")) {
        navigate("/admin");
      } else if (roleList.includes("clinic_admin")) {
        navigate("/clinic");
      } else {
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  const handleSignupDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    setSignupStep("plan");
  };

  const handleSignup = async () => {
    if (!selectedPlan) {
      toast({
        title: "Select a Plan",
        description: "Please choose a subscription plan to continue",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          selected_plan: selectedPlan,
        },
      },
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify.",
      });
      
      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
      setSelectedPlan("");
      setSignupStep("details");
      setActiveTab("login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome to HealthScribe
          </h1>
          <p className="text-muted-foreground">Your complete healthcare management solution</p>
        </div>

        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14">
              <TabsTrigger value="login" className="text-lg">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-lg">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-8">
              <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Homepage
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="p-8">
              {signupStep === "details" ? (
                <form onSubmit={handleSignupDetails} className="space-y-6 max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Create Your Account</h3>
                    <p className="text-muted-foreground">Step 1 of 2: Your Information</p>
                  </div>
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Dr. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="doctor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 6 characters
                    </p>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Continue to Plan Selection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
                    <p className="text-muted-foreground">Step 2 of 2: Select the plan that fits your practice</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={cn(
                          "relative p-6 cursor-pointer transition-all hover:shadow-lg",
                          selectedPlan === plan.id && "border-2 border-primary shadow-xl",
                          plan.featured && "border-primary/50"
                        )}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                              {plan.badge}
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
                          <div className="flex items-baseline justify-center gap-1 mb-1">
                            <span className="text-3xl font-bold text-primary">
                              {plan.currency}{plan.price}
                            </span>
                            <span className="text-muted-foreground">/{plan.period}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>

                        <ul className="space-y-2 mb-4">
                          {plan.features.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 5 && (
                            <li className="text-xs text-muted-foreground">
                              +{plan.features.length - 5} more features
                            </li>
                          )}
                        </ul>

                        {selectedPlan === plan.id && (
                          <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
                        )}
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-4 max-w-md mx-auto">
                    <Button
                      variant="outline"
                      onClick={() => setSignupStep("details")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSignup}
                      disabled={loading || !selectedPlan}
                      className="flex-1"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Complete Signup
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Register;
