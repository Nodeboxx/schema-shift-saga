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
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
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

      // Load first accessible clinic for this user (owner or clinic member)
      const { data: clinics, error: clinicsError } = await supabase
        .from("clinics")
        .select("logo_url, header_image_url, name, address, phone, email, website")
        .order("header_image_url", { ascending: false, nullsFirst: false })
        .limit(1);

      if (clinicsError) {
        console.error("Error loading clinic branding:", clinicsError);
        setLoading(false);
        return;
      }

      if (clinics && clinics.length > 0) {
        const clinic = clinics[0];
        setClinicBranding({
          logo_url: clinic.logo_url,
          header_image_url: clinic.header_image_url,
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          email: clinic.email,
          website: clinic.website,
        });
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
      backgroundColor: "white",
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
      
      {/* Logo and Clinic Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        {clinicBranding.logo_url && (
          <img 
            src={clinicBranding.logo_url} 
            alt="Clinic Logo"
            style={{
              maxHeight: "50px",
              maxWidth: "80px",
              objectFit: "contain"
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {clinicBranding.name && (
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#333" }}>
            {clinicBranding.name}
          </div>
        )}
      </div>

      {/* Clinic Details and Doctor Info side by side */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        gap: "20px" 
      }}>
        {/* Clinic Details - left side */}
        <div style={{ 
          flex: "1",
          fontSize: "10px", 
          color: "#666", 
          lineHeight: "1.6"
        }}>
          {clinicBranding.address && <div>{clinicBranding.address}</div>}
          {clinicBranding.phone && <div>Phone: {clinicBranding.phone}</div>}
          {clinicBranding.email && <div>Email: {clinicBranding.email}</div>}
          {clinicBranding.website && <div>Website: {clinicBranding.website}</div>}
        </div>

        {/* Doctor details - right side, aligned with clinic details */}
        <div style={{ flex: "1.5", display: "flex", justifyContent: "flex-end", alignItems: "flex-start", gap: "20px" }}>
          {/* English doctor details */}
          <div style={{ fontSize: "13px", lineHeight: "1.5", textAlign: "left" }}>
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleEdit("docNameEN", e.currentTarget.textContent || "")}
              style={{
                fontSize: "20px",
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

          {/* Bengali doctor details */}
          <div style={{ fontSize: "13px", lineHeight: "1.5", textAlign: "right" }}>
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleEdit("docNameBN", e.currentTarget.textContent || "")}
              style={{
                fontSize: "20px",
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

          {/* QR Code */}
          {prescriptionId && uniqueHash && (
            <div style={{ flex: "0 0 auto" }}>
              <QRCodeDisplay prescriptionId={prescriptionId} uniqueHash={uniqueHash} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PrescriptionHeader;
