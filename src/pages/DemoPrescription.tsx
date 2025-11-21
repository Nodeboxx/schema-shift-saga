import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Home, Printer } from "lucide-react";
import PrescriptionHeader from "@/components/prescription/PrescriptionHeader";
import PatientInfoBar from "@/components/prescription/PatientInfoBar";
import PrescriptionBody from "@/components/prescription/PrescriptionBody";
import PrescriptionFooter from "@/components/prescription/PrescriptionFooter";
import RichTextToolbar from "@/components/RichTextToolbar";

const DemoPrescription = () => {
  const navigate = useNavigate();
  const [medicineCount, setMedicineCount] = useState(0);

  const demoDoctor = {
    bismillah: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ",
    docNameEN: "Dr. John Smith",
    docDegreeEN: "MBBS, MD (Medicine)",
    docNameBN: "ডা. জন স্মিথ",
    docDegreeBN: "এমবিবিএস, এমডি (মেডিসিন)"
  };

  const demoPatient = {
    patientName: "Jane Doe",
    patientAge: "35y 0m 0d",
    patientAgeYears: "35",
    patientAgeMonths: "0",
    patientAgeDays: "0",
    patientSex: "Female",
    patientWeight: "65kg 0g",
    patientWeightKg: "65",
    patientWeightGrams: "0",
    patientDate: new Date().toLocaleDateString('en-GB')
  };

  const [patientInfo, setPatientInfo] = useState(demoPatient);
  const [bodyData, setBodyData] = useState({
    medicines: [
      {
        id: "demo-1",
        type: "medicine",
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        strength: "500mg",
        dose: "1+0+1",
        duration: "7 days",
        details: "After meal"
      }
    ]
  });

  const handleBodyDataChange = (newData: any) => {
    const newMedicineCount = newData.medicines?.filter((m: any) => m.type === "medicine").length || 0;
    
    if (newMedicineCount > 3) {
      alert("Demo mode is limited to 3 medicines maximum. Sign up to add unlimited medicines!");
      return;
    }
    
    setMedicineCount(newMedicineCount);
    setBodyData(newData);
  };

  const handlePrintClick = () => {
    alert("Printing is disabled in demo mode. Sign up to unlock printing functionality!");
  };

  return (
    <div className="prescription-root" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Arial', sans-serif", backgroundColor: "#e0e0e0", margin: 0, paddingTop: "100px" }}>
      {/* Demo Warning Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white py-3 px-6 text-center font-medium flex items-center justify-center gap-3">
        🎯 Demo Mode - Experience the platform without signing up! Limited to 3 medicines.
      </div>

      {/* Controls */}
      <div className="no-print fixed" style={{ top: "60px", left: 0, right: 0, backgroundColor: "#f8f9fa", zIndex: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/demo")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demo
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
          
          <div className="text-sm font-medium bg-orange-100 text-orange-800 px-4 py-2 rounded-lg">
            Medicines: {medicineCount} / 3
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePrintClick}>
              <Printer className="w-4 h-4 mr-2" />
              Print (Disabled in Demo)
            </Button>
          </div>
        </div>

        <div className="px-6 py-2 border-b">
          <RichTextToolbar onCommand={(cmd) => {
            document.execCommand(cmd, false, undefined);
          }} />
        </div>

        <Alert className="m-4 border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            This is a demo prescription with pre-filled data. You can edit fields but changes won't be saved. Sign up to save prescriptions and access all features!
          </AlertDescription>
        </Alert>
      </div>

      <div id="page-wrapper" className="prescription-page-wrapper" style={{ display: "block", paddingTop: "280px" }}>
        <div className="prescription-page a4-page" style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: "white",
          margin: "0 auto 20px",
          padding: "0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          pageBreakAfter: "always"
        }}>
          <PrescriptionHeader doctorInfo={demoDoctor} setDoctorInfo={() => {}} />
          <PatientInfoBar patientInfo={patientInfo} setPatientInfo={setPatientInfo} />
          <PrescriptionBody data={bodyData} setData={handleBodyDataChange} />
          <PrescriptionFooter />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="no-print fixed bottom-0 left-0 right-0 bg-muted py-3 px-6 text-center shadow-lg">
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">This is a demo preview. In the full version, you can add unlimited medicines and print prescriptions.</span>
        </div>
      </div>
    </div>
  );
};

export default DemoPrescription;
