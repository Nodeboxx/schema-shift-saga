import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeartPulse, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const navigate = useNavigate();
  const [headerContent, setHeaderContent] = useState<any>(null);
  const [footerContent, setFooterContent] = useState<any>(null);
  const [siteLogo, setSiteLogo] = useState<any>(null);
  const [siteName, setSiteName] = useState("MedDexPro");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['header_content', 'footer_content', 'site_logo', 'site_name']);

      data?.forEach((setting: any) => {
        if (setting.key === 'header_content') {
          setHeaderContent(setting.value);
        } else if (setting.key === 'footer_content') {
          setFooterContent(setting.value);
        } else if (setting.key === 'site_logo') {
          setSiteLogo(setting.value);
        } else if (setting.key === 'site_name') {
          setSiteName(setting.value?.value || 'MedDexPro');
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {headerContent?.html ? (
        <div dangerouslySetInnerHTML={{ __html: headerContent.html }} />
      ) : (
        <>
          <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                  {siteLogo?.url ? (
                    <img src={siteLogo.url} alt={siteLogo.alt || siteName} className="h-10 w-auto" />
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600">
                        <HeartPulse className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {siteName}
                      </span>
                    </>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-8">
                  <a 
                    href="#features" 
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Pricing
                  </a>
                  <a 
                    href="#booking" 
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Book Appointment
                  </a>
                  <a href="/find-doctors" className="text-muted-foreground hover:text-foreground transition-colors">
                    Find Doctors
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
        </>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {footerContent?.html ? (
        <div dangerouslySetInnerHTML={{ __html: footerContent.html }} />
      ) : (
        <footer className="border-t border-border py-16 bg-card">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {siteLogo?.url ? (
                    <img src={siteLogo.url} alt={siteLogo.alt || siteName} className="h-10 w-auto" />
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600">
                        <HeartPulse className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {siteName}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Transform your healthcare practice with intelligent automation and seamless patient engagement.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg">Product</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <a 
                      href="#features" 
                      className="hover:text-foreground transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#pricing" 
                      className="hover:text-foreground transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Pricing
                    </a>
                  </li>
                  <li><a href="/find-doctors" className="hover:text-foreground transition-colors">Find Doctors</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg">Company</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
                  <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg">Legal</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
