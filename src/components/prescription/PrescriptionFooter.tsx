import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VoiceContentEditable } from "@/components/voice/VoiceContentEditable";

const PrescriptionFooter = () => {
  const [footerLeft, setFooterLeft] = useState("");
  const [footerRight, setFooterRight] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("footer_left, footer_right")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading profile footer:", error);
        return;
      }

      if (data) {
        setFooterLeft(data.footer_left || "");
        setFooterRight(data.footer_right || "");
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
      fontSize: "13px",
      borderTop: "2px solid #0056b3",
      position: "relative",
      width: "100%",
      boxSizing: "border-box",
      marginTop: "auto",
    }}>
      <div style={{ width: "45%", position: "relative" }}>
        <VoiceContentEditable
          value={footerLeft}
          onBlur={(value) => setFooterLeft(value)}
          style={{ minHeight: "20px" }}
        />
      </div>
      <div style={{ fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
        Page 1
      </div>
      <div style={{ width: "45%", position: "relative" }}>
        <VoiceContentEditable
          value={footerRight}
          onBlur={(value) => setFooterRight(value)}
          style={{ textAlign: "right", minHeight: "20px" }}
        />
      </div>
    </footer>
  );
};

export default PrescriptionFooter;
