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

  const [clinicBranding, setClinicBranding] = useState<{
    logo_url?: string;
    header_image_url?: string;
  }>({});

  useEffect(() => {
    const loadProfileAndBranding = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        setLoading(false);
        return;
      }

      if (profile) {
        setDoctorInfo({
          bismillah: profile.bismillah_text || "",
          docNameEN: profile.full_name || "Dr. [Your Name]",
          docDegreeEN: profile.degree_en || "MBBS<br/>Experienced Physician",
          docNameBN: profile.name_bn || "ডাঃ [আপনার নাম]",
          docDegreeBN: profile.degree_bn || "এম.বি.বি.এস<br/>অভিজ্ঞ চিকিৎসক",
        });
        setCouncilLogoUrl(profile.council_logo_url || "");
        setRegistrationNumber(profile.registration_number || "");
      }

      const loadBrandingForClinic = async (clinicId: string) => {
        const { data: clinic, error: clinicError } = await supabase
          .from("clinics")
          .select("logo_url, header_image_url")
          .eq("id", clinicId)
          .maybeSingle();

        if (clinicError) {
          console.error("Error loading clinic branding:", clinicError);
          return;
        }

        if (clinic) {
          setClinicBranding({
            logo_url: clinic.logo_url,
            header_image_url: clinic.header_image_url,
          });
        }
      };

      let clinicId: string | null = (profile && profile.clinic_id) ? profile.clinic_id : null;

      if (!clinicId) {
        const { data: membership, error: membershipError } = await supabase
          .from("clinic_members")
          .select("clinic_id")
          .eq("user_id", session.user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (membershipError) {
          console.error("Error loading clinic membership:", membershipError);
        } else if (membership?.clinic_id) {
          clinicId = membership.clinic_id;
        }
      }

      if (!clinicId) {
        const { data: ownedClinic, error: ownedError } = await supabase
          .from("clinics")
          .select("id")
          .eq("owner_id", session.user.id)
          .maybeSingle();

        if (ownedError) {
          console.error("Error loading owned clinic:", ownedError);
        } else if (ownedClinic?.id) {
          clinicId = ownedClinic.id;
        }
      }

      if (clinicId) {
        await loadBrandingForClinic(clinicId);
      }

      setLoading(false);
    };

    loadProfileAndBranding();
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
