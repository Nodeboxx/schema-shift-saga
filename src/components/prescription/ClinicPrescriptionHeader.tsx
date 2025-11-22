import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface ClinicPrescriptionHeaderProps {
  clinicId: string;
  prescriptionDate?: string;
  doctorInfo: {
    docNameBN: string;
    docDegreeBN: string;
  };
  prescriptionId?: string;
  uniqueHash?: string;
}

const ClinicPrescriptionHeader = ({ 
  clinicId, 
  doctorInfo,
  prescriptionId,
  uniqueHash 
}: ClinicPrescriptionHeaderProps) => {
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [councilLogoUrl, setCouncilLogoUrl] = useState<string>("");
  const [registrationNumber, setRegistrationNumber] = useState<string>("");

  useEffect(() => {
    const loadClinicAndDoctor = async () => {
      try {
        // Load clinic branding
        const { data: clinicData, error: clinicError } = await supabase
          .from("clinics")
          .select("name, logo_url, header_image_url, address, phone, email, website")
          .eq("id", clinicId)
          .single();

        if (clinicError) throw clinicError;
        setClinic(clinicData);

        // Load doctor's council logo and registration
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("council_logo_url, registration_number")
            .eq("id", session.user.id)
            .single();

          if (profileData) {
            setCouncilLogoUrl(profileData.council_logo_url || "");
            setRegistrationNumber(profileData.registration_number || "");
          }
        }
      } catch (error) {
        console.error("Error loading clinic branding:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClinicAndDoctor();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 animate-pulse" />
    );
  }

  return (
    <header style={{
      padding: "15px",
      borderBottom: "3px solid #0056b3",
      overflow: "hidden",
      position: "relative",
      zIndex: 1,
      backgroundColor: "white",
      backgroundImage: clinic?.header_image_url 
        ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${clinic.header_image_url})`
        : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
        {/* Left Column - Clinic Logo & Branding (replaces English doctor info) */}
        <div style={{ flex: "1", fontSize: "13px", lineHeight: "1.5", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          {clinic?.logo_url && (
            <img 
              src={clinic.logo_url} 
              alt="Clinic Logo"
              style={{
                maxHeight: "50px",
                maxWidth: "50px",
                objectFit: "contain",
                flexShrink: 0
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0056b3",
              margin: 0,
            }}>
              {clinic?.name || "Clinic Name"}
            </h2>
            <div style={{ margin: 0, fontSize: "12px" }}>
              {clinic?.address && <div>{clinic.address}</div>}
              {clinic?.phone && <div>Phone: {clinic.phone}</div>}
              {clinic?.email && <div>Email: {clinic.email}</div>}
              {clinic?.website && <div>Website: {clinic.website}</div>}
            </div>
          </div>
        </div>

        {/* Center Column - Doctor's Council Logo & QR Code (unchanged, controlled by doctor) */}
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
          )}
          
          {prescriptionId && uniqueHash && (
            <QRCodeDisplay prescriptionId={prescriptionId} uniqueHash={uniqueHash} />
          )}
        </div>

        {/* Right Column - Bengali Doctor Info (unchanged, editable, controlled by doctor) */}
        <div style={{ flex: "1", fontSize: "13px", lineHeight: "1.5", textAlign: "right" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#0056b3",
            margin: 0,
          }}>
            {doctorInfo.docNameBN}
          </h2>
          <div
            dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeBN }}
            style={{ margin: 0 }}
          />
        </div>
      </div>
    </header>
  );
};

export default ClinicPrescriptionHeader;
