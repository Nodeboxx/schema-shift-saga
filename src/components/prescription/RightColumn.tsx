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
        fontSize: "40px",
        fontWeight: "bold",
        color: "#333",
        margin: 0,
        lineHeight: 1,
      }}>
        Rx
      </h1>

      <div style={{
        marginTop: "10px",
        paddingLeft: "5px",
        fontSize: "12px",
        lineHeight: "1.5",
        flexGrow: 1,
        overflow: "visible",
        minHeight: "100px",
      }}>
        {medicines.map((med) => (
          <div
            key={med.id}
            style={{
              marginBottom: "8px",
              paddingLeft: "8px",
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
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0056b3",
                    marginTop: "12px",
                    marginBottom: "6px",
                    minHeight: "18px",
                    padding: "3px",
                    border: "1px solid transparent",
                  }}
                />
              </>
            ) : (
              <>
                <div style={{ marginBottom: "6px" }}>
                  <div className="no-print" style={{ marginBottom: "6px" }}>
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

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    {(med.dosage_form_icon || med.dosage_form_name) && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "20px" }}>
                        {med.dosage_form_icon ? (
                          <img
                            src={med.dosage_form_icon}
                            alt={med.dosage_form_name || "Dosage form"}
                            style={{ width: "16px", height: "16px", marginTop: "1px" }}
                            className="dosage-icon"
                          />
                        ) : (
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              marginTop: "1px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#e0e0e0",
                              borderRadius: "2px",
                              fontSize: "7px",
                              fontWeight: 700,
                            }}
                          >
                            {med.dosage_form_name?.substring(0, 3).toUpperCase() || "MED"}
                          </div>
                        )}
                        {med.dosage_form_name && (
                          <span
                            style={{
                              marginTop: "2px",
                              fontSize: "8px",
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
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "baseline" }}>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateMedicine(med.id, "name", e.currentTarget.textContent || "")}
                          style={{ 
                            fontSize: "13px", 
                            fontWeight: 700, 
                            color: "#000", 
                            minHeight: "16px", 
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
                            fontSize: "11px", 
                            color: "#0056b3", 
                            fontWeight: 600, 
                            minHeight: "14px", 
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
                          style={{ outline: "none", padding: "1px", minWidth: "30px", fontSize: "11px", color: "#666" }}
                        >
                          {med.strength || "mg"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="no-print" style={{ marginBottom: "6px", marginLeft: "22px" }}>
                  <DoseSelector
                    value={med.dose || ""}
                    onChange={(value) => updateMedicine(med.id, "dose", value)}
                  />
                </div>
                <div style={{ fontSize: "11px", fontWeight: 500, marginBottom: "3px", marginLeft: "22px" }}>
                  {med.dose || "Dosage"}
                </div>

                <div
                  id={`details-${med.id}`}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateMedicine(med.id, "details", e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: med.details || "" }}
                  style={{
                    fontSize: "10px",
                    lineHeight: "1.4",
                    color: "#555",
                    fontStyle: "italic",
                    marginBottom: "6px",
                    marginLeft: "22px",
                    minHeight: "14px",
                    padding: "2px",
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
