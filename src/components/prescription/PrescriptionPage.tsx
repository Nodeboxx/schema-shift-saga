import { useState } from "react";
import PrescriptionHeader from "./PrescriptionHeader";
import PatientInfoBar from "./PatientInfoBar";
import PrescriptionBody from "./PrescriptionBody";
import PrescriptionFooter from "./PrescriptionFooter";

const PrescriptionPage = () => {
  const [doctorInfo, setDoctorInfo] = useState({
    bismillah: "بسم الله الرحمن الرحيم",
    docNameEN: "Dr. Rashedul Islam",
    docDegreeEN: "MBBS(DU), MRCP(Part-1)...",
    docNameBN: "ডাঃ রাশেদুল ইসলাম",
    docDegreeBN: "এম.বি.বি.এস (ডি.ইউ)...",
  });

  const [patientInfo, setPatientInfo] = useState({
    patientDate: new Date().toLocaleDateString(),
    patientName: "",
    patientAge: "",
    patientSex: "",
    patientWeight: "",
  });

  return (
    <div style={{
      width: "800px",
      minHeight: "1120px",
      margin: "20px auto",
      backgroundColor: "#ffffff",
      border: "1px solid #aaa",
      boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
      position: "relative",
      boxSizing: "border-box",
    }}>
      <PrescriptionHeader doctorInfo={doctorInfo} setDoctorInfo={setDoctorInfo} />
      <PatientInfoBar patientInfo={patientInfo} setPatientInfo={setPatientInfo} />
      <PrescriptionBody />
      <PrescriptionFooter />
    </div>
  );
};

export default PrescriptionPage;
