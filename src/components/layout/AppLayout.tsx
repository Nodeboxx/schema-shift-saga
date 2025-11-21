import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { hasFeatureAccess, FeatureKey, SubscriptionTier } from '@/lib/subscriptionFeatures';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  Settings, 
  Shield, 
  Building2,
  LogOut,
  Database,
  BarChart3,
  ClipboardList,
  Bell,
  Video,
  Menu,
  Lock
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const { isSuperAdmin, isClinicAdmin, isDoctor, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const [userTier, setUserTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      setUserTier((data?.subscription_tier as SubscriptionTier) || 'free');
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { 
      to: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      show: true,
      feature: null
    },
    { 
      to: '/prescriptions', 
      icon: FileText, 
      label: 'All Prescriptions',
      show: isDoctor || isSuperAdmin || isClinicAdmin,
      feature: 'prescription_history' as FeatureKey
    },
    { 
      to: '/dashboard?tab=patients', 
      icon: Users, 
      label: 'My Patients',
      show: isDoctor || isSuperAdmin || isClinicAdmin,
      feature: 'patient_management' as FeatureKey
    },
    { 
      to: '/appointments', 
      icon: Calendar, 
      label: 'Appointments',
      show: isDoctor || isSuperAdmin || isClinicAdmin,
      feature: 'appointments' as FeatureKey
    },
    { 
      to: '/analytics', 
      icon: BarChart3, 
      label: 'Analytics',
      show: isDoctor || isSuperAdmin || isClinicAdmin,
      feature: 'analytics' as FeatureKey
    },
    { 
      to: '/questionnaires', 
      icon: ClipboardList, 
      label: 'Questionnaires',
      show: isDoctor || isSuperAdmin || isClinicAdmin,
      feature: 'questionnaires' as FeatureKey
    },
    { 
      to: '/notifications', 
      icon: Bell, 
      label: 'Notifications',
      show: isDoctor || isSuperAdmin || isClinicAdmin,
      feature: null // Available for all tiers
    },
    { 
      to: '/telemedicine', 
      icon: Video, 
      label: 'Telemedicine',
      show: isDoctor || isSuperAdmin || isClinicAdmin,
      feature: 'telemedicine' as FeatureKey
    },
    { 
      to: '/admin', 
      icon: Shield, 
      label: 'Admin Panel',
      show: isSuperAdmin,
      feature: null
    },
    { 
      to: '/clinic', 
      icon: Building2, 
      label: 'Clinic Management',
      show: isClinicAdmin || isSuperAdmin,
      feature: null
    },
    { 
      to: '/settings', 
      icon: Settings, 
      label: 'Settings',
      show: true,
      feature: null
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">MedDexPro</h1>
        <p className="text-sm text-muted-foreground mt-1">Prescription SaaS</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (!item.show) return null;
          
          const isLocked = item.feature && !hasFeatureAccess(userTier, item.feature);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
              onClick={() => isMobile && setOpen(false)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
              {isLocked && <Lock className="w-4 h-4 ml-auto text-muted-foreground" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background w-full">
      {/* Mobile Header */}
      {isMobile && (
        <header className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-50">
          <div>
            <h1 className="text-xl font-bold text-primary">MedDexPro</h1>
            <p className="text-xs text-muted-foreground">Prescription SaaS</p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex flex-col h-full">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-card border-r border-border flex flex-col">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
