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
  const [headerFontSize, setHeaderFontSize] = useState<string>("13");
  const [degreeEnFontSize, setDegreeEnFontSize] = useState<string>("13");
  const [degreeBnFontSize, setDegreeBnFontSize] = useState<string>("13");

  const [clinicBranding, setClinicBranding] = useState<{
    logo_url?: string;
    header_image_url?: string;
  }>({});

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*, clinics:clinic_id(logo_url, header_image_url)")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setDoctorInfo({
          bismillah: data.bismillah_text || "",
          docNameEN: data.full_name || "Dr. [Your Name]",
          docDegreeEN: data.degree_en || "MBBS<br/>Experienced Physician",
          docNameBN: data.name_bn || "ডাঃ [আপনার নাম]",
          docDegreeBN: data.degree_bn || "এম.বি.বি.এস<br/>অভিজ্ঞ চিকিৎসক",
        });
        setCouncilLogoUrl(data.council_logo_url || "");
        setRegistrationNumber(data.registration_number || "");
        setHeaderFontSize(data.header_font_size || "13");
        setDegreeEnFontSize(data.degree_en_font_size || "13");
        setDegreeBnFontSize(data.degree_bn_font_size || "13");
        
        // Load clinic branding if user is part of a clinic
        if (data.clinics) {
          setClinicBranding({
            logo_url: data.clinics.logo_url,
            header_image_url: data.clinics.header_image_url,
          });
        }
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
      backgroundImage: clinicBranding.header_image_url 
        ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${clinicBranding.header_image_url})`
        : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {doctorInfo.bismillah && (
        <div
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onBlur={(e) => handleEdit("bismillah", e.currentTarget.textContent || "")}
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "10px",
          }}
        >
          {doctorInfo.bismillah}
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
        {/* Left Column - English */}
        <div style={{ flex: "1", fontSize: `${headerFontSize}px`, lineHeight: "1.5" }}>
          <h2
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
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
            spellCheck={false}
            onBlur={(e) => handleEdit("docDegreeEN", e.currentTarget.innerHTML || "")}
            dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeEN }}
            style={{ margin: 0, fontSize: `${degreeEnFontSize}px`, lineHeight: "1.5" }}
          />
        </div>

        {/* Center Column - Clinic Logo / Medical Council Logo & QR Code */}
        <div style={{ 
          flex: "0 0 auto", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          padding: "5px 15px",
          gap: "10px"
        }}>
          {/* Clinic Logo (if available) takes priority */}
          {clinicBranding.logo_url ? (
            <img 
              src={clinicBranding.logo_url} 
              alt="Clinic Logo"
              style={{
                maxHeight: "60px",
                maxWidth: "90px",
                objectFit: "contain"
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : councilLogoUrl ? (
            <>
              <img 
                src={councilLogoUrl} 
                alt="Medical Council Logo"
                style={{
                  maxHeight: "50px",
                  maxWidth: "70px",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {registrationNumber && (
                <div style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#333",
                  textAlign: "center",
                  whiteSpace: "nowrap"
                }}>
                  {registrationNumber}
                </div>
              )}
            </>
          ) : null}
          
          {/* QR Code for Verification */}
          {prescriptionId && uniqueHash && (
            <QRCodeDisplay prescriptionId={prescriptionId} uniqueHash={uniqueHash} />
          )}
        </div>

        {/* Right Column - Bengali */}
        <div style={{ flex: "1", fontSize: `${headerFontSize}px`, lineHeight: "1.5", textAlign: "right" }}>
          <h2
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
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
            spellCheck={false}
            onBlur={(e) => handleEdit("docDegreeBN", e.currentTarget.innerHTML || "")}
            dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeBN }}
            style={{ margin: 0, fontSize: `${degreeBnFontSize}px`, lineHeight: "1.5" }}
          />
        </div>
      </div>
    </header>
  );
};

export default PrescriptionHeader;
