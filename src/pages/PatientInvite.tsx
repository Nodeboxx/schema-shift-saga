import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

const PatientInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from("patient_invitations")
        .select(`
          *,
          patient:patients(name, email)
        `)
        .eq("token", token)
        .is("accepted_at", null)
        .single();

      if (error) throw error;

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: "Invitation Expired",
          description: "This invitation has expired. Please contact your doctor.",
          variant: "destructive",
        });
        return;
      }

      setInvitation(data);
    } catch (error: any) {
      console.error("Error loading invitation:", error);
      toast({
        title: "Invalid Invitation",
        description: "This invitation link is invalid or has already been used.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            full_name: invitation.patient.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Link patient to auth user
      const { error: updateError } = await supabase
        .from("patients")
        .update({
          auth_user_id: authData.user?.id,
          invitation_accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.patient_id);

      if (updateError) throw updateError;

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from("patient_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      if (inviteError) throw inviteError;

      // Assign patient role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user?.id,
          role: "patient",
        });

      if (roleError) throw roleError;

      toast({
        title: "Account Created!",
        description: "Your patient account has been created successfully.",
      });

      // Wait a bit then redirect to patient dashboard
      setTimeout(() => {
        navigate("/patient/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <CardTitle>Patient Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to create your patient account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={invitation.patient.name} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={invitation.email} disabled />
            </div>
            <div>
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Account & Accept Invitation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientInvite;