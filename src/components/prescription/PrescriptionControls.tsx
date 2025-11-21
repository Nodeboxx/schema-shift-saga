import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, Printer, Send, MessageCircle, Mail, Save, Plus } from "lucide-react";
import RichTextToolbar from "../RichTextToolbar";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PrescriptionControlsProps {
  prescriptionId?: string;
  userId?: string;
  onRichTextCommand?: (command: string, value?: string) => void;
  patientName?: string;
  patientPhone?: string;
  onSave?: () => void;
  onAddPage?: () => void;
}

const PrescriptionControls = ({ prescriptionId, userId, onRichTextCommand, patientName, patientPhone, onSave, onAddPage }: PrescriptionControlsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [headerlessPrint, setHeaderlessPrint] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleWhatsAppShare = () => {
    const message = `Prescription for ${patientName || 'Patient'}\nView at: ${window.location.origin}/verify/${prescriptionId}`;
    const whatsappUrl = `https://wa.me/${patientPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleMessengerShare = () => {
    const url = `${window.location.origin}/verify/${prescriptionId}`;
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin)}`;
    window.open(messengerUrl, '_blank');
  };

  const handleEmailShare = async () => {
    if (!prescriptionId) {
      toast({
        title: "Error",
        description: "Please save the prescription first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get patient email
      const { data: prescription } = await supabase
        .from("prescriptions")
        .select("patient_id, patient_name")
        .eq("id", prescriptionId)
        .single();

      if (!prescription?.patient_id) {
        toast({
          title: "Error",
          description: "Patient information not found",
          variant: "destructive",
        });
        return;
      }

      const { data: patient } = await supabase
        .from("patients")
        .select("email, name")
        .eq("id", prescription.patient_id)
        .single();

      if (!patient?.email) {
        toast({
          title: "Error", 
          description: "Patient email not found. Please add email to patient record.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sending email...",
        description: "Please wait",
      });

      const { data, error } = await supabase.functions.invoke("send-prescription-email", {
        body: {
          prescriptionId,
          patientEmail: patient.email,
          patientName: patient.name || prescription.patient_name,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription email sent successfully!",
      });
    } catch (error: any) {
      console.error("Email error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const handleCommand = (command: string, value?: string) => {
    // Execute command on currently focused element
    if (value) {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false);
    }
  };

  return (
    <>
      <style>{`
        .print-only {
          display: none;
        }
        @media print {
          * {
            margin: 0 !important;
          }
          html, body {
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: flex !important;
          }
          #page-wrapper, #root, main, .container {
            padding: 0 !important;
            margin: 0 !important;
          }
          body {
            padding: 0 !important;
            margin: 0 !important;
          }
          .medicine-remove-btn {
            display: none !important;
          }
          .add-medicine-btn {
            display: none !important;
          }
          .dosage-icon {
            display: inline-block !important;
            width: 20px !important;
            height: 20px !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          button[style*="position: absolute"] {
            display: none !important;
          }
          ${headerlessPrint ? `
            .prescription-header {
              display: none !important;
            }
            .prescription-footer {
              display: none !important;
            }
          ` : ''}
        }
      `}</style>
      <div className="no-print" style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#e0e0e0",
        padding: "10px 0",
        zIndex: 998,
        borderBottom: "1px solid #ccc",
        width: "100%",
        margin: "0 auto",
        textAlign: "center",
        display: "block",
      }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", margin: "10px auto" }}>
          <Button
            onClick={handleGoHome}
            style={{
              padding: "10px 15px",
              backgroundColor: "#6c757d",
              color: "white",
              fontWeight: 600,
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          {onSave && (
            <Button
              onClick={onSave}
              style={{
                padding: "10px 15px",
                backgroundColor: "#28a745",
                color: "white",
                fontWeight: 600,
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Prescription
            </Button>
          )}
          <Button
            onClick={handlePrint}
            style={{
              padding: "10px 15px",
              backgroundColor: "#c00",
              color: "white",
              fontWeight: 600,
            }}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 10px" }}>
            <Switch 
              id="headerless" 
              checked={headerlessPrint}
              onCheckedChange={setHeaderlessPrint}
            />
            <Label htmlFor="headerless" style={{ margin: 0, cursor: "pointer", fontSize: "14px" }}>
              Header-less Print
            </Label>
          </div>

          {prescriptionId && (
            <>
              <Button
                onClick={handleWhatsAppShare}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#25D366",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={handleMessengerShare}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#0084FF",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Messenger
              </Button>
              <Button
                onClick={handleEmailShare}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#EA4335",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </>
          )}

          <Button
            onClick={handleLogout}
            style={{
              padding: "10px 15px",
              backgroundColor: "#dc3545",
              color: "white",
              fontWeight: 600,
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          {onAddPage && (
            <Button
              onClick={onAddPage}
              style={{
                padding: "10px 15px",
                backgroundColor: "#17a2b8",
                color: "white",
                fontWeight: 600,
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Page
            </Button>
          )}
        </div>
        <div style={{ marginTop: "10px", padding: "10px", background: "#f5f5f5", borderTop: "1px solid #ccc" }}>
          <RichTextToolbar onCommand={handleCommand} />
        </div>
      </div>
    </>
  );
};

export default PrescriptionControls;
