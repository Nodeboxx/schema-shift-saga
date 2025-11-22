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
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg mb-4 border border-primary/20">
              <div className="flex items-start gap-4">
                {prescription.clinic?.logo_url && (
                  <img 
                    src={prescription.clinic.logo_url} 
                    alt="Clinic Logo" 
                    className="w-20 h-20 object-contain rounded-lg bg-background p-2 border border-border shadow-sm"
                  />
                )}
                <div className="flex-1">
                  <h2 className="font-bold text-xl text-foreground mb-2">{prescription.doctor?.full_name}</h2>
                  {prescription.doctor?.degree_en && (
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line leading-relaxed">
                      {prescription.doctor.degree_en.replace(/<br\s*\/?>/gi, '\n')}
                    </p>
                  )}
                  {prescription.clinic?.name && (
                    <div className="inline-flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      <span className="text-sm font-semibold text-primary-foreground">{prescription.clinic.name}</span>
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
          <Card className="p-6 mb-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
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
                    <div key={item.id} className="bg-gradient-to-br from-background to-muted/30 rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
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
