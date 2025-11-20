import { Button } from "@/components/ui/button";
import MedicineAutocomplete from "./MedicineAutocomplete";
import DoseSelector from "./DoseSelector";
import DurationSelector from "./DurationSelector";

interface Medicine {
  id: string;
  type: "medicine" | "category";
  name?: string;
  details?: string;
  dose?: string;
  duration?: string;
  categoryContent?: string;
  generic_name?: string;
  strength?: string;
  manufacturer_name?: string;
  dosage_form_icon?: string;
  dosage_form_name?: string;
}

interface RightColumnProps {
  width: number;
  data?: any;
  setData?: (data: any) => void;
}

const RightColumn = ({ width, data, setData }: RightColumnProps) => {
  const medicines: Medicine[] = data?.medicines || [];

  const addMedicine = () => {
    if (setData) {
      setData({
        ...data,
        medicines: [
          ...medicines,
          {
            id: Date.now().toString(),
            type: "medicine",
            name: "",
            details: "",
            dose: "",
            duration: "",
          },
        ],
      });
    }
  };

  const addCategory = () => {
    if (setData) {
      setData({
        ...data,
        medicines: [
          ...medicines,
          {
            id: Date.now().toString(),
            type: "category",
            categoryContent: "▶️ New Category",
          },
        ],
      });
    }
  };

  const removeMedicine = (id: string) => {
    if (setData) {
      setData({
        ...data,
        medicines: medicines.filter((m) => m.id !== id),
      });
    }
  };

  const updateMedicine = (id: string, field: string, value: string) => {
    if (setData) {
      setData({
        ...data,
        medicines: medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
      });
    }
  };

  const updateMedicineMultiple = (id: string, updates: Partial<Medicine>) => {
    if (setData) {
      setData({
        ...data,
        medicines: medicines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      });
    }
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
        fontSize: "36px",
        fontWeight: "bold",
        color: "#333",
        margin: 0,
        lineHeight: 1,
      }}>
        Rx
      </h1>

      <div style={{
        marginTop: "8px",
        paddingLeft: "5px",
        fontSize: "10px",
        lineHeight: "1.3",
        flexGrow: 1,
        overflow: "visible",
        minHeight: "100px",
      }}>
        {medicines.map((med) => (
          <div
            key={med.id}
            style={{
              marginBottom: "5px",
              paddingLeft: "6px",
              paddingRight: "30px",
              position: "relative",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <button
              onClick={() => removeMedicine(med.id)}
              className="medicine-remove-btn no-print"
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
              <>
                <div
                  id={`categoryContent-${med.id}`}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateMedicine(med.id, "categoryContent", e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: med.categoryContent || "" }}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0056b3",
                    marginTop: "8px",
                    marginBottom: "4px",
                    minHeight: "14px",
                    padding: "2px",
                    border: "1px solid transparent",
                  }}
                />
              </>
            ) : (
              <>
                <div style={{ marginBottom: "3px" }}>
                  <div className="no-print" style={{ marginBottom: "4px" }}>
                    <MedicineAutocomplete
                      value={med.name || ""}
                      onSelect={(medicine) => {
                        updateMedicineMultiple(med.id, {
                          name: medicine.brand_name,
                          generic_name: medicine.generics?.name,
                          strength: medicine.strength || "",
                          manufacturer_name: medicine.manufacturers?.name,
                          dosage_form_icon: medicine.icon_url || medicine.dosage_forms?.icon_url || "",
                          dosage_form_name: medicine.dosage_forms?.name || "",
                        });
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
                    {(med.dosage_form_icon || med.dosage_form_name) && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "16px" }}>
                        {med.dosage_form_icon ? (
                          <img
                            src={med.dosage_form_icon}
                            alt={med.dosage_form_name || "Dosage form"}
                            style={{ width: "14px", height: "14px", marginTop: "1px" }}
                            className="dosage-icon"
                          />
                        ) : (
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              marginTop: "1px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#e0e0e0",
                              borderRadius: "2px",
                              fontSize: "6px",
                              fontWeight: 700,
                            }}
                          >
                            {med.dosage_form_name?.substring(0, 3).toUpperCase() || "MED"}
                          </div>
                        )}
                        {med.dosage_form_name && (
                          <span
                            style={{
                              marginTop: "1px",
                              fontSize: "7px",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            {med.dosage_form_name}
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "baseline" }}>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateMedicine(med.id, "name", e.currentTarget.textContent || "")}
                          style={{ 
                            fontSize: "11px", 
                            fontWeight: 700, 
                            color: "#000", 
                            minHeight: "14px", 
                            outline: "none",
                            padding: "1px"
                          }}
                        >
                          {med.name || "Medicine Name"}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateMedicine(med.id, "generic_name", e.currentTarget.textContent || "")}
                          style={{ 
                            fontSize: "9px", 
                            color: "#0056b3", 
                            fontWeight: 600, 
                            minHeight: "12px", 
                            outline: "none",
                            padding: "1px"
                          }}
                        >
                          {med.generic_name || "Generic"}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateMedicine(med.id, "strength", e.currentTarget.textContent || "")}
                          style={{ outline: "none", padding: "1px", minWidth: "25px", fontSize: "9px", color: "#666" }}
                        >
                          {med.strength || "mg"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="no-print" style={{ marginBottom: "4px", marginLeft: "18px", display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <DoseSelector
                      value={med.dose || ""}
                      onChange={(value) => updateMedicine(med.id, "dose", value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <DurationSelector
                      value={med.duration || ""}
                      onChange={(value) => updateMedicine(med.id, "duration", value)}
                    />
                  </div>
                </div>
                <div style={{ fontSize: "9px", fontWeight: 500, marginBottom: "2px", marginLeft: "18px" }}>
                  {med.dose || "Dosage"}
                  {med.duration && ` ${med.duration.replace("→ সময়কাল: ", "")}`}
                </div>

                <div
                  id={`details-${med.id}`}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateMedicine(med.id, "details", e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: med.details || "" }}
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.3",
                    color: "#555",
                    fontStyle: "italic",
                    marginBottom: "4px",
                    marginLeft: "18px",
                    minHeight: "12px",
                    padding: "1px",
                    border: "1px solid transparent",
                  }}
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="no-print" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <Button onClick={addMedicine} variant="outline" className="add-medicine-btn">
          + Add Medicine
        </Button>
        <Button onClick={addCategory} variant="outline" className="add-medicine-btn">
          + Add Category
        </Button>
      </div>
    </div>
  );
};

export default RightColumn;
