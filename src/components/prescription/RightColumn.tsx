import { useState } from "react";
import { Button } from "@/components/ui/button";
import MedicineAutocomplete from "./MedicineAutocomplete";
import DoseSelector from "./DoseSelector";

interface Medicine {
  id: string;
  type: "medicine" | "category";
  name?: string;
  details?: string;
  dose?: string;
  categoryContent?: string;
}

interface RightColumnProps {
  width: number;
}

const RightColumn = ({ width }: RightColumnProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: Date.now().toString(),
        type: "medicine",
        name: "",
        details: "",
        dose: "",
      },
    ]);
  };

  const addCategory = () => {
    setMedicines([
      ...medicines,
      {
        id: Date.now().toString(),
        type: "category",
        categoryContent: "▶️ New Category",
      },
    ]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: string, value: string) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  return (
    <div style={{
      flexBasis: `${width}%`,
      background: "#fff",
      padding: "10px",
      position: "relative",
      minWidth: "300px",
      display: "flex",
      flexDirection: "column",
      overflow: "visible",
    }}>
      <h1 style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "48px",
        fontWeight: "bold",
        color: "#333",
        margin: 0,
        lineHeight: 1,
      }}>
        Rx
      </h1>

      <div style={{
        marginTop: "15px",
        paddingLeft: "5px",
        fontSize: "14px",
        lineHeight: "1.8",
        flexGrow: 1,
        overflow: "visible",
        minHeight: "100px",
      }}>
        {medicines.map((med) => (
          <div
            key={med.id}
            style={{
              marginBottom: "15px",
              paddingLeft: "10px",
              paddingRight: "30px",
              position: "relative",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <button
              onClick={() => removeMedicine(med.id)}
              style={{
                position: "absolute",
                top: "50%",
                right: "5px",
                transform: "translateY(-50%)",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                fontWeight: "bold",
                lineHeight: "20px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              X
            </button>

            {med.type === "category" ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateMedicine(med.id, "categoryContent", e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: med.categoryContent || "" }}
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0056b3",
                  marginTop: "20px",
                  marginBottom: "10px",
                  minHeight: "20px",
                }}
              />
            ) : (
              <>
                <div style={{ marginBottom: "8px" }}>
                  <MedicineAutocomplete
                    value={med.name || ""}
                    onSelect={(medicine) => {
                      const genericName = medicine.generics?.name || "";
                      const strength = medicine.strength || "";
                      
                      // Update brand name
                      updateMedicine(med.id, "name", medicine.brand_name);
                      
                      // Always show generic name, add strength if available
                      const details = strength 
                        ? `${genericName} - ${strength}` 
                        : genericName;
                      updateMedicine(med.id, "details", details);
                    }}
                  />
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateMedicine(med.id, "details", e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: med.details || "Brand, Generic, Strength..." }}
                  style={{
                    fontSize: "12px",
                    color: med.details ? "#555" : "#999",
                    paddingLeft: "15px",
                    fontStyle: med.details ? "normal" : "italic",
                    marginBottom: "8px",
                  }}
                />
                <DoseSelector
                  value={med.dose || ""}
                  onChange={(dose) => updateMedicine(med.id, "dose", dose)}
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        gap: "10px",
        marginTop: "15px",
      }}>
        <button
          onClick={addCategory}
          style={{
            flexGrow: 1,
            padding: "8px 5px",
            border: "1px dashed #28a745",
            color: "#28a745",
            fontWeight: 600,
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "4px",
            background: "#f0fff8",
          }}
        >
          + Add Category
        </button>
        <button
          onClick={addMedicine}
          style={{
            flexGrow: 1,
            padding: "8px 5px",
            border: "1px dashed #0056b3",
            color: "#0056b3",
            fontWeight: 600,
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "4px",
            background: "#f0f8ff",
          }}
        >
          + Add Medicine
        </button>
      </div>
    </div>
  );
};

export default RightColumn;
