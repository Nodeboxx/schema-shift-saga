import { Button } from "@/components/ui/button";
import MedicineAutocomplete from "./MedicineAutocomplete";
import DoseSelector from "./DoseSelector";
import RichTextToolbar from "../RichTextToolbar";

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

  const handleCommand = (medId: string, field: "details" | "categoryContent") => (command: string, value?: string) => {
    const element = document.getElementById(`${field}-${medId}`);
    if (element) {
      element.focus();
      if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false);
      }
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
                <RichTextToolbar onCommand={handleCommand(med.id, "categoryContent")} className="no-print mb-2" />
                <div
                  id={`categoryContent-${med.id}`}
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
                    padding: "4px",
                    border: "1px solid transparent",
                  }}
                />
              </>
            ) : (
              <>
                <div className="no-print" style={{ marginBottom: "8px" }}>
                  <MedicineAutocomplete
                    value={med.name || ""}
                    onSelect={(medicine) => {
                      updateMedicineMultiple(med.id, {
                        name: medicine.brand_name,
                        generic_name: medicine.generics?.name,
                        strength: medicine.strength || "",
                        manufacturer_name: medicine.manufacturers?.name,
                        dosage_form_icon: medicine.dosage_forms?.icon_url || "",
                      });
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                  {med.dosage_form_icon && (
                    <img
                      src={med.dosage_form_icon}
                      alt="Dosage form"
                      style={{ width: "20px", height: "20px", marginTop: "2px" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#000" }}>
                      {med.name || "Medicine Name"}
                    </div>
                    {med.generic_name && (
                      <div style={{ fontSize: "12px", color: "#0056b3", fontWeight: 600 }}>
                        {med.generic_name}
                      </div>
                    )}
                    {med.strength && (
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        {med.strength}
                      </div>
                    )}
                    {med.manufacturer_name && (
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        {med.manufacturer_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="no-print" style={{ marginBottom: "8px" }}>
                  <DoseSelector
                    value={med.dose || ""}
                    onChange={(value) => updateMedicine(med.id, "dose", value)}
                  />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>
                  {med.dose || "Dosage"}
                </div>

                <RichTextToolbar onCommand={handleCommand(med.id, "details")} className="no-print mb-2" />
                <div
                  id={`details-${med.id}`}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateMedicine(med.id, "details", e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: med.details || "" }}
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.5",
                    color: "#555",
                    fontStyle: "italic",
                    marginBottom: "8px",
                    minHeight: "18px",
                    padding: "4px",
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
