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
          <div className="p-6 md:p-8">
            {/* Doctor Info */}
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-start gap-4">
                {prescription.clinics?.logo_url && (
                  <img
                    src={prescription.clinics.logo_url}
                    alt={prescription.clinics.name || "Clinic Logo"}
                    className="h-16 w-16 object-contain rounded border border-border"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 text-foreground">
                    {prescription.profiles?.full_name || "Doctor"}
                  </h2>
                  {prescription.profiles?.degree_en && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {prescription.profiles.degree_en.replace(/<br\s*\/?>/gi, '\n')}
                    </p>
                  )}
                  {prescription.clinics?.name && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-primary">{prescription.clinics.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Patient Information */}
            <div className="bg-gradient-to-br from-background to-muted/50 rounded-lg p-5 border border-border shadow-sm mb-6">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Patient Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background/80 rounded-md p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">PATIENT NAME</p>
                  <p className="font-bold text-base text-foreground">{prescription.patient_name}</p>
                </div>
                {prescription.patient_age && (
                  <div className="bg-background/80 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">AGE</p>
                    <p className="font-semibold text-foreground">{prescription.patient_age}</p>
                  </div>
                )}
                {prescription.patient_sex && (
                  <div className="bg-background/80 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">SEX</p>
                    <p className="font-semibold capitalize text-foreground">{prescription.patient_sex}</p>
                  </div>
                )}
                {prescription.patient_weight && (
                  <div className="bg-background/80 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">WEIGHT</p>
                    <p className="font-semibold text-foreground">{prescription.patient_weight}</p>
                  </div>
                )}
                {prescription.prescription_date && (
                  <div className="bg-background/80 rounded-md p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">DATE</p>
                    <p className="font-semibold text-foreground">
                      {new Date(prescription.prescription_date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vitals */}
            {(prescription.oe_bp_s || prescription.oe_pulse || prescription.oe_temp || prescription.oe_spo2) && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Vital Signs
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {prescription.oe_bp_s && prescription.oe_bp_d && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg p-3 border border-red-200 dark:border-red-800">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Blood Pressure</p>
                        <p className="font-bold text-lg text-red-900 dark:text-red-100">{prescription.oe_bp_s}/{prescription.oe_bp_d}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">mmHg</p>
                      </div>
                    )}
                    {prescription.oe_pulse && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Pulse Rate</p>
                        <p className="font-bold text-lg text-blue-900 dark:text-blue-100">{prescription.oe_pulse}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">bpm</p>
                      </div>
                    )}
                    {prescription.oe_temp && (
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Temperature</p>
                        <p className="font-bold text-lg text-orange-900 dark:text-orange-100">{prescription.oe_temp}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">°C</p>
                      </div>
                    )}
                    {prescription.oe_spo2 && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Oxygen Saturation</p>
                        <p className="font-bold text-lg text-green-900 dark:text-green-100">{prescription.oe_spo2}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">%</p>
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
                <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-100">Chief Complaints</h3>
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: prescription.cc_text.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </>
            )}

            {/* Diagnosis */}
            {prescription.dx_text && (
              <>
                <Separator className="my-6" />
                <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-lg p-5 border border-rose-200 dark:border-rose-800">
                  <h3 className="font-semibold text-lg mb-3 text-rose-900 dark:text-rose-100">Diagnosis</h3>
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: prescription.dx_text.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </>
            )}

            {prescription.prescription_items && prescription.prescription_items.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    Prescribed Medications
                  </h3>
                  <div className="space-y-4">
                    {prescription.prescription_items
                      .filter((item: any) => item.item_type === 'medicine')
                      .map((item: any, index: number) => {
                        // Parse details if it's JSON
                        let parsedDetails: any = {};
                        try {
                          if (item.details) {
                            parsedDetails = JSON.parse(item.details);
                          }
                        } catch (e) {
                          parsedDetails = { details: item.details };
                        }

                        return (
                          <div key={index} className="bg-gradient-to-br from-background to-muted/30 rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-base text-foreground mb-1">{item.name}</h4>
                                {parsedDetails.generic_name && (
                                  <p className="text-sm text-primary font-medium">
                                    Generic: {parsedDetails.generic_name}
                                  </p>
                                )}
                                {parsedDetails.strength && (
                                  <p className="text-sm text-muted-foreground">
                                    Strength: {parsedDetails.strength}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {item.dose && (
                              <div className="bg-primary/5 rounded-md p-3 mb-2 border-l-4 border-primary">
                                <p className="text-xs font-semibold text-primary mb-1">DOSAGE</p>
                                <p className="text-sm font-medium text-foreground">{item.dose}</p>
                              </div>
                            )}
                            
                            {item.duration && (
                              <div className="bg-secondary/50 rounded-md p-3 mb-2 border-l-4 border-secondary">
                                <p className="text-xs font-semibold text-secondary-foreground mb-1">DURATION</p>
                                <p className="text-sm font-medium text-foreground">{item.duration.replace('→ সময়কাল: ', '')}</p>
                              </div>
                            )}
                            
                            {parsedDetails.details && (
                              <p className="text-sm text-muted-foreground italic mt-2 pl-3 border-l-2 border-muted">
                                {parsedDetails.details}
                              </p>
                            )}
                            
                            {parsedDetails.manufacturer_name && (
                              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                <span className="font-semibold">Manufacturer:</span> {parsedDetails.manufacturer_name}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}

            {/* Advice */}
            {prescription.adv_text && (
              <>
                <Separator className="my-6" />
                <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-5 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-lg mb-3 text-amber-900 dark:text-amber-100">Medical Advice</h3>
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: prescription.adv_text.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </>
            )}

            {/* Follow Up */}
            {prescription.follow_up_text && (
              <>
                <Separator className="my-6" />
                <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-lg mb-3 text-purple-900 dark:text-purple-100">Follow Up Instructions</h3>
                  <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: prescription.follow_up_text.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Footer Note */}
        <Card className="p-6 text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <p className="text-sm font-medium text-foreground mb-1">
            ✓ This is a verified digital prescription
          </p>
          <p className="text-xs text-muted-foreground">
            Authenticated and secured by MedRxPro. For queries, please contact the issuing clinic.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default VerifyPrescription;
