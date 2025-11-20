import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useUserRole } from '@/hooks/useUserRole';
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
  Database
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const { role, isSuperAdmin, isClinicAdmin, isDoctor } = useUserRole();

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
      to: '/prescription', 
      icon: FileText, 
      label: 'Prescriptions',
      show: isDoctor 
    },
    { 
      to: '/appointments', 
      icon: Calendar, 
      label: 'Appointments',
      show: isDoctor 
    },
    { 
      to: '/import-data', 
      icon: Database, 
      label: 'Import Data',
      show: isDoctor 
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
      show: isClinicAdmin 
    },
    { 
      to: '/settings', 
      icon: Settings, 
      label: 'Settings',
      show: true 
    },
  ];

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
