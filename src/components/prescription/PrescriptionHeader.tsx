import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface PrescriptionHeaderProps {
  doctorInfo: {
    bismillah: string;
    docNameEN: string;
    docDegreeEN: string;
    docNameBN: string;
    docDegreeBN: string;
  };
  setDoctorInfo: (info: any) => void;
  prescriptionId?: string;
  uniqueHash?: string;
}

const PrescriptionHeader = ({ doctorInfo, setDoctorInfo, prescriptionId, uniqueHash }: PrescriptionHeaderProps) => {
  const [loading, setLoading] = useState(true);
  const [councilLogoUrl, setCouncilLogoUrl] = useState<string>("");
  const [registrationNumber, setRegistrationNumber] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setDoctorInfo({
          bismillah: "بسم الله الرحمن الرحيم",
          docNameEN: data.full_name || "Dr. [Your Name]",
          docDegreeEN: data.degree_en || "MBBS<br/>Experienced Physician",
          docNameBN: data.name_bn || "ডাঃ [আপনার নাম]",
          docDegreeBN: data.degree_bn || "এম.বি.বি.এস<br/>অভিজ্ঞ চিকিৎসক",
        });
        setCouncilLogoUrl(data.council_logo_url || "");
        setRegistrationNumber(data.registration_number || "");
      }
      setLoading(false);
    };

    loadProfile();
  }, [setDoctorInfo]);
  const handleEdit = (field: string, value: string) => {
    setDoctorInfo({ ...doctorInfo, [field]: value });
  };

  return (
    <header className="prescription-header" style={{
      padding: "15px",
      borderBottom: "3px solid #0056b3",
      overflow: "hidden",
      position: "relative",
      zIndex: 1,
      backgroundColor: "white",
    }}>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleEdit("bismillah", e.currentTarget.textContent || "")}
        style={{
          textAlign: "center",
          fontSize: "18px",
          marginBottom: "10px",
        }}
      >
        {doctorInfo.bismillah}
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
        {/* Left Column - English */}
        <div style={{ flex: "1", fontSize: "13px", lineHeight: "1.5" }}>
          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEdit("docNameEN", e.currentTarget.textContent || "")}
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0056b3",
              margin: 0,
            }}
          >
            {doctorInfo.docNameEN}
          </h2>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEdit("docDegreeEN", e.currentTarget.innerHTML || "")}
            dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeEN }}
            style={{ margin: 0 }}
          />
        </div>

        {/* Center Column - Medical Council Logo & QR Code */}
        <div style={{ 
          flex: "0 0 auto", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          padding: "5px 15px",
          gap: "10px"
        }}>
          {councilLogoUrl && (
            <>
              <img 
                src={councilLogoUrl} 
                alt="Medical Council Logo"
                style={{
                  maxHeight: "80px",
                  maxWidth: "120px",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {registrationNumber && (
                <div style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#333",
                  textAlign: "center",
                  whiteSpace: "nowrap"
                }}>
                  {registrationNumber}
                </div>
              )}
            </>
          )}
          
          {/* QR Code for Verification */}
          {prescriptionId && uniqueHash && (
            <QRCodeDisplay prescriptionId={prescriptionId} uniqueHash={uniqueHash} />
          )}
        </div>

        {/* Right Column - Bengali */}
        <div style={{ flex: "1", fontSize: "13px", lineHeight: "1.5", textAlign: "right" }}>
          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEdit("docNameBN", e.currentTarget.textContent || "")}
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0056b3",
              margin: 0,
            }}
          >
            {doctorInfo.docNameBN}
          </h2>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEdit("docDegreeBN", e.currentTarget.innerHTML || "")}
            dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeBN }}
            style={{ margin: 0 }}
          />
        </div>
      </div>
    </header>
  );
};

export default PrescriptionHeader;
