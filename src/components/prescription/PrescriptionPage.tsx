import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PrescriptionHeader from "./PrescriptionHeader";
import PatientInfoBar from "./PatientInfoBar";
import PrescriptionBody from "./PrescriptionBody";
import PrescriptionFooter from "./PrescriptionFooter";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface PrescriptionPageProps {
  prescriptionData?: any;
  userId?: string;
}

const PrescriptionPage = ({ prescriptionData, userId }: PrescriptionPageProps) => {
  const { toast } = useToast();
  const [pages, setPages] = useState([{ id: 1 }]);
  const [currentPage, setCurrentPage] = useState(1);

  const [doctorInfo, setDoctorInfo] = useState({
    bismillah: "بسم الله الرحمن الرحيم",
    docNameEN: "Dr. Rashedul Islam",
    docDegreeEN: `MBBS(DU), MRCP(Part-1)<br/>Experienced in Neonate, children & Medicine.<br/>Register & Incharge, NICU & PICU.<br/>Delta Healthcare Jatrabari Ltd, Jatrabari, Dhaka.<br/>BMDC Reg. No-A 120051`,
    docNameBN: "ডাঃ রাশেদুল ইসলাম",
    docDegreeBN: `এম.বি.বি.এস (ডি.ইউ), এম.আর.সি.পি (পার্ট-১)<br/>নবজাতক, শিশু ও মেডিসিনে অভিজ্ঞতা সম্পন্ন।<br/>রেজিস্টার এন্ড ইনচার্জ, এন.আই.সি.ইউ এন্ড পি.ই.সি.ইউ.<br/>ডেল্টা হেলথকেয়ার যাত্রাবাড়ী লিমিটেড, যাত্রাবাড়ী, ঢাকা।<br/>বি.এম.ডি.সি. রে.জি নং- এ ১২০০৫১`,
  });

  const [patientInfo, setPatientInfo] = useState({
    patientDate: new Date().toLocaleDateString('en-GB'), // dd/mm/yyyy format
    patientName: "",
    patientAge: "",
    patientAgeYears: "0",
    patientAgeMonths: "0",
    patientAgeDays: "0",
    patientSex: "",
    patientWeight: "",
    patientWeightKg: "0",
    patientWeightGrams: "0",
  });

  const [bodyData, setBodyData] = useState<any>({});

  useEffect(() => {
    if (prescriptionData) {
      // Load patient info
      const formatDateFromDB = (dateStr: string) => {
        if (!dateStr) return new Date().toLocaleDateString('en-GB');
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
      };

      setPatientInfo({
        patientDate: formatDateFromDB(prescriptionData.prescription_date),
        patientName: prescriptionData.patient_name || "",
        patientAge: prescriptionData.patient_age || "",
        patientAgeYears: prescriptionData.patient_age_years?.toString() || "0",
        patientAgeMonths: prescriptionData.patient_age_months?.toString() || "0",
        patientAgeDays: prescriptionData.patient_age_days?.toString() || "0",
        patientSex: prescriptionData.patient_sex || "",
        patientWeight: prescriptionData.patient_weight || "",
        patientWeightKg: prescriptionData.patient_weight_kg?.toString() || "0",
        patientWeightGrams: prescriptionData.patient_weight_grams?.toString() || "0",
      });

      // Load body data (vitals, complaints, etc.)
      setBodyData({
        ccText: prescriptionData.cc_text || "",
        dxText: prescriptionData.dx_text || "",
        advText: prescriptionData.adv_text || "",
        instructionsText: prescriptionData.instructions_text || "",
        followUpText: prescriptionData.follow_up_text || "",
        vitals: {
          bp_s: prescriptionData.oe_bp_s || "",
          bp_d: prescriptionData.oe_bp_d || "",
          pulse: prescriptionData.oe_pulse || "",
          temp: prescriptionData.oe_temp || "",
          spo2: prescriptionData.oe_spo2 || "",
          anemia: prescriptionData.oe_anemia || "",
          jaundice: prescriptionData.oe_jaundice || "",
        },
        medicines: (prescriptionData.prescription_items || []).map((item: any) => {
          // Parse details JSON if it exists
          let parsedDetails = {};
          try {
            if (item.details) {
              parsedDetails = JSON.parse(item.details);
            }
          } catch (e) {
            // If details is not JSON, treat as regular text
            parsedDetails = { details: item.details };
          }
          
          return {
            id: item.id,
            type: item.item_type,
            name: item.name,
            dose: item.dose,
            categoryContent: item.category_content,
            // Restore medicine metadata from parsed details
            ...parsedDetails,
          };
        }),
      });
    }
  }, [prescriptionData]);

  const handleSave = async () => {
    if (!userId || !patientInfo.patientName) {
      toast({
        title: "Error",
        description: "Patient name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert dd/mm/yyyy to yyyy-mm-dd for database
      const convertDateForDB = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return null;
      };

      // Save or update prescription
      const prescriptionPayload = {
        user_id: userId,
        patient_name: patientInfo.patientName,
        patient_age: patientInfo.patientAge,
        patient_age_years: parseInt(patientInfo.patientAgeYears) || 0,
        patient_age_months: parseInt(patientInfo.patientAgeMonths) || 0,
        patient_age_days: parseInt(patientInfo.patientAgeDays) || 0,
        patient_sex: patientInfo.patientSex,
        patient_weight: patientInfo.patientWeight,
        patient_weight_kg: parseInt(patientInfo.patientWeightKg) || 0,
        patient_weight_grams: parseInt(patientInfo.patientWeightGrams) || 0,
        prescription_date: convertDateForDB(patientInfo.patientDate),
        cc_text: bodyData.ccText,
        dx_text: bodyData.dxText,
        adv_text: bodyData.advText,
        instructions_text: bodyData.instructionsText,
        follow_up_text: bodyData.followUpText,
        oe_bp_s: bodyData.vitals?.bp_s,
        oe_bp_d: bodyData.vitals?.bp_d,
        oe_pulse: bodyData.vitals?.pulse,
        oe_temp: bodyData.vitals?.temp,
        oe_spo2: bodyData.vitals?.spo2,
        oe_anemia: bodyData.vitals?.anemia,
        oe_jaundice: bodyData.vitals?.jaundice,
        page_count: pages.length,
      };

      let prescriptionId = prescriptionData?.id;

      if (prescriptionId) {
        // Update existing
        const { error } = await supabase
          .from("prescriptions")
          .update(prescriptionPayload)
          .eq("id", prescriptionId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("prescriptions")
          .insert([prescriptionPayload])
          .select()
          .single();

        if (error) throw error;
        prescriptionId = data.id;
      }

      // Save prescription items
      if (bodyData.medicines && bodyData.medicines.length > 0) {
        // Delete existing items
        await supabase
          .from("prescription_items")
          .delete()
          .eq("prescription_id", prescriptionId);

        // Insert new items
        const items = bodyData.medicines.map((med: any, index: number) => {
          // Extract medicine metadata to store in details field
          const metadata = {
            generic_name: med.generic_name,
            strength: med.strength,
            manufacturer_name: med.manufacturer_name,
            dosage_form_icon: med.dosage_form_icon,
            dosage_form_name: med.dosage_form_name,
            details: med.details, // Keep any text details
          };
          
          return {
            prescription_id: prescriptionId,
            item_type: med.type || med.item_type || "medicine",
            name: med.name || "",
            details: JSON.stringify(metadata), // Store metadata as JSON
            dose: med.dose || "",
            category_content: med.categoryContent || "",
            sort_order: index,
          };
        });

        const { error: itemsError } = await supabase
          .from("prescription_items")
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Prescription saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save prescription",
        variant: "destructive",
      });
    }
  };

  const addPage = () => {
    const newPageId = pages.length + 1;
    setPages([...pages, { id: newPageId }]);
    setCurrentPage(newPageId);
  };

  const removePage = (pageId: number) => {
    if (pages.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one page is required",
        variant: "destructive",
      });
      return;
    }
    
    setPages(pages.filter(p => p.id !== pageId));
    if (currentPage === pageId) {
      setCurrentPage(pages[0].id);
    }
  };

  return (
    <>
      <div className="no-print flex gap-2 justify-center mb-4">
        <Button onClick={handleSave} size="lg">
          Save Prescription
        </Button>
        <Button onClick={addPage} variant="outline" size="lg" className="add-medicine-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Page
        </Button>
        {pages.length > 1 && (
          <Button onClick={() => removePage(currentPage)} variant="destructive" size="lg">
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Page
          </Button>
        )}
        <div className="text-sm font-medium px-4 py-2 bg-gray-100 rounded-md">
          Page {currentPage} of {pages.length}
        </div>
      </div>

      {pages.map((page, index) => (
        <div
          key={page.id}
          className="prescription-page"
          onClick={() => setCurrentPage(page.id)}
          style={{
            width: "800px",
            minHeight: "1120px",
            margin: "20px auto",
            backgroundColor: "#ffffff",
            border: currentPage === page.id ? "2px solid #0056b3" : "1px solid #aaa",
            boxShadow: currentPage === page.id 
              ? "0 0 20px rgba(0, 86, 179, 0.3)" 
              : "0 0 15px rgba(0, 0, 0, 0.1)",
            position: "relative",
            boxSizing: "border-box",
            pageBreakAfter: "always",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Page Number Indicator */}
          <div className="no-print absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
            Page {index + 1}
          </div>
          
          <PrescriptionHeader doctorInfo={doctorInfo} setDoctorInfo={setDoctorInfo} />
          <PatientInfoBar patientInfo={patientInfo} setPatientInfo={setPatientInfo} />
          <PrescriptionBody 
            data={bodyData} 
            setData={setBodyData}
          />
          <PrescriptionFooter />
        </div>
      ))}
    </>
  );
};

export default PrescriptionPage;
