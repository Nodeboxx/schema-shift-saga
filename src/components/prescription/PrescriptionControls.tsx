import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import RichTextToolbar from "../RichTextToolbar";
import { supabase } from "@/integrations/supabase/client";

interface PrescriptionControlsProps {
  prescriptionId?: string;
  userId?: string;
  onRichTextCommand?: (command: string, value?: string) => void;
}

const PrescriptionControls = ({ prescriptionId, userId, onRichTextCommand }: PrescriptionControlsProps) => {
  const navigate = useNavigate();

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
          .no-print {
            display: none !important;
          }
          .print-only {
            display: flex !important;
          }
          #page-wrapper {
            padding-top: 0 !important;
          }
          body {
            padding-top: 0 !important;
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
        <div style={{ display: "block", textAlign: "center", margin: "10px auto" }}>
          <Button
            onClick={handleGoHome}
            style={{
              padding: "10px 15px",
              margin: "0 5px",
              backgroundColor: "#6c757d",
              color: "white",
              fontWeight: 600,
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={handlePrint}
            style={{
              padding: "10px 15px",
              margin: "0 5px",
              backgroundColor: "#c00",
              color: "white",
              fontWeight: 600,
            }}
          >
            Print Prescription
          </Button>
          <Button
            onClick={handleLogout}
            style={{
              padding: "10px 15px",
              margin: "0 5px",
              backgroundColor: "#dc3545",
              color: "white",
              fontWeight: 600,
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <div style={{ marginTop: "10px", padding: "10px", background: "#f5f5f5", borderTop: "1px solid #ccc" }}>
          <RichTextToolbar onCommand={handleCommand} />
        </div>
      </div>
    </>
  );
};

export default PrescriptionControls;
