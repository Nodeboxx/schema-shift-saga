interface PatientInfoBarProps {
  patientInfo: {
    patientDate: string;
    patientName: string;
    patientAge: string;
    patientSex: string;
    patientWeight: string;
  };
  setPatientInfo: (info: any) => void;
}

const PatientInfoBar = ({ patientInfo, setPatientInfo }: PatientInfoBarProps) => {
  const handleEdit = (field: string, value: string) => {
    setPatientInfo({ ...patientInfo, [field]: value });
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px",
      fontWeight: 600,
      padding: "8px 15px",
      borderBottom: "1px solid #eee",
    }}>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Date:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientDate", e.currentTarget.textContent || "")}
          style={{ minWidth: "50px" }}
        >
          {patientInfo.patientDate}
        </div>
      </span>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Name:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientName", e.currentTarget.textContent || "")}
          style={{ minWidth: "200px" }}
        >
          {patientInfo.patientName}
        </div>
      </span>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Age:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientAge", e.currentTarget.textContent || "")}
          style={{ minWidth: "50px" }}
        >
          {patientInfo.patientAge}
        </div>
      </span>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Sex:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientSex", e.currentTarget.textContent || "")}
          style={{ minWidth: "50px" }}
        >
          {patientInfo.patientSex}
        </div>
      </span>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Weight:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientWeight", e.currentTarget.textContent || "")}
          style={{ minWidth: "50px" }}
        >
          {patientInfo.patientWeight}
        </div>
      </span>
    </div>
  );
};

export default PatientInfoBar;
