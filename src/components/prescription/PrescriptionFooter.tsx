import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PrescriptionFooter = () => {
  const [footerLeft, setFooterLeft] = useState("");
  const [footerRight, setFooterRight] = useState("");
  const [footerFontSize, setFooterFontSize] = useState<string>("13");
  const [footerLeftFontSize, setFooterLeftFontSize] = useState<string>("13");
  const [footerRightFontSize, setFooterRightFontSize] = useState<string>("13");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("footer_left, footer_right, footer_font_size, footer_left_font_size, footer_right_font_size")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading profile footer:", error);
        return;
      }

      if (data) {
        setFooterLeft(data.footer_left || "");
        setFooterRight(data.footer_right || "");
        setFooterFontSize(data.footer_font_size || "13");
        setFooterLeftFontSize(data.footer_left_font_size || "13");
        setFooterRightFontSize(data.footer_right_font_size || "13");
      }
    };

    loadProfile();
  }, []);

  return (
    <footer className="prescription-footer" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 15px",
      background: "#f9f9f9",
      fontSize: `${footerFontSize}px`,
      borderTop: "2px solid #0056b3",
      position: "relative",
      width: "100%",
      boxSizing: "border-box",
      marginTop: "auto",
    }}>
      <div style={{ width: "45%", position: "relative", textAlign: "left", fontSize: `${footerLeftFontSize}px`, lineHeight: "1.4" }}>
        <div
          contentEditable
          spellCheck={false}
          dangerouslySetInnerHTML={{ __html: footerLeft }}
          onBlur={(e) => setFooterLeft(e.currentTarget.innerHTML)}
          style={{ minHeight: "20px", outline: "none", textAlign: "left", lineHeight: "1.4" }}
        />
      </div>
      <div style={{ fontSize: "12px", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>
        Page 1
      </div>
      <div style={{ width: "45%", position: "relative", textAlign: "right", fontSize: `${footerRightFontSize}px`, lineHeight: "1.4" }}>
        <div
          contentEditable
          spellCheck={false}
          dangerouslySetInnerHTML={{ __html: footerRight }}
          onBlur={(e) => setFooterRight(e.currentTarget.innerHTML)}
          style={{ textAlign: "right", minHeight: "20px", outline: "none", lineHeight: "1.4" }}
        />
      </div>
    </footer>
  );
};

export default PrescriptionFooter;
