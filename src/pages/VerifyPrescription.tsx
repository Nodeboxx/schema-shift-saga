import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Pill, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PrescriptionData {
  id: string;
  patient_name: string;
  patient_age: string | null;
  patient_sex: string | null;
  patient_weight: string | null;
  prescription_date: string | null;
  dx_text: string | null;
  adv_text: string | null;
  cc_text: string | null;
  follow_up_text: string | null;
  oe_bp_s: string | null;
  oe_bp_d: string | null;
  oe_pulse: string | null;
  oe_temp: string | null;
  oe_spo2: string | null;
  prescription_items: Array<{
    name: string;
    dose: string | null;
    duration: string | null;
    details: string | null;
  }>;
  profiles: {
    full_name: string | null;
    degree_en: string | null;
  } | null;
  clinics: {
    name: string | null;
    logo_url: string | null;
  } | null;
}

const VerifyPrescription = () => {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, [id]);

  const loadPrescription = async () => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      // First try by unique_hash, then by id
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          prescription_items (*),
          profiles!prescriptions_doctor_id_fkey (full_name, degree_en),
          clinics (name, logo_url)
        `);

      // Try as unique_hash first
      let { data, error: fetchError } = await query.eq("unique_hash", id).maybeSingle();

      // If not found, try as ID
      if (!data && !fetchError) {
        const result = await query.eq("id", id).maybeSingle();
        data = result.data;
        fetchError = result.error;
      }

      if (fetchError) throw fetchError;

      if (!data) {
        setError(true);
        setLoading(false);
        return;
      }

      setPrescription(data as PrescriptionData);
    } catch (err) {
      console.error("Error loading prescription:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 md:p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Prescription</h1>
          <p className="text-muted-foreground">
            This prescription ID is invalid or has expired. Please check the code and try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Verification Badge */}
        <div className="flex justify-center">
          <Badge variant="default" className="gap-2 px-4 py-2 text-base bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-5 h-5" />
            Verified Prescription
          </Badge>
        </div>

        {/* Main Prescription Card */}
        <Card className="overflow-hidden">
          {/* Clinic Branding */}
          {prescription.clinics?.logo_url && (
            <div className="bg-primary/5 p-4 border-b">
              <img
                src={prescription.clinics.logo_url}
                alt={prescription.clinics.name || "Clinic Logo"}
                className="h-16 mx-auto object-contain"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Doctor Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">
                {prescription.profiles?.full_name || "Doctor"}
              </h2>
              {prescription.profiles?.degree_en && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {prescription.profiles.degree_en.replace(/<br\s*\/?>/gi, '\n')}
                </p>
              )}
              {prescription.clinics?.name && (
                <p className="text-sm font-medium mt-2">{prescription.clinics.name}</p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Patient Information */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="font-semibold text-lg">{prescription.patient_name}</p>
              </div>
              {prescription.patient_age && (
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{prescription.patient_age}</p>
                </div>
              )}
              {prescription.patient_sex && (
                <div>
                  <p className="text-sm text-muted-foreground">Sex</p>
                  <p className="font-semibold capitalize">{prescription.patient_sex}</p>
                </div>
              )}
              {prescription.patient_weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{prescription.patient_weight}</p>
                </div>
              )}
              {prescription.prescription_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {new Date(prescription.prescription_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
            </div>

            {/* Vitals */}
            {(prescription.oe_bp_s || prescription.oe_pulse || prescription.oe_temp || prescription.oe_spo2) && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Vitals
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {prescription.oe_bp_s && prescription.oe_bp_d && (
                      <div>
                        <p className="text-xs text-muted-foreground">BP</p>
                        <p className="font-medium">{prescription.oe_bp_s}/{prescription.oe_bp_d} mmHg</p>
                      </div>
                    )}
                    {prescription.oe_pulse && (
                      <div>
                        <p className="text-xs text-muted-foreground">Pulse</p>
                        <p className="font-medium">{prescription.oe_pulse} bpm</p>
                      </div>
                    )}
                    {prescription.oe_temp && (
                      <div>
                        <p className="text-xs text-muted-foreground">Temperature</p>
                        <p className="font-medium">{prescription.oe_temp}°C</p>
                      </div>
                    )}
                    {prescription.oe_spo2 && (
                      <div>
                        <p className="text-xs text-muted-foreground">SpO₂</p>
                        <p className="font-medium">{prescription.oe_spo2}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Chief Complaints */}
            {prescription.cc_text && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-2">Chief Complaints</h3>
                  <p className="whitespace-pre-wrap text-sm">{prescription.cc_text}</p>
                </div>
              </>
            )}

            {/* Diagnosis */}
            {prescription.dx_text && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-2">Diagnosis</h3>
                  <p className="whitespace-pre-wrap text-sm">{prescription.dx_text}</p>
                </div>
              </>
            )}

            {/* Medicines */}
            {prescription.prescription_items && prescription.prescription_items.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Prescribed Medications
                  </h3>
                  <div className="space-y-3">
                    {prescription.prescription_items.map((item, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4">
                        <p className="font-medium">{item.name}</p>
                        {item.dose && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Dose: {item.dose}
                          </p>
                        )}
                        {item.duration && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {item.duration}
                          </p>
                        )}
                        {item.details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Advice */}
            {prescription.adv_text && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-2">Advice</h3>
                  <p className="whitespace-pre-wrap text-sm">{prescription.adv_text}</p>
                </div>
              </>
            )}

            {/* Follow Up */}
            {prescription.follow_up_text && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-2">Follow Up</h3>
                  <p className="whitespace-pre-wrap text-sm">{prescription.follow_up_text}</p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground">
          This is a verified digital prescription. For any queries, please contact the issuing clinic.
        </p>
      </div>
    </div>
  );
};

export default VerifyPrescription;
