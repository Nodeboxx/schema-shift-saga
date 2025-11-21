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
  const [pagesData, setPagesData] = useState<Record<number, any>>({ 1: {} });

  const [doctorInfo, setDoctorInfo] = useState({
    bismillah: "بسم الله الرحمن الرحيم",
    docNameEN: "Dr. Rashedul Islam",
    docDegreeEN: `MBBS(DU), MRCP(Part-1)<br/>Experienced in Neonate, children & Medicine.<br/>Register & Incharge, NICU & PICU.<br/>Delta Healthcare Jatrabari Ltd, Jatrabari, Dhaka.<br/>BMDC Reg. No-A 120051`,
    docNameBN: "ডাঃ রাশেদুল ইসলাম",
    docDegreeBN: `এম.বি.বি.এস (ডি.ইউ), এম.আর.সি.পি (পার্ট-১)<br/>নবজাতক, শিশু ও মেডিসিনে অভিজ্ঞতা সম্পন্ন।<br/>রেজিস্টার এন্ড ইনচার্জ, এন.আই.সি.ইউ এন্ড পি.ই.সি.ইউ.<br/>ডেল্টা হেলথকেয়ার যাত্রাবাড়ী লিমিটেড, যাত্রাবাড়ী, ঢাকা।<br/>বি.এম.ডি.সি. রে.জি নং- এ ১২০০৫১`,
  });

  const [footerInfo, setFooterInfo] = useState({
    footerLeft: "",
    footerRight: "",
  });

  const [templateSections, setTemplateSections] = useState<any[]>([]);

  // Load doctor profile and template sections
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, name_bn, degree_en, degree_bn, footer_left, footer_right, left_template_sections")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setDoctorInfo({
            bismillah: "بسم الله الرحمن الرحيم",
            docNameEN: profile.full_name || "Dr. Rashedul Islam",
            docDegreeEN: profile.degree_en || `MBBS(DU), MRCP(Part-1)<br/>Experienced in Neonate, children & Medicine.<br/>Register & Incharge, NICU & PICU.<br/>Delta Healthcare Jatrabari Ltd, Jatrabari, Dhaka.<br/>BMDC Reg. No-A 120051`,
            docNameBN: profile.name_bn || "ডাঃ রাশেদুল ইসলাম",
            docDegreeBN: profile.degree_bn || `এম.বি.বি.এস (ডি.ইউ), এম.আর.সি.পি (পার্ট-১)<br/>নবজাতক, শিশু ও মেডিসিনে অভিজ্ঞতা সম্পন্ন।<br/>রেজিস্টার এন্ড ইনচার্জ, এন.আই.সি.ইউ এন্ড পি.ই.সি.ইউ.<br/>ডেল্টা হেলথকেয়ার যাত্রাবাড়ী লিমিটেড, যাত্রাবাড়ী, ঢাকা।<br/>বি.এম.ডি.সি. রে.জি নং- এ ১২০০৫১`,
          });
          setFooterInfo({
            footerLeft: profile.footer_left || "",
            footerRight: profile.footer_right || "",
          });
          setTemplateSections(Array.isArray(profile.left_template_sections) ? profile.left_template_sections : []);
        }
      }
    };

    loadProfile();
  }, []);

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
        // Load template-specific data
        ...(prescriptionData.template_data || {}),
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
            duration: item.duration,
            categoryContent: item.category_content,
            // Restore medicine metadata from parsed details
            ...parsedDetails,
          };
        }),
      });

      // Load template sections from saved prescription if available
      if (prescriptionData.template_data?.left_template_sections) {
        setTemplateSections(prescriptionData.template_data.left_template_sections);
      }
    }
  }, [prescriptionData]);

  const handleSave = async () => {
    // Validate required patient data
    if (!patientInfo.patientName.trim()) {
      toast({
        title: "Patient Name Required",
        description: "Please enter patient's name before prescribing",
        variant: "destructive",
      });
      return;
    }

    if (!patientInfo.patientAge.trim() || patientInfo.patientAge === "0y") {
      toast({
        title: "Patient Age Required",
        description: "Please enter patient's age before prescribing",
        variant: "destructive",
      });
      return;
    }

    if (!patientInfo.patientSex) {
      toast({
        title: "Patient Sex Required",
        description: "Please select patient's sex before prescribing",
        variant: "destructive",
      });
      return;
    }

    if (!userId || !patientInfo.patientName) {
      toast({
        title: "Error",
        description: "Patient name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's active template
      const { data: { user } } = await supabase.auth.getUser();
      let activeTemplate = 'general_medicine';
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("active_template")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile?.active_template) {
          activeTemplate = profile.active_template;
        }
      }

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

      // Extract template-specific fields from bodyData
      const { ccText, dxText, advText, instructionsText, followUpText, vitals, medicines, ...templateSpecificData } = bodyData;

      // Get current template sections to save with prescription
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let currentTemplateSections: any[] = [];
      if (currentUser) {
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("left_template_sections")
          .eq("id", currentUser.id)
          .maybeSingle();
        
        if (currentProfile?.left_template_sections) {
          currentTemplateSections = Array.isArray(currentProfile.left_template_sections) 
            ? currentProfile.left_template_sections 
            : [];
        }
      }

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
        active_template: activeTemplate,
        template_data: {
          ...templateSpecificData,
          left_template_sections: currentTemplateSections, // Save current template configuration
        },
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
            duration: med.duration || "",
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
    setPagesData({ ...pagesData, [newPageId]: {} });
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
      </div>

      {pages.map((page) => (
        <div
          key={page.id}
          className="prescription-page"
          style={{
            width: "800px",
            minHeight: "1120px",
            margin: "20px auto",
            backgroundColor: "#ffffff",
            border: "1px solid #aaa",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
            position: "relative",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PrescriptionHeader doctorInfo={doctorInfo} setDoctorInfo={setDoctorInfo} />
          <PatientInfoBar patientInfo={patientInfo} setPatientInfo={setPatientInfo} />
          <PrescriptionBody 
            data={page.id === 1 ? bodyData : pagesData[page.id]}
            setData={page.id === 1 ? setBodyData : (data: any) => setPagesData({ ...pagesData, [page.id]: data })}
            templateSections={templateSections}
          />
          <PrescriptionFooter />
        </div>
      ))}
    </>
  );
};

export default PrescriptionPage;
