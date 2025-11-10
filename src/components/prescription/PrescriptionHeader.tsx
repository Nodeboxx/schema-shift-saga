interface PrescriptionHeaderProps {
  doctorInfo: {
    bismillah: string;
    docNameEN: string;
    docDegreeEN: string;
    docNameBN: string;
    docDegreeBN: string;
  };
  setDoctorInfo: (info: any) => void;
}

const PrescriptionHeader = ({ doctorInfo, setDoctorInfo }: PrescriptionHeaderProps) => {
  const handleEdit = (field: string, value: string) => {
    setDoctorInfo({ ...doctorInfo, [field]: value });
  };

  return (
    <header style={{
      padding: "15px",
      borderBottom: "3px solid #0056b3",
      overflow: "hidden",
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
      <div style={{ float: "left", width: "48%", fontSize: "13px", lineHeight: "1.5" }}>
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
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("docDegreeEN", e.currentTarget.textContent || "")}
        >
          {doctorInfo.docDegreeEN}
        </p>
      </div>
      <div style={{ float: "right", width: "48%", fontSize: "13px", lineHeight: "1.5", textAlign: "right" }}>
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
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("docDegreeBN", e.currentTarget.textContent || "")}
        >
          {doctorInfo.docDegreeBN}
        </p>
      </div>
    </header>
  );
};

export default PrescriptionHeader;
