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
  profileData?: any;
}

const PrescriptionHeader = ({ doctorInfo, setDoctorInfo, prescriptionId, uniqueHash, profileData }: PrescriptionHeaderProps) => {
  const councilLogoUrl = profileData?.council_logo_url || "";
  const registrationNumber = profileData?.registration_number || "";
  const headerFontSize = profileData?.header_font_size || "13";
  const degreeEnFontSize = profileData?.degree_en_font_size || "13";
  const degreeBnFontSize = profileData?.degree_bn_font_size || "13";
  const clinicBranding = {
    logo_url: profileData?.clinics?.logo_url,
    header_image_url: profileData?.clinics?.header_image_url,
  };
  
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
            marginBottom: "12px",
          }}
        >
          {doctorInfo.bismillah}
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", position: "relative" }}>
        {/* Left Column - English */}
        <div style={{ flex: "1 1 0", fontSize: `${headerFontSize}px`, lineHeight: "1.35", minWidth: "0" }}>
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
              marginBottom: "2px",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
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
            style={{ margin: 0, fontSize: `${degreeEnFontSize}px`, lineHeight: "1.35" }}
          />
        </div>

        {/* Center Column - Logo, Registration & QR Code */}
        <div style={{ 
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 8px",
          gap: "6px",
          minWidth: "90px",
          maxWidth: "110px",
          zIndex: 10
        }}>
          {clinicBranding.logo_url ? (
            <img 
              src={clinicBranding.logo_url} 
              alt="Clinic Logo"
              style={{
                maxHeight: "60px",
                maxWidth: "85px",
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
                  fontSize: "8px",
                  fontWeight: 600,
                  color: "#333",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  marginTop: "-2px"
                }}>
                  {registrationNumber}
                </div>
              )}
            </>
          ) : null}
          
          {prescriptionId && uniqueHash && (
            <QRCodeDisplay prescriptionId={prescriptionId} uniqueHash={uniqueHash} />
          )}
        </div>

        {/* Right Column - Bengali */}
        <div style={{ flex: "1 1 0", fontSize: `${headerFontSize}px`, lineHeight: "1.35", textAlign: "right", minWidth: "0" }}>
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
              marginBottom: "2px",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
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
            style={{ margin: 0, fontSize: `${degreeBnFontSize}px`, lineHeight: "1.35" }}
          />
        </div>
      </div>
    </header>
  );
};

export default PrescriptionHeader;
