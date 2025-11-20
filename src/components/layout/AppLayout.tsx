import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  Video
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const { isSuperAdmin, isClinicAdmin, isDoctor, loading } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { 
      to: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      show: true 
    },
    { 
      to: '/prescriptions', 
      icon: FileText, 
      label: 'All Prescriptions',
      show: isDoctor || isSuperAdmin || isClinicAdmin
    },
    { 
      to: '/dashboard?tab=patients', 
      icon: Users, 
      label: 'My Patients',
      show: isDoctor || isSuperAdmin || isClinicAdmin
    },
    { 
      to: '/appointments', 
      icon: Calendar, 
      label: 'Appointments',
      show: isDoctor || isSuperAdmin || isClinicAdmin
    },
    { 
      to: '/analytics', 
      icon: BarChart3, 
      label: 'Analytics',
      show: isDoctor || isSuperAdmin || isClinicAdmin
    },
    { 
      to: '/questionnaires', 
      icon: ClipboardList, 
      label: 'Questionnaires',
      show: isDoctor || isSuperAdmin || isClinicAdmin
    },
    { 
      to: '/notifications', 
      icon: Bell, 
      label: 'Notifications',
      show: isDoctor || isSuperAdmin || isClinicAdmin
    },
    { 
      to: '/telemedicine', 
      icon: Video, 
      label: 'Telemedicine',
      show: isDoctor || isSuperAdmin || isClinicAdmin
    },
    { 
      to: '/admin', 
      icon: Shield, 
      label: 'Admin Panel',
      show: isSuperAdmin 
    },
    { 
      to: '/clinic', 
      icon: Building2, 
      label: 'Clinic Management',
      show: isClinicAdmin || isSuperAdmin
    },
    { 
      to: '/settings', 
      icon: Settings, 
      label: 'Settings',
      show: true 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">MedEx</h1>
          <p className="text-sm text-muted-foreground mt-1">Prescription SaaS</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            if (!item.show) return null;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
