import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HeartPulse, Users, Target, Award } from "lucide-react";

const AboutUs = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: HeartPulse,
      title: "Patient-Centered",
      description: "Every feature we build is designed to improve patient outcomes and healthcare delivery."
    },
    {
      icon: Users,
      title: "Empowering Providers",
      description: "We give healthcare professionals the tools they need to focus on what matters most - patient care."
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Continuously advancing healthcare technology with AI and modern solutions."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to the highest standards of quality, security, and reliability."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">About HealthScribe</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Transforming healthcare delivery through intelligent technology and compassionate design
            </p>
          </div>

          <Card className="p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              HealthScribe exists to empower healthcare professionals with modern, intuitive technology that simplifies practice management and enhances patient care. We believe that by reducing administrative burden, we enable doctors to dedicate more time to what truly matters - their patients.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform combines cutting-edge AI technology with practical healthcare workflows, creating a seamless experience for medical professionals worldwide.
            </p>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-purple-500/10">
            <h2 className="text-3xl font-semibold mb-6">Our Story</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Founded by healthcare professionals and technology experts, HealthScribe was born from firsthand experience with the challenges of modern medical practice. We witnessed doctors spending countless hours on paperwork, struggling with outdated systems, and longing for better tools.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Today, HealthScribe serves thousands of healthcare providers across multiple countries, helping them streamline their workflows, improve patient engagement, and deliver better care outcomes.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're just getting started. Our vision is a world where every healthcare provider has access to intelligent, affordable technology that amplifies their impact and enriches the patient experience.
            </p>
          </Card>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-6">Join Thousands of Healthcare Professionals</h2>
            <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600" onClick={() => navigate('/register')}>
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
