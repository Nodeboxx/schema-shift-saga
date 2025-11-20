import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Shield, Users, FileText, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicAppointmentBooking } from "@/components/public/PublicAppointmentBooking";

const LandingPage = () => {
  const navigate = useNavigate();
  const [heroContent, setHeroContent] = useState<any>({
    title: "Modern Prescription Management for Medical Professionals",
    subtitle: "Streamline your practice with AI-powered prescription writing, patient management, and clinic collaboration tools.",
    cta: "Start Free Trial"
  });

  useEffect(() => {
    loadCMSContent();
  }, []);

  const loadCMSContent = async () => {
    try {
      const { data } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('section_name', 'hero')
        .maybeSingle();
      
      if (data?.content) {
        setHeroContent(data.content);
      }
    } catch (error) {
      console.error('Error loading CMS content:', error);
    }
  };

  const features = [
    {
      icon: FileText,
      title: "Smart Prescription Writer",
      description: "Create professional prescriptions with voice typing, auto-formatting, and customizable templates."
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Track patient history, appointments, and medical records in one secure platform."
    },
    {
      icon: Clock,
      title: "Appointment Scheduling",
      description: "Manage your schedule with drag-and-drop calendar, automated reminders, and queue management."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with encrypted data storage and HIPAA-compliant infrastructure."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      features: [
        "5 prescriptions/month",
        "Basic templates",
        "Patient records",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "29",
      period: "per month",
      features: [
        "Unlimited prescriptions",
        "Advanced templates",
        "Voice typing",
        "Priority support",
        "Custom branding",
        "Analytics dashboard"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "99",
      period: "per month",
      features: [
        "Everything in Pro",
        "Multi-doctor clinics",
        "Team collaboration",
        "API access",
        "Dedicated support",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">MedEx</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {heroContent.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {heroContent.subtitle}
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/register')}>
                {heroContent.cta}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Everything You Need to Run Your Practice
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30" id="pricing">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative ${plan.popular ? 'border-2 border-primary shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate(`/checkout/${plan.name.toLowerCase()}`)}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Booking Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">
            Book an Appointment
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Schedule your visit with our experienced medical professionals. Choose your preferred doctor, date, and time.
          </p>
          <PublicAppointmentBooking />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">MedEx</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern prescription management for healthcare professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 MedEx. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
