import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    };

    loadProfile();
  }, [setDoctorInfo]);
  const handleEdit = (field: string, value: string) => {
    setDoctorInfo({ ...doctorInfo, [field]: value });
  };

  return (
    <header style={{
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
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("docDegreeEN", e.currentTarget.innerHTML || "")}
          dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeEN }}
          style={{ margin: 0 }}
        />
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
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("docDegreeBN", e.currentTarget.innerHTML || "")}
          dangerouslySetInnerHTML={{ __html: doctorInfo.docDegreeBN }}
          style={{ margin: 0 }}
        />
      </div>
      <div style={{ clear: "both" }} />
    </header>
  );
};

export default PrescriptionHeader;
