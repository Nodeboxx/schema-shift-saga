import { useRef, useState, useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { VoiceInputButton } from "./VoiceInputButton";

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

  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<'en-US' | 'bn-BD'>('en-US');
  
  const { isListening, transcript, isProcessing, toggleListening } = useVoiceInput(voiceLanguage);

  // Update content when voice transcript changes
  useEffect(() => {
    if (transcript && activeVoiceField) {
      const fieldRef = {
        ccText: ccRef,
        dxText: dxRef,
        instructionsText: instructionsRef,
      }[activeVoiceField];

      if (fieldRef?.current) {
        const currentContent = fieldRef.current.innerHTML || '';
        const newContent = currentContent + (currentContent ? ' ' : '') + transcript;
        fieldRef.current.innerHTML = newContent;
        handleContentChange(activeVoiceField, newContent);
      }
    }
  }, [transcript]);

  const handleVoiceToggle = (field: string, language: 'en-US' | 'bn-BD') => {
    setVoiceLanguage(language);
    setActiveVoiceField(field);
    setTimeout(() => toggleListening(), 100);
  };

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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>Presenting Complains:</span>
        <VoiceInputButton
          isListening={isListening && activeVoiceField === 'ccText'}
          isProcessing={isProcessing}
          onToggle={(lang) => handleVoiceToggle('ccText', lang)}
        />
      </h4>
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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>Diagnosis:</span>
        <VoiceInputButton
          isListening={isListening && activeVoiceField === 'dxText'}
          isProcessing={isProcessing}
          onToggle={(lang) => handleVoiceToggle('dxText', lang)}
        />
      </h4>
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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>Instructions:</span>
        <VoiceInputButton
          isListening={isListening && activeVoiceField === 'instructionsText'}
          isProcessing={isProcessing}
          onToggle={(lang) => handleVoiceToggle('instructionsText', lang)}
        />
      </h4>
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
