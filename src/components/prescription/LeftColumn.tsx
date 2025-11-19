import { useRef } from "react";
import RichTextToolbar from "../RichTextToolbar";

interface LeftColumnProps {
  width: number;
  data?: any;
  setData?: (data: any) => void;
}

const LeftColumn = ({ width, data, setData }: LeftColumnProps) => {
  const ccRef = useRef<HTMLDivElement>(null);
  const dxRef = useRef<HTMLDivElement>(null);
  const advRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const followUpRef = useRef<HTMLDivElement>(null);

  const vitals = data?.vitals || {
    bp_s: "",
    bp_d: "",
    pulse: "",
    temp: "",
    spo2: "",
    anemia: "",
    jaundice: "",
  };

  const handleVitalEdit = (field: string, value: string) => {
    if (setData) {
      setData({
        ...data,
        vitals: { ...vitals, [field]: value },
      });
    }
  };

  const handleCommand = (ref: React.RefObject<HTMLDivElement>) => (command: string, value?: string) => {
    if (ref.current) {
      ref.current.focus();
      if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false);
      }
    }
  };

  const handleContentChange = (field: string, value: string) => {
    if (setData) {
      setData({ ...data, [field]: value });
    }
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
      <RichTextToolbar onCommand={handleCommand(ccRef)} className="no-print mb-2" />
      <div
        ref={ccRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("ccText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.ccText || "" }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
          padding: "4px",
          border: "1px solid transparent",
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
        Diagnosis:
      </h4>
      <RichTextToolbar onCommand={handleCommand(dxRef)} className="no-print mb-2" />
      <div
        ref={dxRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("dxText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.dxText || "" }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
          padding: "4px",
          border: "1px solid transparent",
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
        Advice:
      </h4>
      <RichTextToolbar onCommand={handleCommand(advRef)} className="no-print mb-2" />
      <div
        ref={advRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("advText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.advText || "" }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
          padding: "4px",
          border: "1px solid transparent",
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
        Instructions:
      </h4>
      <RichTextToolbar onCommand={handleCommand(instructionsRef)} className="no-print mb-2" />
      <div
        ref={instructionsRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("instructionsText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.instructionsText || "" }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
          padding: "4px",
          border: "1px solid transparent",
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
        Follow Up:
      </h4>
      <RichTextToolbar onCommand={handleCommand(followUpRef)} className="no-print mb-2" />
      <div
        ref={followUpRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("followUpText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.followUpText || "" }}
        style={{
          fontSize: "13px",
          lineHeight: "1.6",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "20px",
          marginBottom: "15px",
          padding: "4px",
          border: "1px solid transparent",
        }}
      />
    </div>
  );
};

export default LeftColumn;
