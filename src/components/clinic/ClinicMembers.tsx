import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Shield } from "lucide-react";
import { ClinicInviteDialog } from "./ClinicInviteDialog";

export const ClinicMembers = ({ clinicId }: { clinicId: string }) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [clinicId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_members")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            specialization
          )
        `)
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({ title: "Error loading members", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this member from the clinic?")) return;

    try {
      const { error } = await supabase
        .from("clinic_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({ title: "Member removed successfully" });
      loadMembers();
    } catch (error: any) {
      toast({ title: "Error removing member", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button onClick={() => setInviteDialogOpen(true)} size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No team members yet. Invite your first member!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold">{member.profiles?.full_name || member.profiles?.email}</p>
                    <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                    {member.profiles?.specialization && (
                      <p className="text-xs text-muted-foreground">{member.profiles.specialization}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.role}
                  </Badge>
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ClinicInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        clinicId={clinicId}
        onSuccess={loadMembers}
      />
    </Card>
  );
};

export default ClinicMembers;
