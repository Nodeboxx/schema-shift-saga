import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";

const PublicVerifyPrescription = () => {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, [id]);

  const loadPrescription = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients(name, age, sex),
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, degree_en, specialization),
          clinic:clinics(name, logo_url),
          prescription_items(*)
        `)
        .eq('unique_hash', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPrescription(data);
        setValid(true);
      } else {
        setValid(false);
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying prescription...</p>
        </div>
      </div>
    );
  }

  if (!valid || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Prescription</h1>
          <p className="text-muted-foreground">
            This prescription could not be verified. Please check the QR code or link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Verified Prescription</h1>
                <p className="text-sm text-muted-foreground">Authenticated Medical Document</p>
              </div>
            </div>
            <Badge className="bg-green-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              Valid
            </Badge>
          </div>

          {/* Clinic/Doctor Info */}
          {prescription.doctor && (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-xl mb-4 border-2 border-primary/30 shadow-lg">
              <div className="flex items-start gap-6">
                {prescription.clinic?.logo_url && (
                  <img 
                    src={prescription.clinic.logo_url} 
                    alt="Clinic Logo" 
                    className="w-24 h-24 object-contain rounded-xl bg-background p-3 border-2 border-border shadow-md"
                  />
                )}
                <div className="flex-1">
                  <h2 className="font-bold text-2xl text-foreground mb-3">{prescription.doctor?.full_name}</h2>
                  {prescription.doctor?.degree_en && (
                    <p className="text-base text-muted-foreground mb-4 whitespace-pre-line leading-relaxed">
                      {prescription.doctor.degree_en.replace(/<br\s*\/?>/gi, '\n')}
                    </p>
                  )}
                  {prescription.doctor?.specialization && (
                    <p className="text-sm text-primary font-medium mb-3">
                      Specialization: {prescription.doctor.specialization}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {prescription.clinic?.name && (
                      <div className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full shadow-md">
                        <CheckCircle className="w-5 h-5 text-primary-foreground" />
                        <span className="text-base font-semibold text-primary-foreground">{prescription.clinic.name}</span>
                      </div>
                    )}
                    {prescription.clinic?.address && (
                      <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                        <span className="text-sm text-secondary-foreground">{prescription.clinic.address}</span>
                      </div>
                    )}
                  </div>
                  {(prescription.clinic?.phone || prescription.clinic?.email) && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {prescription.clinic?.phone && (
                        <span>📞 {prescription.clinic.phone}</span>
                      )}
                      {prescription.clinic?.email && (
                        <span>✉️ {prescription.clinic.email}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Patient Information */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{prescription.patient_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">{prescription.patient_age || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sex</p>
              <p className="font-medium">{prescription.patient_sex || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {prescription.prescription_date 
                  ? format(new Date(prescription.prescription_date), 'MMM dd, yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Diagnosis */}
        {prescription.dx_text && (
          <Card className="p-6 mb-4 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-rose-900/20 border-rose-200 dark:border-rose-800">
            <h3 className="font-semibold text-lg mb-3 text-rose-900 dark:text-rose-100">Diagnosis</h3>
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: prescription.dx_text.replace(/\n/g, '<br/>') }}
            />
          </Card>
        )}

        {/* Chief Complaints */}
        {prescription.cc_text && (
          <Card className="p-6 mb-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-100">Chief Complaints</h3>
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: prescription.cc_text.replace(/\n/g, '<br/>') }}
            />
          </Card>
        )}

        {/* Medicines */}
        {prescription.prescription_items && prescription.prescription_items.length > 0 && (
          <Card className="p-8 mb-4 bg-gradient-to-br from-background to-primary/5">
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-primary">
              <FileText className="w-7 h-7" />
              Prescribed Medications
            </h3>
            <div className="space-y-6">
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
                    <div key={item.id} className="bg-background rounded-xl p-6 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                          <span className="text-lg font-bold text-primary-foreground">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-xl text-foreground mb-2">{item.name}</h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            {parsedDetails.generic_name && (
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-primary min-w-[80px]">Generic:</span>
                                <span className="text-foreground">{parsedDetails.generic_name}</span>
                              </div>
                            )}
                            {parsedDetails.strength && (
                              <div className="flex items-start gap-2">
                                <span className="font-semibold text-primary min-w-[80px]">Strength:</span>
                                <span className="text-foreground">{parsedDetails.strength}</span>
                              </div>
                            )}
                            {parsedDetails.manufacturer_name && (
                              <div className="flex items-start gap-2 md:col-span-2">
                                <span className="font-semibold text-primary min-w-[80px]">Manufacturer:</span>
                                <span className="text-muted-foreground">{parsedDetails.manufacturer_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {item.dose && (
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-3 border-l-4 border-primary shadow-sm">
                          <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">DOSAGE INSTRUCTIONS</p>
                          <p className="text-base font-semibold text-foreground leading-relaxed">{item.dose}</p>
                        </div>
                      )}
                      
                      {item.duration && (
                        <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg p-4 mb-3 border-l-4 border-secondary shadow-sm">
                          <p className="text-xs font-bold text-secondary-foreground mb-2 uppercase tracking-wide">DURATION</p>
                          <p className="text-base font-semibold text-foreground">{item.duration.replace('→ সময়কাল: ', '')}</p>
                        </div>
                      )}
                      
                      {parsedDetails.details && (
                        <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-muted">
                          <p className="text-sm text-muted-foreground italic leading-relaxed">
                            <span className="font-semibold text-foreground">Note:</span> {parsedDetails.details}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* Advice */}
        {prescription.adv_text && (
          <Card className="p-6 mb-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <h3 className="font-semibold text-lg mb-3 text-amber-900 dark:text-amber-100">Medical Advice</h3>
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: prescription.adv_text.replace(/\n/g, '<br/>') }}
            />
          </Card>
        )}

        {/* Follow Up */}
        {prescription.follow_up_text && (
          <Card className="p-6 mb-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Calendar className="w-5 h-5" />
              Follow Up Instructions
            </h3>
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: prescription.follow_up_text.replace(/\n/g, '<br/>') }}
            />
          </Card>
        )}

        {/* Footer */}
        <Card className="p-6 text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <p className="text-sm font-medium text-foreground mb-1">
            ✓ Electronically Generated & Verified Prescription
          </p>
          <p className="text-xs text-muted-foreground">
            Secured by MedDexPro • Created on {format(new Date(prescription.created_at), 'PPP')}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PublicVerifyPrescription;
