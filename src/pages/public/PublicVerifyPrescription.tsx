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
          {prescription.clinic && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-4">
              {prescription.clinic.logo_url && (
                <img 
                  src={prescription.clinic.logo_url} 
                  alt="Clinic Logo" 
                  className="w-16 h-16 object-contain rounded"
                />
              )}
              <div>
                <h2 className="font-semibold text-lg">{prescription.clinic.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {prescription.doctor?.full_name}
                </p>
                {prescription.doctor?.degree_en && (
                  <p className="text-xs text-muted-foreground">
                    {prescription.doctor.degree_en}
                  </p>
                )}
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
          <Card className="p-6 mb-4">
            <h3 className="font-semibold mb-2">Diagnosis</h3>
            <p className="whitespace-pre-wrap">{prescription.dx_text}</p>
          </Card>
        )}

        {/* Chief Complaints */}
        {prescription.cc_text && (
          <Card className="p-6 mb-4">
            <h3 className="font-semibold mb-2">Chief Complaints</h3>
            <p className="whitespace-pre-wrap">{prescription.cc_text}</p>
          </Card>
        )}

        {/* Medicines */}
        {prescription.prescription_items && prescription.prescription_items.length > 0 && (
          <Card className="p-6 mb-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Prescribed Medications
            </h3>
            <div className="space-y-3">
              {prescription.prescription_items.map((item: any, index: number) => (
                <div key={item.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.dose && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Dosage: {item.dose}
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
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Advice */}
        {prescription.adv_text && (
          <Card className="p-6 mb-4">
            <h3 className="font-semibold mb-2">Medical Advice</h3>
            <p className="whitespace-pre-wrap">{prescription.adv_text}</p>
          </Card>
        )}

        {/* Follow Up */}
        {prescription.follow_up_text && (
          <Card className="p-6 mb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Follow Up
            </h3>
            <p className="whitespace-pre-wrap">{prescription.follow_up_text}</p>
          </Card>
        )}

        {/* Footer */}
        <Card className="p-4 text-center text-sm text-muted-foreground">
          <p>This is an electronically generated prescription verified by MedDexPro.</p>
          <p className="mt-1">Created on {format(new Date(prescription.created_at), 'PPP')}</p>
        </Card>
      </div>
    </div>
  );
};

export default PublicVerifyPrescription;
