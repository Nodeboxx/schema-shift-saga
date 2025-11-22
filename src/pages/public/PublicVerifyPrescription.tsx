import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Calendar } from "lucide-react";
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
          patient:patients(name, age, sex, patient_id_display),
          doctor:profiles!prescriptions_doctor_id_fkey(
            full_name, 
            degree_en, 
            specialization, 
            registration_number, 
            license_number,
            phone,
            address,
            doctor_id_display
          ),
          clinic:clinics(
            name, 
            logo_url, 
            address, 
            phone, 
            email,
            website,
            clinic_id_display
          ),
          prescription_items(*)
        `)
        .eq('unique_hash', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        let enriched = data as any;

        // Fallback: if joined doctor is missing but user_id is present, load doctor profile separately
        if (!enriched.doctor && enriched.user_id) {
          const { data: doctorProfile } = await supabase
            .from('profiles')
            .select('full_name, degree_en, specialization, registration_number, license_number, phone, address')
            .eq('id', enriched.user_id)
            .maybeSingle();

          if (doctorProfile) {
            enriched = {
              ...enriched,
              doctor: doctorProfile,
            };
          }
        }

        setPrescription(enriched);
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-4 border-2 border-foreground">
          <div className="flex items-center justify-between mb-6 border-b-2 border-border pb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-foreground" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verified Prescription</h1>
                <p className="text-sm text-muted-foreground">Authenticated Medical Document</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-foreground text-background font-semibold rounded">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Valid
            </div>
          </div>
        </Card>

        {/* Doctor Information */}
        {prescription.doctor && (
          <Card className="p-6 mb-4 border-2 border-foreground">
            <h3 className="font-bold text-xl mb-4 text-foreground border-b-2 border-border pb-3">
              Doctor Information
            </h3>
            <div className="flex items-start gap-6">
              {prescription.clinic?.logo_url && (
                <img 
                  src={prescription.clinic.logo_url} 
                  alt="Clinic Logo" 
                  className="w-24 h-24 object-contain border-2 border-border p-2"
                />
              )}
              <div className="flex-1">
                <h2 className="font-bold text-2xl text-foreground mb-3">{prescription.doctor?.full_name}</h2>
                
                {prescription.doctor?.doctor_id_display && (
                  <p className="text-sm font-mono text-primary font-semibold mb-2">
                    Doctor ID: {prescription.doctor.doctor_id_display}
                  </p>
                )}
                
                {prescription.doctor?.degree_en && (
                  <p className="text-base text-muted-foreground mb-4 whitespace-pre-line leading-relaxed">
                    {prescription.doctor.degree_en.replace(/<br\s*\/?>/gi, '\n')}
                  </p>
                )}
                
                <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
                  {prescription.doctor?.specialization && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground">Specialization:</span>
                      <span className="text-muted-foreground">{prescription.doctor.specialization}</span>
                    </div>
                  )}
                  
                  {prescription.doctor?.registration_number && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground">Reg. No:</span>
                      <span className="text-muted-foreground">{prescription.doctor.registration_number}</span>
                    </div>
                  )}
                  
                  {prescription.doctor?.license_number && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground">License No:</span>
                      <span className="text-muted-foreground">{prescription.doctor.license_number}</span>
                    </div>
                  )}
                  
                  {prescription.doctor?.phone && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-foreground">Phone:</span>
                      <span className="text-muted-foreground">{prescription.doctor.phone}</span>
                    </div>
                  )}
                  
                  {prescription.doctor?.address && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <span className="font-semibold text-foreground">Address:</span>
                      <span className="text-muted-foreground">{prescription.doctor.address}</span>
                    </div>
                  )}
                </div>
                
                {prescription.clinic && (
                  <div className="border-t border-border pt-4 mt-4">
                    {prescription.clinic?.name && (
                      <div>
                        <p className="text-base font-bold text-foreground mb-1">
                          Clinic: {prescription.clinic.name}
                        </p>
                        {prescription.clinic?.clinic_id_display && (
                          <p className="text-sm font-mono text-primary mb-3">
                            Clinic ID: {prescription.clinic.clinic_id_display}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {prescription.clinic?.address && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-semibold text-foreground">Chamber:</span> {prescription.clinic.address}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {prescription.clinic?.phone && (
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">Phone:</span> {prescription.clinic.phone}
                        </span>
                      )}
                      {prescription.clinic?.email && (
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">Email:</span> {prescription.clinic.email}
                        </span>
                      )}
                      {prescription.clinic?.website && (
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">Website:</span> {prescription.clinic.website}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Patient Information */}
        <Card className="p-6 mb-4 border-2 border-foreground">
          <h3 className="font-bold text-xl mb-4 text-foreground border-b-2 border-border pb-3">
            Patient Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Name</p>
              <p className="text-base text-muted-foreground">{prescription.patient_name}</p>
              {prescription.patient?.patient_id_display && (
                <p className="text-xs font-mono text-primary mt-1">
                  Patient ID: {prescription.patient.patient_id_display}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Age</p>
              <p className="text-base text-muted-foreground">{prescription.patient_age || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Sex</p>
              <p className="text-base text-muted-foreground">{prescription.patient_sex || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Date</p>
              <p className="text-base text-muted-foreground">
                {prescription.prescription_date 
                  ? format(new Date(prescription.prescription_date), 'MMM dd, yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Chief Complaints & Diagnosis */}
        {(prescription.cc_text || prescription.dx_text) && (
          <Card className="p-6 mb-4 border border-border">
            {prescription.cc_text && (
              <div className="mb-4">
                <h3 className="font-semibold text-base mb-2 text-foreground border-b border-border pb-2">Chief Complaints</h3>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: prescription.cc_text.replace(/\n/g, '<br/>') }}
                />
              </div>
            )}
            {prescription.dx_text && (
              <div>
                <h3 className="font-semibold text-base mb-2 text-foreground border-b border-border pb-2">Diagnosis</h3>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: prescription.dx_text.replace(/\n/g, '<br/>') }}
                />
              </div>
            )}
          </Card>
        )}

        {/* Medicines */}
        {prescription.prescription_items && prescription.prescription_items.length > 0 && (
          <Card className="p-6 mb-4 border-2 border-foreground">
            <h3 className="font-bold text-xl mb-6 text-foreground border-b-2 border-border pb-3">
              Prescribed Medications
            </h3>
            <div className="space-y-5">
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
                    <div key={item.id} className="border-2 border-border p-5">
                      <div className="flex items-start gap-4 mb-4 border-b border-border pb-4">
                        <div className="flex-shrink-0 w-10 h-10 border-2 border-foreground flex items-center justify-center font-bold text-base text-foreground">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-foreground mb-3">{item.name}</h4>
                          <div className="space-y-2 text-sm">
                            {parsedDetails.generic_name && (
                              <div className="flex items-start">
                                <span className="font-semibold text-foreground min-w-[100px]">Generic:</span>
                                <span className="text-muted-foreground">{parsedDetails.generic_name}</span>
                              </div>
                            )}
                            {parsedDetails.strength && (
                              <div className="flex items-start">
                                <span className="font-semibold text-foreground min-w-[100px]">Strength:</span>
                                <span className="text-muted-foreground">{parsedDetails.strength}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {item.dose && (
                          <div className="border-l-4 border-foreground pl-4">
                            <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Dosage</p>
                            <p className="text-base text-foreground font-medium">{item.dose}</p>
                          </div>
                        )}
                        
                        {item.duration && (
                          <div className="border-l-4 border-muted-foreground pl-4">
                            <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Duration</p>
                            <p className="text-base text-foreground font-medium">{item.duration.replace('→ সময়কাল: ', '')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* Advice & Follow Up */}
        {(prescription.adv_text || prescription.follow_up_text) && (
          <Card className="p-6 mb-4 border border-border">
            {prescription.adv_text && (
              <div className="mb-4">
                <h3 className="font-semibold text-base mb-2 text-foreground border-b border-border pb-2">Medical Advice</h3>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: prescription.adv_text.replace(/\n/g, '<br/>') }}
                />
              </div>
            )}
            {prescription.follow_up_text && (
              <div>
                <h3 className="font-semibold text-base mb-2 text-foreground border-b border-border pb-2">Follow Up</h3>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: prescription.follow_up_text.replace(/\n/g, '<br/>') }}
                />
              </div>
            )}
          </Card>
        )}

        {/* Footer */}
        <Card className="p-5 text-center border-2 border-border">
          <p className="text-sm font-semibold text-foreground mb-1">
            ✓ Electronically Generated & Verified Prescription
          </p>
          <p className="text-xs text-muted-foreground">
            Created on {format(new Date(prescription.created_at), 'PPP')}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PublicVerifyPrescription;
