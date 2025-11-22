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
  const [doctorNameBN, setDoctorNameBN] = useState<string>("");
  const [doctorDegreeBN, setDoctorDegreeBN] = useState<string>("");

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

        // Load doctor's profile info (council logo, registration, and Bengali info)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("council_logo_url, registration_number, name_bn, degree_bn")
            .eq("id", session.user.id)
            .single();

          if (profileData) {
            setCouncilLogoUrl(profileData.council_logo_url || "");
            setRegistrationNumber(profileData.registration_number || "");
            setDoctorNameBN(profileData.name_bn || doctorInfo.docNameBN);
            setDoctorDegreeBN(profileData.degree_bn || doctorInfo.docDegreeBN);
          }
        }
      } catch (error) {
        console.error("Error loading clinic branding:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClinicAndDoctor();
  }, [clinicId, doctorInfo.docNameBN, doctorInfo.docDegreeBN]);

  if (loading) {
    return (
      <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 animate-pulse" />
    );
  }

  return (
    <header style={{
      padding: "20px 24px",
      borderBottom: "3px solid #0056b3",
      overflow: "hidden",
      position: "relative",
      zIndex: 1,
      backgroundColor: "white",
      backgroundImage: clinic?.header_image_url 
        ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${clinic.header_image_url})`
        : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        gap: "24px",
        maxWidth: "100%"
      }}>
        {/* Left Column - Clinic Logo & Branding */}
        <div style={{ 
          flex: "1", 
          fontSize: "13px", 
          lineHeight: "1.6", 
          display: "flex", 
          gap: "12px", 
          alignItems: "flex-start",
          minWidth: 0
        }}>
          {clinic?.logo_url && (
            <img 
              src={clinic.logo_url} 
              alt="Clinic Logo"
              style={{
                maxHeight: "60px",
                maxWidth: "60px",
                objectFit: "contain",
                flexShrink: 0,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#0056b3",
              margin: "0 0 6px 0",
              lineHeight: 1.2,
              letterSpacing: "-0.01em"
            }}>
              {clinic?.name || "Clinic Name"}
            </h2>
            <div style={{ 
              margin: 0, 
              fontSize: "12px",
              color: "#374151",
              lineHeight: 1.7
            }}>
              {clinic?.address && <div style={{ marginBottom: "2px" }}>{clinic.address}</div>}
              {clinic?.phone && <div style={{ marginBottom: "2px" }}><strong>Phone:</strong> {clinic.phone}</div>}
              {clinic?.email && <div style={{ marginBottom: "2px" }}><strong>Email:</strong> {clinic.email}</div>}
              {clinic?.website && <div><strong>Website:</strong> {clinic.website}</div>}
            </div>
          </div>
        </div>

        {/* Center Column - Medical Council Logo & QR Code */}
        <div style={{ 
          flex: "0 0 auto", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 20px",
          gap: "12px",
          minWidth: "100px"
        }}>
          {councilLogoUrl && (
            <>
              <img 
                src={councilLogoUrl} 
                alt="Medical Council Logo"
                style={{
                  maxHeight: "65px",
                  maxWidth: "80px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {registrationNumber && (
                <div style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#1f2937",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  padding: "4px 8px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                  letterSpacing: "0.02em"
                }}>
                  {registrationNumber}
                </div>
              )}
            </>
          )}
          
          {prescriptionId && uniqueHash && (
            <div style={{ marginTop: "4px" }}>
              <QRCodeDisplay prescriptionId={prescriptionId} uniqueHash={uniqueHash} />
            </div>
          )}
        </div>

        {/* Right Column - Bengali Doctor Info */}
        <div style={{ 
          flex: "1", 
          fontSize: "13px", 
          lineHeight: "1.6", 
          textAlign: "right",
          minWidth: 0
        }}>
          <h2 style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#0056b3",
            margin: "0 0 6px 0",
            lineHeight: 1.2,
            letterSpacing: "-0.01em"
          }}>
            {doctorNameBN || doctorInfo.docNameBN}
          </h2>
          <div
            dangerouslySetInnerHTML={{ __html: doctorDegreeBN || doctorInfo.docDegreeBN }}
            style={{ 
              margin: 0,
              color: "#374151",
              lineHeight: 1.7
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default ClinicPrescriptionHeader;
