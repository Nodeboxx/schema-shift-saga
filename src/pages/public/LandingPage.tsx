import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Check, 
  ArrowRight, 
  Shield, 
  Users, 
  FileText, 
  Clock,
  Stethoscope,
  Pill,
  Activity,
  Microscope,
  HeartPulse,
  Calendar,
  ChevronRight,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicAppointmentBooking } from "@/components/public/PublicAppointmentBooking";

const LandingPage = () => {
  const navigate = useNavigate();
  const [heroContent, setHeroContent] = useState<any>({
    title: "Transform Your Healthcare Practice",
    subtitle: "Intelligent automation, seamless patient engagement, and meaningful results with MedScribe",
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
      title: "Digital Prescription",
      description: "Create professional prescriptions instantly with AI-powered templates and voice input.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Patient Portal",
      description: "Complete patient management with medical history, appointments, and real-time updates.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent appointment booking with automated reminders and queue management.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Activity,
      title: "Health Analytics",
      description: "Track patient vitals, treatment outcomes, and practice performance metrics.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Bank-level encryption with full compliance to healthcare data protection standards.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Microscope,
      title: "Lab Integration",
      description: "Seamless integration with diagnostic labs for instant test results and reports.",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const stats = [
    { value: "5000+", label: "Active Doctors" },
    { value: "100k+", label: "Patients Served" },
    { value: "500k+", label: "Prescriptions" },
    { value: "99.9%", label: "Uptime" }
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
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-6 text-center text-sm">
        <p>🎉 Trusted by doctors. Rated the #1 choice in digital healthcare management</p>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MedScribe
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#booking" className="text-muted-foreground hover:text-foreground transition-colors">
                Book Appointment
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        
        {/* Floating medical icons */}
        <div className="absolute top-20 left-10 opacity-20 animate-float">
          <Stethoscope className="w-16 h-16 text-primary" />
        </div>
        <div className="absolute top-40 right-20 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
          <Pill className="w-12 h-12 text-purple-600" />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          <Activity className="w-14 h-14 text-pink-600" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 mb-6 animate-fade-in">
              <Star className="w-4 h-4 fill-current" />
              Trusted by 5000+ Medical Professionals Worldwide
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Unifying Healthcare
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Simplifying Lives
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Transform your healthcare practice with intelligent automation, seamless patient engagement, and meaningful results made possible by MedScribe
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all group" 
                onClick={() => navigate('/register')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2" 
                onClick={() => navigate('/login')}
              >
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Run Your Practice
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive digital healthcare solutions designed for modern medical professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Flexible pricing for practices of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative hover:shadow-2xl transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-xl scale-105' 
                    : 'hover:scale-105'
                } animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period.split(' ')[1] || plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-purple-600 hover:opacity-90' 
                      : ''
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate(`/checkout/${plan.name.toLowerCase()}`)}
                >
                  {plan.cta}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Booking Section */}
      <section id="booking" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Book an Appointment
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Schedule your visit with our experienced medical professionals. Choose your preferred doctor, date, and time.
            </p>
          </div>
          <PublicAppointmentBooking />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600">
                  <HeartPulse className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  MedScribe
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transform your healthcare practice with intelligent automation and seamless patient engagement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 MedScribe. All rights reserved. Empowering healthcare professionals worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
