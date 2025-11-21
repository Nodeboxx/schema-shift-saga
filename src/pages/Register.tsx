import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight, Home, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/meddexpro-logo.png";

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
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<"clinic_admin" | "doctor">("doctor");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [experience, setExperience] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

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
        navigate("/register");
        return;
      }

      // Check if there's a redirect URL
      if (redirectUrl && redirectUrl !== '/dashboard') {
        navigate(redirectUrl);
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

  const handleSignupDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // For doctors, validate additional fields
    if (userType === "doctor") {
      if (!licenseNumber) {
        toast({
          title: "Missing License",
          description: "Please enter your BMDC registration number",
          variant: "destructive",
        });
        return;
      }
    }

    // Direct signup without plan selection
    setLoading(true);

    const signupRedirectUrl = searchParams.get('redirect') 
      ? `${window.location.origin}${searchParams.get('redirect')}`
      : `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: signupRedirectUrl,
        data: {
          full_name: fullName,
          user_type: userType,
          specialty: userType === "doctor" ? specialty : null,
          license_number: userType === "doctor" ? `BMDC Reg. No-${licenseNumber}` : null,
          consultation_fee: userType === "doctor" ? consultationFee : null,
          experience: userType === "doctor" ? experience : null,
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
        description: "Account created successfully. Logging you in...",
      });
      
      // Auto login
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
    setLoading(false);
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

    const signupRedirectUrl = searchParams.get('redirect') 
      ? `${window.location.origin}${searchParams.get('redirect')}`
      : `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: signupRedirectUrl,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Logo and Header - Centered */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="MedDexPro" className="h-16 md:h-20" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Welcome to MedDexPro
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Your complete healthcare management solution
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-sm">
            ← Back to Home
          </Button>
        </div>

        <Card className="overflow-hidden shadow-xl border border-border/20 bg-card/80 backdrop-blur-xl rounded-3xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1.5 h-auto bg-muted/50 m-6 mb-0 rounded-xl">
              <TabsTrigger value="login" className="text-sm font-medium py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm font-medium py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-5 max-w-md mx-auto px-8 py-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2">Sign In</h3>
                  <p className="text-muted-foreground text-sm">Access your MedDexPro account</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 rounded-lg"
                  />
                </div>
                <Button type="submit" className="w-full h-10 text-sm font-medium rounded-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up for free
                  </button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              {signupStep === "details" ? (
                <form onSubmit={handleSignupDetails} className="space-y-4 max-w-md mx-auto px-8 py-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-semibold mb-2">Create Account</h3>
                    <p className="text-muted-foreground text-sm">Join MedDexPro today</p>
                  </div>

                  {/* User Type Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={userType === "clinic_admin" ? "default" : "outline"}
                      onClick={() => setUserType("clinic_admin")}
                      className="w-full h-9 text-sm rounded-lg"
                    >
                      Clinic
                    </Button>
                    <Button
                      type="button"
                      variant={userType === "doctor" ? "default" : "outline"}
                      onClick={() => setUserType("doctor")}
                      className="w-full h-9 text-sm rounded-lg"
                    >
                      Doctor
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Dr. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-10 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>

                  {userType === "doctor" && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="specialty" className="text-sm font-medium">Specialty</Label>
                        <Input
                          id="specialty"
                          type="text"
                          placeholder="e.g., Cardiology, Pediatrics"
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="license" className="text-sm font-medium">BMDC Registration Number *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            BMDC Reg. No-
                          </span>
                          <Input
                            id="license"
                            type="text"
                            placeholder="12345"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            required
                            className="pl-32 h-10 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="fee" className="text-sm font-medium">Consultation Fee (৳)</Label>
                          <Input
                            id="fee"
                            type="number"
                            placeholder="500"
                            value={consultationFee}
                            onChange={(e) => setConsultationFee(e.target.value)}
                            className="h-10 rounded-lg"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="experience" className="text-sm font-medium">Experience (years)</Label>
                          <Input
                            id="experience"
                            type="number"
                            placeholder="5"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="h-10 rounded-lg"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {userType === "clinic_admin" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="clinic-name" className="text-sm font-medium">Clinic Name</Label>
                      <Input
                        id="clinic-name"
                        type="text"
                        placeholder="City Medical Center"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        required
                        className="h-10 rounded-lg"
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full h-10 text-sm font-medium rounded-lg mt-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
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
