import { useState } from "react";

interface LeftColumnProps {
  width: number;
}

const LeftColumn = ({ width }: LeftColumnProps) => {
  const [ccText, setCcText] = useState("");
  const [dxText, setDxText] = useState("");
  const [advText, setAdvText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [vitals, setVitals] = useState({
    bp_s: "",
    bp_d: "",
    pulse: "",
    temp: "",
    spo2: "",
    anemia: "",
    jaundice: "",
  });

  const handleVitalEdit = (field: string, value: string) => {
    setVitals({ ...vitals, [field]: value });
  };

  return (
    <div style={{
      flexBasis: `${width}%`,
      background: "#fafafa",
      padding: "10px",
      borderRight: "1px solid #ccc",
      fontSize: "13px",
      minWidth: "200px",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "visible",
    }}>
      <h4 style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "2px",
        marginTop: "10px",
        marginBottom: "5px",
      }}>
        Presenting Complains:
      </h4>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setCcText(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: ccText }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
        }}
      />

      <h4 style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "2px",
        marginTop: "10px",
        marginBottom: "5px",
      }}>
        On Examination:
      </h4>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2px 8px",
        marginTop: "5px",
        marginBottom: "15px",
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>BP (S/D)</label>
          <span style={{ display: "flex", alignItems: "center" }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleVitalEdit("bp_s", e.currentTarget.textContent || "")}
              style={{ fontSize: "13px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "18px", height: "20px", overflow: "hidden", width: "40px" }}
            >
              {vitals.bp_s}
            </div>
            {" / "}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleVitalEdit("bp_d", e.currentTarget.textContent || "")}
              style={{ fontSize: "13px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "18px", height: "20px", overflow: "hidden", width: "40px" }}
            >
              {vitals.bp_d}
            </div>
            {" mmHg"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Pulse</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleVitalEdit("pulse", e.currentTarget.textContent || "")}
            style={{ fontSize: "13px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "18px", height: "20px", overflow: "hidden" }}
          >
            {vitals.pulse}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Temp</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleVitalEdit("temp", e.currentTarget.textContent || "")}
            style={{ fontSize: "13px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "18px", height: "20px", overflow: "hidden" }}
          >
            {vitals.temp}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>SpO2</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleVitalEdit("spo2", e.currentTarget.textContent || "")}
            style={{ fontSize: "13px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "18px", height: "20px", overflow: "hidden" }}
          >
            {vitals.spo2}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Anemia</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleVitalEdit("anemia", e.currentTarget.textContent || "")}
            style={{ fontSize: "13px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "18px", height: "20px", overflow: "hidden" }}
          >
            {vitals.anemia}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Jaundice</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleVitalEdit("jaundice", e.currentTarget.textContent || "")}
            style={{ fontSize: "13px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "18px", height: "20px", overflow: "hidden" }}
          >
            {vitals.jaundice}
          </div>
        </div>
      </div>

      <h4 style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "2px",
        marginTop: "10px",
        marginBottom: "5px",
      }}>
        Dx: (Clinical Diagnoses)
      </h4>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setDxText(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: dxText }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
        }}
      />

      <h4 style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "2px",
        marginTop: "10px",
        marginBottom: "5px",
      }}>
        ADVICE: (Lab Tests)
      </h4>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setAdvText(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: advText }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
        }}
      />

      <div style={{ paddingLeft: 0 }}>
        <h4 style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#0056b3",
          marginTop: "20px",
          marginBottom: "10px",
        }}>
          📢 Patient Instructions:
        </h4>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setInstructionsText(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: instructionsText }}
          style={{
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        />
      </div>

      <h4 style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "2px",
        marginTop: "10px",
        marginBottom: "5px",
      }}>
        Follow-Up:
      </h4>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setFollowUpText(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: followUpText }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
        }}
      />
    </div>
  );
};

export default LeftColumn;
