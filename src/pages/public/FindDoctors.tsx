import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import maleAvatar from "@/assets/avatar-male-doctor.svg";
import femaleAvatar from "@/assets/avatar-female-doctor.svg";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  degree_en: string;
  designation: string;
  avatar_url: string;
  bio: string;
  consultation_fee: number;
  phone: string;
  address: string;
  sex: string | null;
}

const FindDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [loading, setLoading] = useState(true);

  const specialties = ["All", "Physician", "Orthopedics", "Medicine", "Cardiologist", "Surgeon", "Cancer", "Radiotherapy", "Others"];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedSpecialty, doctors]);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, specialization, degree_en, designation, avatar_url, bio, consultation_fee, phone, address, sex")
        .eq("role", "doctor")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
      setFilteredDoctors(data || []);
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by specialty
    if (selectedSpecialty !== "All") {
      filtered = filtered.filter(doc => 
        doc.specialization?.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.degree_en?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Find Doctors</h1>
          <p className="text-center text-lg opacity-90 max-w-2xl mx-auto">
            We're here to help you directly to improved health outcomes, effectively connecting you with the care you need.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search your doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {specialties.map(specialty => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? "default" : "outline"}
                onClick={() => setSelectedSpecialty(specialty)}
                className="rounded-full"
              >
                {specialty}
              </Button>
            ))}
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Doctor Image */}
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                    {doctor.avatar_url ? (
                      <img 
                        src={doctor.avatar_url} 
                        alt={doctor.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={doctor.sex === 'female' ? femaleAvatar : maleAvatar}
                        alt={`${doctor.full_name} - Doctor`}
                        className="w-full h-full object-contain p-2"
                      />
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{doctor.full_name}</h3>
                  
                  {doctor.specialization && (
                    <Badge className="mb-2" variant="secondary">
                      {doctor.specialization}
                    </Badge>
                  )}

                  {doctor.degree_en && (
                    <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                      <span className="text-primary">🎓</span>
                      {doctor.degree_en}
                    </p>
                  )}

                  {doctor.designation && (
                    <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-1">
                      <span className="text-primary">💼</span>
                      {doctor.designation}
                    </p>
                  )}

                  {doctor.address && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {doctor.address}
                    </p>
                  )}

                  {doctor.phone && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" />
                      {doctor.phone}
                    </p>
                  )}
                </div>

                {/* Book Button */}
                <Link to={`/book-appointment?doctor=${doctor.id}`}>
                  <Button className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No doctors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
    </PublicLayout>
  );
};

export default FindDoctors;
