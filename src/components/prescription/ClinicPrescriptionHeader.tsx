import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClinicPrescriptionHeaderProps {
  clinicId: string;
  prescriptionDate?: string;
}

const ClinicPrescriptionHeader = ({ clinicId, prescriptionDate }: ClinicPrescriptionHeaderProps) => {
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinicBranding = async () => {
      try {
        const { data, error } = await supabase
          .from("clinics")
          .select("name, logo_url, header_image_url, address, phone, email, website")
          .eq("id", clinicId)
          .single();

        if (error) throw error;
        setClinic(data);
      } catch (error) {
        console.error("Error loading clinic branding:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClinicBranding();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 animate-pulse" />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-t-lg">
      {/* Header Background Image */}
      {clinic?.header_image_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${clinic.header_image_url})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/5 to-purple-500/10" />
      )}

      {/* Header Content */}
      <div className="relative px-8 py-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Clinic Logo and Info */}
          <div className="flex items-center gap-4 flex-1">
            {clinic?.logo_url && (
              <div className="flex-shrink-0">
                <img
                  src={clinic.logo_url}
                  alt={`${clinic.name} Logo`}
                  className="h-20 w-20 object-contain bg-white rounded-lg p-2 shadow-md"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {clinic?.name || "Clinic Name"}
              </h1>
              {clinic?.address && (
                <p className="text-sm text-muted-foreground">
                  {clinic.address}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {clinic?.phone && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Phone:</span> {clinic.phone}
                  </span>
                )}
                {clinic?.email && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Email:</span> {clinic.email}
                  </span>
                )}
                {clinic?.website && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Web:</span> {clinic.website}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Date */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-muted-foreground mb-1">
              Prescription Date
            </div>
            <div className="text-sm font-semibold text-foreground">
              {prescriptionDate
                ? new Date(prescriptionDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
            </div>
          </div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="mt-4 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full" />
      </div>
    </div>
  );
};

export default ClinicPrescriptionHeader;
