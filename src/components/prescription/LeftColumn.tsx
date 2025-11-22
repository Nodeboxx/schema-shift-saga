import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VoiceContentEditable } from "@/components/voice/VoiceContentEditable";

interface LeftColumnProps {
  width: number;
  data?: any;
  setData?: (data: any) => void;
  templateSections?: any[];
}

const LeftColumn = ({ width, data, setData, templateSections }: LeftColumnProps) => {
  const ccRef = useRef<HTMLDivElement>(null);
  const dxRef = useRef<HTMLDivElement>(null);
  const advRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const followUpRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<any[]>([]);

  useEffect(() => {
    // Prefer template sections passed from parent (per-prescription)
    if (templateSections && Array.isArray(templateSections)) {
      setTemplate(templateSections);
      return;
    }

    // Fallback: load from user profile
    const loadTemplate = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("left_template_sections")
          .eq("id", user.id)
          .single();

        if (profile?.left_template_sections) {
          setTemplate(Array.isArray(profile.left_template_sections) ? profile.left_template_sections : []);
        }
      }
    };

    loadTemplate();
  }, [templateSections]);

  const vitals = data?.vitals || {
    bp_s: "",
    bp_d: "",
    pulse: "",
    temp: "",
    spo2: "",
    anemia: "",
    jaundice: "",
  };

  // Values for template fields (per-section)
  const sectionFieldValues = data?.sectionFieldValues || {};
  // Legacy support for previous Past History implementation
  const phFields = data?.phFields || {};
  // Generic rich-text content for custom sections without fields
  const customSectionContent = data?.customSectionContent || {};

  const handleVitalEdit = (field: string, value: string) => {
    if (setData) {
      setData({
        ...data,
        vitals: { ...vitals, [field]: value },
      });
    }
  };

  const handleSectionFieldEdit = (sectionId: string, fieldLabel: string, value: string) => {
    if (!setData) return;

    const existingSectionValues =
      sectionFieldValues[sectionId] || (sectionId === "ph" ? phFields : {});

    const newSectionFieldValues = {
      ...sectionFieldValues,
      [sectionId]: {
        ...existingSectionValues,
        [fieldLabel]: value,
      },
    };

    // Keep legacy phFields in sync for existing prescriptions
    const extra: any = {};
    if (sectionId === "ph") {
      extra.phFields = {
        ...phFields,
        [fieldLabel]: value,
      };
    }

    setData({
      ...data,
      ...extra,
      sectionFieldValues: newSectionFieldValues,
    });
  };

  const handleContentChange = (field: string, value: string) => {
    if (setData) {
      setData({ ...data, [field]: value });
    }
  };

  const handleCustomSectionChange = (sectionId: string, value: string) => {
    if (!setData) return;
    setData({
      ...data,
      customSectionContent: {
        ...customSectionContent,
        [sectionId]: value,
      },
    });
  };

  const enabledSections = template
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Check for standard sections
  const hasCCSection = enabledSections.some(s => s.id === "cc");
  const hasDXSection = enabledSections.some(s => s.id === "dx");
  const hasADVSection = enabledSections.some(s => s.id === "adv");
  const hasFollowUpSection = enabledSections.some(s => s.id === "followup");

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
      {/* Always render Chief Complaints if enabled */}
      {hasCCSection && (
        <div key="cc">
          <h4 style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#0056b3",
            borderBottom: "1px solid #aaa",
            paddingBottom: "1px",
            marginTop: "6px",
            marginBottom: "3px",
          }}>
            {enabledSections.find(s => s.id === "cc")?.title || "Presenting Complains:"}
          </h4>
          <VoiceContentEditable
            value={data?.ccText || "• "}
            onBlur={(value) => handleContentChange("ccText", value)}
            onInput={(e) => {
              const content = e.currentTarget.innerHTML;
              if (!content.trim() || content.trim() === "<br>") {
                e.currentTarget.innerHTML = "• ";
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(e.currentTarget);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.execCommand("insertHTML", false, "<br>• ");
              }
            }}
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
      )}

      {/* Render custom template sections (excluding standard ones) */}
      {enabledSections.map((section) => {
        // Skip standard sections - they're handled separately
        if (section.id === "cc" || section.id === "oe" || section.id === "dx" || section.id === "adv" || section.id === "followup") {
          return null;
        }

        // Handle sections with fields (like Past History, CVS Examination, etc.)
        if (section.fields && section.fields.length > 0) {
          const sectionValues = sectionFieldValues[section.id] || {};

          return (
            <div key={section.id}>
              <h4 style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#0056b3",
                borderBottom: "1px solid #aaa",
                paddingBottom: "1px",
                marginTop: "6px",
                marginBottom: "3px",
              }}>
                {section.title}
              </h4>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1px 4px",
                marginTop: "3px",
                marginBottom: "8px",
              }}>
                {section.fields.map((field: any, index: number) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <label style={{ fontSize: "7px", fontWeight: 600, color: "#333", minWidth: "50px" }}>
                      {field.label}:
                    </label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleSectionFieldEdit(section.id, field.label, e.currentTarget.textContent || "")
                      }
                      style={{
                        fontSize: "7px",
                        fontWeight: 500,
                        borderBottom: "1px solid #ddd",
                        minHeight: "12px",
                        height: "14px",
                        overflow: "hidden",
                        flex: 1,
                      }}
                    >
                      {sectionValues[field.label] || "____"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Generic fallback for custom rich-text sections
        return (
          <div key={section.id}>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#0056b3",
                borderBottom: "1px solid #aaa",
                paddingBottom: "1px",
                marginTop: "6px",
                marginBottom: "3px",
              }}
            >
              {section.title}
            </h4>
            <VoiceContentEditable
              value={customSectionContent[section.id] || ""}
              onBlur={(value) => handleCustomSectionChange(section.id, value)}
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
      })}

      {/* FIXED: Always render On Examination section with standard vitals */}
      <div key="oe">
        <h4 style={{
          fontSize: "12px",
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
              <span style={{ fontSize: "9px", margin: "0 2px" }}>/</span>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleVitalEdit("bp_d", e.currentTarget.textContent || "")}
                style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", width: "30px" }}
              >
                {vitals.bp_d}
              </div>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Pulse</label>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleVitalEdit("pulse", e.currentTarget.textContent || "")}
                style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", flex: 1 }}
              >
                {vitals.pulse}
              </div>
              <span style={{ fontSize: "7px", color: "#666" }}>beat/min</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>Temp</label>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleVitalEdit("temp", e.currentTarget.textContent || "")}
                style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", flex: 1 }}
              >
                {vitals.temp}
              </div>
              <span style={{ fontSize: "7px", color: "#666" }}>°C</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "8px", fontWeight: 600, color: "#333", marginBottom: "-2px" }}>SpO2</label>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleVitalEdit("spo2", e.currentTarget.textContent || "")}
                style={{ fontSize: "9px", fontWeight: 500, borderBottom: "1px solid #ddd", minHeight: "14px", height: "16px", overflow: "hidden", flex: 1 }}
              >
                {vitals.spo2}
              </div>
              <span style={{ fontSize: "7px", color: "#666" }}>% on air</span>
            </div>
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
      </div>

      {/* Always render Diagnosis if enabled */}
      {hasDXSection && (
        <div key="dx">
          <h4 style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#0056b3",
            borderBottom: "1px solid #aaa",
            paddingBottom: "1px",
            marginTop: "6px",
            marginBottom: "3px",
          }}>
            {enabledSections.find(s => s.id === "dx")?.title || "Diagnosis:"}
          </h4>
          <VoiceContentEditable
            value={data?.dxText || ""}
            onBlur={(value) => handleContentChange("dxText", value)}
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
      )}

      {/* Always render Advice/Management if enabled */}
      {hasADVSection && (
        <div key="adv">
          <h4 style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#0056b3",
            borderBottom: "1px solid #aaa",
            paddingBottom: "1px",
            marginTop: "6px",
            marginBottom: "3px",
          }}>
            {enabledSections.find(s => s.id === "adv")?.title || "Advice:"}
          </h4>
          <VoiceContentEditable
            value={data?.advText || "• "}
            onBlur={(value) => handleContentChange("advText", value)}
            onInput={(e) => {
              const content = e.currentTarget.textContent || "";
              const htmlContent = e.currentTarget.innerHTML;
              
              if (!content.trim() || htmlContent.trim() === "<br>") {
                e.currentTarget.innerHTML = "• ";
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
              if (e.key === "Enter") {
                e.preventDefault();
                document.execCommand("insertHTML", false, "<br>• ");
              }
            }}
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
      )}

      {/* Always render Follow Up if enabled */}
      {hasFollowUpSection && (
        <div key="followup">
          <h4 style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#0056b3",
            borderBottom: "1px solid #aaa",
            paddingBottom: "1px",
            marginTop: "6px",
            marginBottom: "3px",
          }}>
            {enabledSections.find(s => s.id === "followup")?.title || "Follow Up:"}
          </h4>
          <VoiceContentEditable
            value={data?.followUpText || ""}
            onBlur={(value) => handleContentChange("followUpText", value)}
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
      )}
    </div>
  );
};

export default LeftColumn;
