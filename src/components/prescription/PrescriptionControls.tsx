import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, Printer, Send, MessageCircle, Mail, Save, Plus, ZoomIn, ZoomOut, Columns2, File } from "lucide-react";
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
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  pageLayout?: 'single' | 'double';
  onPageLayoutChange?: (layout: 'single' | 'double') => void;
}

const PrescriptionControls = ({ prescriptionId, userId, onRichTextCommand, patientName, patientPhone, onSave, onAddPage, zoom = 1.3, onZoomChange, pageLayout = 'single', onPageLayoutChange }: PrescriptionControlsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [headerlessPrint, setHeaderlessPrint] = useState(false);

  const handlePrint = () => {
    if (headerlessPrint) {
      document.body.classList.add('print-headerless');
    } else {
      document.body.classList.remove('print-headerless');
    }
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
          /* Hide Lovable badge */
          [data-lovable-badge],
          .lovable-badge,
          a[href*="lovable"],
          a[href*="Lovable"],
          footer a,
          footer button {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          /* Reset double page layout for print */
          .prescription-page {
            margin: 0 auto !important;
            page-break-after: always;
          }
          body.print-headerless .prescription-header {
            display: none !important;
          }
          body.print-headerless .prescription-footer {
            display: none !important;
          }
        }
      `}</style>
      <div className="no-print fixed top-0 left-0 right-0 bg-muted/50 backdrop-blur-sm border-b border-border z-[998] shadow-sm">
        <div className="container mx-auto py-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Primary Actions Group */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGoHome}
                variant="secondary"
                size="sm"
                className="h-9 font-medium"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              {onSave && (
                <Button
                  onClick={onSave}
                  variant="default"
                  size="sm"
                  className="h-9 font-medium bg-secondary hover:bg-secondary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
              <Button
                onClick={handlePrint}
                variant="destructive"
                size="sm"
                className="h-9 font-medium"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>

            {/* Print Settings */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background/80 border border-border">
              <Switch 
                id="headerless" 
                checked={headerlessPrint}
                onCheckedChange={setHeaderlessPrint}
              />
              <Label htmlFor="headerless" className="cursor-pointer text-sm font-medium text-muted-foreground">
                Header-less
              </Label>
            </div>

            {/* Share Actions Group */}
            {prescriptionId && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleWhatsAppShare}
                  variant="outline"
                  size="sm"
                  className="h-9 font-medium hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={handleMessengerShare}
                  variant="outline"
                  size="sm"
                  className="h-9 font-medium hover:bg-[#0084FF]/10 hover:text-[#0084FF] hover:border-[#0084FF]/50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messenger
                </Button>
                <Button
                  onClick={handleEmailShare}
                  variant="outline"
                  size="sm"
                  className="h-9 font-medium hover:bg-[#EA4335]/10 hover:text-[#EA4335] hover:border-[#EA4335]/50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            )}

            {/* Secondary Actions */}
            <div className="flex items-center gap-2">
              {onAddPage && (
                <Button
                  onClick={onAddPage}
                  variant="outline"
                  size="sm"
                  className="h-9 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Page
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="h-9 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Rich Text Toolbar */}
          <div className="mt-3 pt-3 border-t border-border flex items-start justify-between gap-4">
            <div className="flex-1">
              <RichTextToolbar onCommand={handleCommand} />
            </div>

            {/* Zoom Controls */}
            {onZoomChange && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Page Layout Toggle */}
                {onPageLayoutChange && (
                  <div className="flex items-center gap-1 mr-2">
                    <Button
                      size="icon"
                      variant={pageLayout === 'single' ? 'default' : 'outline'}
                      onClick={() => onPageLayoutChange('single')}
                      className="h-8 w-8"
                      title="Single page view"
                    >
                      <File className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={pageLayout === 'double' ? 'default' : 'outline'}
                      onClick={() => onPageLayoutChange('double')}
                      className="h-8 w-8"
                      title="Two page view"
                    >
                      <Columns2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
                  className="h-8 w-8"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <div className="bg-secondary px-3 py-1.5 rounded-md font-semibold text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
                  className="h-8 w-8"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionControls;
