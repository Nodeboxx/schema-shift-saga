import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PrescriptionControls = () => {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    toast({
      title: "Data Saved",
      description: "Prescription data saved successfully",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality coming soon",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import",
      description: "Import functionality coming soon",
    });
  };

  return (
    <div style={{
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
          onClick={handleImport}
          style={{
            padding: "10px 15px",
            margin: "0 5px",
            backgroundColor: "#17a2b8",
            color: "white",
            fontWeight: 600,
          }}
        >
          Import JSON
        </Button>
        <Button
          onClick={handleExport}
          style={{
            padding: "10px 15px",
            margin: "0 5px",
            backgroundColor: "#007bff",
            color: "white",
            fontWeight: 600,
          }}
        >
          Export JSON
        </Button>
        <Button
          onClick={handleSave}
          style={{
            padding: "10px 15px",
            margin: "0 5px",
            backgroundColor: "#007bff",
            color: "white",
            fontWeight: 600,
          }}
        >
          Save Data
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

      <div style={{
        background: "#333",
        borderRadius: "5px",
        padding: "5px",
        marginTop: "10px",
        display: "inline-block",
      }}>
        <button style={{
          background: "#555",
          color: "white",
          border: "none",
          padding: "5px 8px",
          margin: "1px",
          cursor: "pointer",
          borderRadius: "3px",
          fontSize: "14px",
        }}>
          <b>B</b>
        </button>
        <button style={{
          background: "#555",
          color: "white",
          border: "none",
          padding: "5px 8px",
          margin: "1px",
          cursor: "pointer",
          borderRadius: "3px",
          fontSize: "14px",
        }}>
          <i>I</i>
        </button>
        <button style={{
          background: "#555",
          color: "white",
          border: "none",
          padding: "5px 8px",
          margin: "1px",
          cursor: "pointer",
          borderRadius: "3px",
          fontSize: "14px",
        }}>
          <u>U</u>
        </button>
      </div>
    </div>
  );
};

export default PrescriptionControls;
