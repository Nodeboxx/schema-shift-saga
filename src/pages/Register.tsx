import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight, Home, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/medrxpro-logo.png";

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

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        navigate("/register");
        return;
      }

      // Check if there's a redirect URL
      if (redirectUrl && redirectUrl !== '/dashboard') {
        navigate(redirectUrl);
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        navigate("/dashboard");
        return;
      }

      const roleList = (roles || []).map((r: any) => r.role);

      if (roleList.includes("super_admin")) {
        navigate("/admin");
      } else if (roleList.includes("clinic_admin")) {
        navigate("/clinic");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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

      if (error) throw error;

      // For clinics, show different message and redirect to approval page
      if (userType === "clinic_admin") {
        toast({
          title: "Clinic Registration Received!",
          description: "Your clinic registration is pending approval. Our team will contact you within 24-48 hours.",
        });
        
        // Redirect to a clinic approval pending page
        setTimeout(() => {
          navigate("/clinic/pending-approval");
        }, 1500);
      } else {
        // For doctors, normal flow
        toast({
          title: "Success!",
          description: "Account created successfully. Logging you in...",
        });
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <img src={logo} alt="MedRxPro" className="h-10 sm:h-12 md:h-14" />
        </div>

        {/* Back to Home - Top Right */}
        <div className="fixed top-4 right-4 z-10">
          <Button variant="ghost" onClick={() => navigate("/")} size="sm" className="text-xs sm:text-sm">
            ← Home
          </Button>
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/40 backdrop-blur-xl">
          {/* LEFT SIDE - LOGIN */}
          <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="max-w-md mx-auto w-full">

              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to continue to MedRxPro</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">

                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl"
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
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-sm font-medium rounded-xl" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  New to MedRxPro?{" "}
                  <span className="text-primary font-semibold">Check the right side →</span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - SIGNUP */}
          <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-background lg:border-l border-t lg:border-t-0 border-border/20">

            <div className="max-w-md mx-auto w-full">
              {signupStep === "details" ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Get Started</h2>
                    <p className="text-muted-foreground">Create your MedRxPro account</p>
                  </div>

                  <form onSubmit={handleSignupDetails} className="space-y-4">
                    {/* Account Type Selector */}
                    <div className="space-y-2">
                      <Label htmlFor="account-type" className="text-sm font-medium">Account Type</Label>
                      <Select 
                        value={userType} 
                        onValueChange={(value) => setUserType(value as "doctor" | "clinic_admin")}
                      >
                        <SelectTrigger id="account-type" className="h-11 rounded-xl">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="doctor">Doctor - Individual practice</SelectItem>
                          <SelectItem value="clinic_admin">Clinic - Multi-doctor clinic or hospital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name" className="text-sm font-medium">
                        {userType === "clinic_admin" ? "Admin Full Name" : "Full Name"}
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={userType === "clinic_admin" ? "Admin Name" : "Dr. John Doe"}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-11 rounded-xl"
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
                        className="h-11 rounded-xl"
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
                        className="h-11 rounded-xl"
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
                            className="h-11 rounded-xl"
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
                              className="pl-32 h-11 rounded-xl"
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
                              className="h-11 rounded-xl"
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
                              className="h-11 rounded-xl"
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
                          className="h-11 rounded-xl"
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full h-11 text-sm font-medium rounded-xl mt-4" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <span className="text-primary font-semibold">Check the left side ←</span>
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
