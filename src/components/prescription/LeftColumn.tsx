import { useRef } from "react";

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


  const handleContentChange = (field: string, value: string) => {
    if (setData) {
      setData({ ...data, [field]: value });
    }
  };

  return (
    <div style={{
      flexBasis: `${width}%`,
      background: "#fafafa",
      padding: "6px",
      borderRight: "1px solid #ccc",
      fontSize: "9px",
      minWidth: "200px",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "visible",
    }}>
      <h4 style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "1px",
        marginTop: "6px",
        marginBottom: "3px",
      }}>
        Presenting Complains:
      </h4>
      <div
        ref={ccRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const content = e.currentTarget.innerHTML;
          if (!content.trim() || content.trim() === '<br>') {
            e.currentTarget.innerHTML = '• ';
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(e.currentTarget);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '<br>• ');
          }
        }}
        onBlur={(e) => handleContentChange("ccText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.ccText || "• " }}
        style={{
          fontSize: "9px",
          lineHeight: "1.4",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "14px",
          marginBottom: "8px",
          padding: "2px",
          border: "1px solid transparent",
        }}
      />

      <h4 style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "1px",
        marginTop: "6px",
        marginBottom: "3px",
      }}>
        On Examination:
      </h4>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1px 4px",
        marginTop: "3px",
        marginBottom: "8px",
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>BP (S/D)</label>
          <span style={{ display: "flex", alignItems: "center" }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleVitalEdit("bp_s", e.currentTarget.textContent || "")}
              style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", width: "30px" }}
            >
              {vitals.bp_s}
            </div>
            {" / "}
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleVitalEdit("bp_d", e.currentTarget.textContent || "")}
              style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", width: "30px" }}
            >
              {vitals.bp_d}
            </div>
            {" mmHg"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Pulse</label>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleVitalEdit("pulse", e.currentTarget.textContent || "")}
              style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", width: "30px" }}
            >
              {vitals.pulse}
            </div>
            <span style={{ fontSize: "7px", color: "#666" }}>beat/min</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Temp</label>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleVitalEdit("temp", e.currentTarget.textContent || "")}
              style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", width: "30px" }}
            >
              {vitals.temp}
            </div>
            <span style={{ fontSize: "7px", color: "#666" }}>°C</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>SpO2</label>
          <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleVitalEdit("spo2", e.currentTarget.textContent || "")}
              style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", width: "30px" }}
            >
              {vitals.spo2}
            </div>
            <span style={{ fontSize: "7px", color: "#666" }}>% on air</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Anemia</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleVitalEdit("anemia", e.currentTarget.textContent || "")}
            style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden" }}
          >
            {vitals.anemia}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Jaundice</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleVitalEdit("jaundice", e.currentTarget.textContent || "")}
            style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden" }}
          >
            {vitals.jaundice}
          </div>
        </div>
      </div>

      <h4 style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "1px",
        marginTop: "6px",
        marginBottom: "3px",
      }}>
        Diagnosis:
      </h4>
      <div
        ref={dxRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("dxText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.dxText || "" }}
        style={{
          fontSize: "9px",
          lineHeight: "1.4",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "14px",
          marginBottom: "8px",
          padding: "2px",
          border: "1px solid transparent",
        }}
      />

      <h4 style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "1px",
        marginTop: "6px",
        marginBottom: "3px",
      }}>
        Advice:
      </h4>
      <div
        ref={advRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const content = e.currentTarget.textContent || "";
          const htmlContent = e.currentTarget.innerHTML;
          
          if (!content.trim() || htmlContent.trim() === '<br>') {
            e.currentTarget.innerHTML = '• ';
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(e.currentTarget);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
            return;
          }
          
          if (content.endsWith("..")) {
            const beforeDots = content.slice(0, -2);
            const lastWord = beforeDots.split(/[\s\n]/).pop() || "";
            if (lastWord) {
              const upperWord = lastWord.toUpperCase();
              const newContent = beforeDots.slice(0, -lastWord.length) + "." + upperWord + " ";
              e.currentTarget.textContent = newContent;
              
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(e.currentTarget);
              range.collapse(false);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '<br>• ');
          }
        }}
        onBlur={(e) => handleContentChange("advText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.advText || "• " }}
        style={{
          fontSize: "9px",
          lineHeight: "1.4",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "14px",
          marginBottom: "8px",
          padding: "2px",
          border: "1px solid transparent",
        }}
      />

      <h4 style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "1px",
        marginTop: "6px",
        marginBottom: "3px",
      }}>
        Instructions:
      </h4>
      <div
        ref={instructionsRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("instructionsText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.instructionsText || "" }}
        style={{
          fontSize: "9px",
          lineHeight: "1.4",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "14px",
          marginBottom: "8px",
          padding: "2px",
          border: "1px solid transparent",
        }}
      />

      <h4 style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#0056b3",
        borderBottom: "1px solid #aaa",
        paddingBottom: "1px",
        marginTop: "6px",
        marginBottom: "3px",
      }}>
        Follow Up:
      </h4>
      <div
        ref={followUpRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange("followUpText", e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: data?.followUpText || "" }}
        style={{
          fontSize: "9px",
          lineHeight: "1.4",
          display: "block",
          overflow: "visible",
          height: "auto",
          minHeight: "14px",
          marginBottom: "8px",
          padding: "2px",
          border: "1px solid transparent",
        }}
      />
    </div>
  );
};

export default LeftColumn;
