import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface ClinicPrescriptionHeaderProps {
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

const ClinicPrescriptionHeader = ({ doctorInfo, setDoctorInfo, prescriptionId, uniqueHash }: ClinicPrescriptionHeaderProps) => {
  const [loading, setLoading] = useState(true);
  const [councilLogoUrl, setCouncilLogoUrl] = useState<string>("");

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
      }

      // Load clinic branding
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
      
      {/* Row 1: Clinic Branding (left) and Doctor Names (right) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "3px" }}>
        {/* Left: Clinic Branding - NOT EDITABLE */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: "1" }}>
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
          <div>
            {clinicBranding.name && (
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "4px" }}>
                {clinicBranding.name}
              </div>
            )}
            {/* Clinic Details - NOT EDITABLE */}
            <div style={{ 
              fontSize: "10px", 
              color: "#666", 
              lineHeight: "1.6"
            }}>
              {clinicBranding.address && <div>{clinicBranding.address}</div>}
              {clinicBranding.phone && <div>Phone: {clinicBranding.phone}</div>}
              {clinicBranding.email && <div>Email: {clinicBranding.email}</div>}
              {clinicBranding.website && <div>Website: {clinicBranding.website}</div>}
            </div>
          </div>
        </div>

        {/* Right: Doctor Names with QR/Logo in middle - EDITABLE */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "20px" }}>
          {/* English doctor name - EDITABLE */}
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

          {/* Middle: Council Logo / QR Code */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {councilLogoUrl && (
              <img 
                src={councilLogoUrl} 
                alt="Council Logo"
                style={{
                  maxHeight: "50px",
                  maxWidth: "50px",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {prescriptionId && uniqueHash && (
              <QRCodeDisplay prescriptionId={prescriptionId} uniqueHash={uniqueHash} />
            )}
          </div>

          {/* Bengali doctor name - EDITABLE */}
          <h2
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleEdit("docNameBN", e.currentTarget.textContent || "")}
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0056b3",
              margin: 0,
              textAlign: "right"
            }}
          >
            {doctorInfo.docNameBN}
          </h2>
        </div>
      </div>

      {/* Row 2: Doctor Degrees - EDITABLE */}
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        alignItems: "flex-start", 
        gap: "20px",
        marginBottom: "8px"
      }}>
        {/* English doctor degrees - EDITABLE */}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("docDegreeEN", e.currentTarget.innerHTML || "")}
          dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeEN }}
          style={{ fontSize: "13px", lineHeight: "1.5", margin: 0 }}
        />

        {/* Spacer for middle logo/QR alignment */}
        <div style={{ width: "70px" }}></div>

        {/* Bengali doctor degrees - EDITABLE */}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("docDegreeBN", e.currentTarget.innerHTML || "")}
          dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeBN }}
          style={{ fontSize: "13px", lineHeight: "1.5", textAlign: "right", margin: 0 }}
        />
      </div>
    </header>
  );
};

export default ClinicPrescriptionHeader;
