import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClinicInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onSuccess: () => void;
}

export const ClinicInviteDialog = ({ open, onOpenChange, clinicId, onSuccess }: ClinicInviteDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"doctor" | "staff">("doctor");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if user exists with this email
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (!existingUser) {
        throw new Error("User not found. They need to create an account first.");
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("clinic_members")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("user_id", existingUser.id)
        .single();

      if (existingMember) {
        throw new Error("This user is already a member of the clinic");
      }

      // Add as member
      const { error } = await supabase.from("clinic_members").insert({
        clinic_id: clinicId,
        user_id: existingUser.id,
        role,
        invited_by: user.id,
        is_active: true,
      });

      if (error) throw error;

      // Assign role in user_roles
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: existingUser.id,
        role,
      });

      if (roleError && !roleError.message.includes("duplicate")) {
        console.warn("Role assignment warning:", roleError);
      }

      toast({ title: "Member invited successfully" });
      setEmail("");
      setRole("doctor");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error inviting member", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              User must have an account already
            </p>
          </div>

          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Inviting..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
