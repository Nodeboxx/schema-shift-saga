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
  Calendar,
  ChevronRight,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicAppointmentBooking } from "@/components/public/PublicAppointmentBooking";
import { ProductsSection } from "@/components/public/ProductsSection";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PricingSection } from "@/components/public/PricingSection";

const iconMap: Record<string, any> = {
  FileText, Users, Calendar, Activity, Shield, Microscope, Stethoscope, Pill
};

const CMSLandingPage = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Load CMS sections
      const { data: sectionsData } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('is_published', true)
        .order('display_order');

      // Load products for pricing
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .in('slug', ['free-plan', 'pro-plan', 'enterprise-plan'])
        .order('price');

      setSections(sectionsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSection = (name: string) => {
    return sections.find(s => s.section_name === name);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PublicLayout>
    );
  }

  const hero = getSection('hero');
  const features = getSection('features');
  const pricing = getSection('pricing');
  const pricingPlans = getSection('pricing_plans');
  const booking = getSection('booking');

  return (
    <PublicLayout>
      {/* Hero Section */}
      {hero && (
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
          
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
              {hero.content.announcement && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 mb-6 animate-fade-in">
                  <Star className="w-4 h-4 fill-current" />
                  {hero.content.announcement}
                </div>
              )}
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {hero.content.title}
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {hero.content.subtitle}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {hero.content.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all group" 
                  onClick={() => navigate('/register')}
                >
                  {hero.content.cta_primary || "Start Free Trial"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-2" 
                  onClick={() => navigate('/login')}
                >
                  {hero.content.cta_secondary || "Watch Demo"}
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
            {hero.content.stats && (
              <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                {hero.content.stats.map((stat: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      {features && (
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {features.content.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {features.content.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.content.features?.map((feature: any, index: number) => {
                const Icon = iconMap[feature.icon] || Activity;
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
      )}

      {/* Pricing Plans Section */}
      {pricingPlans && pricingPlans.content && (
        <PricingSection content={pricingPlans.content as any} />
      )}

      {/* Products Section */}
      <ProductsSection />

      {/* Legacy Pricing Section */}
      {pricing && (
        <section className="py-20 bg-muted/30" id="pricing">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {pricing.content.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {pricing.content.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {products.map((product: any, index: number) => {
                const features = product.attributes?.features || [];
                const isPopular = product.slug === 'pro-plan';
                
                return (
                  <Card 
                    key={product.id} 
                    className={`p-8 relative hover:shadow-2xl transition-all duration-300 ${
                      isPopular 
                        ? 'border-2 border-primary shadow-xl scale-105' 
                        : 'hover:scale-105'
                    } animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                      <div className="mb-2">
                        <span className="text-5xl font-bold">${product.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${
                        isPopular 
                          ? 'bg-gradient-to-r from-primary to-purple-600 hover:opacity-90' 
                          : ''
                      }`}
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => navigate(`/checkout/${product.slug}`)}
                    >
                      {product.attributes?.cta || "Get Started"}
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Appointment Booking Section */}
      {booking && (
        <section id="booking" className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {booking.content.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {booking.content.subtitle}
              </p>
            </div>
            <PublicAppointmentBooking />
          </div>
        </section>
      )}
    </PublicLayout>
  );
};

export default CMSLandingPage;
