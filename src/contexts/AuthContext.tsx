import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'super_admin' | 'clinic_admin' | 'doctor' | 'staff' | 'patient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: UserRole[];
  loading: boolean;
  isSuperAdmin: boolean;
  isClinicAdmin: boolean;
  isDoctor: boolean;
  isStaff: boolean;
  hasRole: (role: UserRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_roles', {
        target_user_id: userId
      });

      if (error) throw error;

      const roleList = (data || []).map((r: any) => r.role as UserRole);
      setRoles(roleList);
      return roleList;
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast({
        title: 'Error loading user roles',
        description: error.message,
        variant: 'destructive'
      });
      return [];
    }
  };

  const refreshRoles = async () => {
    if (user) {
      await loadRoles(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Load roles after state update
          setTimeout(async () => {
            await loadRoles(currentSession.user.id);
            setLoading(false);
          }, 0);
        } else {
          setRoles([]);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadRoles(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole) => roles.includes(role);

  const isSuperAdmin = roles.includes('super_admin');
  const isClinicAdmin = roles.includes('clinic_admin') || isSuperAdmin;
  const isDoctor = roles.includes('doctor') || isClinicAdmin;
  const isStaff = roles.includes('staff') || isDoctor;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        isSuperAdmin,
        isClinicAdmin,
        isDoctor,
        isStaff,
        hasRole,
        refreshRoles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
