import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicAppointmentBooking } from "@/components/public/PublicAppointmentBooking";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctor");
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId]);

  const loadDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", doctorId)
        .single();

      if (error) throw error;
      if (data) {
        setDoctorName(data.full_name || "");
      }
    } catch (error) {
      console.error("Error loading doctor:", error);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          {doctorName && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Book Appointment with {doctorName}
              </h1>
              <p className="text-muted-foreground">
                Fill in the details below to request an appointment
              </p>
            </div>
          )}
          <PublicAppointmentBooking />
        </div>
      </div>
    </PublicLayout>
  );
};

export default BookAppointment;
