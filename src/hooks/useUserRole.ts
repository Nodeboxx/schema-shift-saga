import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'clinic_admin' | 'doctor' | 'staff' | 'patient' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      console.log('Loading roles for user:', user.id, user.email);

      // Get user's highest privilege role from user_roles table
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log('User roles from DB:', roles, 'Error:', rolesError);

      if (roles && roles.length > 0) {
        // Priority order: super_admin > clinic_admin > doctor > staff > patient
        const roleHierarchy: UserRole[] = ['super_admin', 'clinic_admin', 'doctor', 'staff', 'patient'];
        const userRole = roleHierarchy.find(r => roles.some(ur => ur.role === r));
        console.log('Detected role:', userRole);
        setRole(userRole || 'doctor'); // Default to doctor if no role found
      } else {
        console.log('No roles found, defaulting to doctor');
        setRole('doctor'); // Default role
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (requiredRole: UserRole) => {
    if (!role || !requiredRole) return false;
    
    const roleHierarchy: Record<string, number> = {
      'super_admin': 5,
      'clinic_admin': 4,
      'doctor': 3,
      'staff': 2,
      'patient': 1
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const isSuperAdmin = role === 'super_admin';
  const isClinicAdmin = role === 'clinic_admin' || isSuperAdmin;
  const isDoctor = role === 'doctor' || isClinicAdmin;

  return {
    role,
    loading,
    hasRole,
    isSuperAdmin,
    isClinicAdmin,
    isDoctor,
    reload: loadUserRole
  };
};
