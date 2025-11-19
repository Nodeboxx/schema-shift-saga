import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

interface PrescriptionControlsProps {
  prescriptionId?: string;
  userId?: string;
}

const PrescriptionControls = ({ prescriptionId, userId }: PrescriptionControlsProps) => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
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
        </div>
      </div>
    </>
  );
};

export default PrescriptionControls;
