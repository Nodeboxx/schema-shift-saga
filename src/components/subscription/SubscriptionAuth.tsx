import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionAuthProps {
  onAuthSuccess: () => void;
  planId?: string;
}

export const SubscriptionAuth = ({ onAuthSuccess, planId }: SubscriptionAuthProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [userType, setUserType] = useState<"doctor" | "clinic_admin">(
    planId === "clinic" ? "clinic_admin" : "doctor"
  );

  const isClinicPlan = planId === "clinic";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Logged in successfully",
      });

      onAuthSuccess();
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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const clinicName = formData.get("clinicName") as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
            specialty: userType === "clinic_admin" ? clinicName : undefined,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: userType === "clinic_admin" 
          ? "Your clinic registration is under review. You'll be notified once approved."
          : "Continue with your subscription",
      });

      onAuthSuccess();
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

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Login or Sign Up to Continue</h2>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" name="email" type="email" required />
            </div>

            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input id="login-password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignup} className="space-y-4">
            {!isClinicPlan && (
              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "doctor" | "clinic_admin")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor" className="font-normal cursor-pointer">
                      Doctor - Individual practice
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="clinic_admin" id="clinic_admin" />
                    <Label htmlFor="clinic_admin" className="font-normal cursor-pointer">
                      Clinic - Multi-doctor clinic or hospital
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div>
              <Label htmlFor="signup-name">Full Name</Label>
              <Input id="signup-name" name="fullName" required />
            </div>

            {userType === "clinic_admin" && (
              <div>
                <Label htmlFor="clinic-name">Clinic/Hospital Name</Label>
                <Input id="clinic-name" name="clinicName" required />
              </div>
            )}

            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" required />
            </div>

            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" name="password" type="password" required minLength={6} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
