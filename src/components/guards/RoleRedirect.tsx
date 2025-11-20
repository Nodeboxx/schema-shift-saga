import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const RoleRedirect = () => {
  const { isSuperAdmin, isClinicAdmin, isDoctor, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Don't redirect if on login or public pages
    if (location.pathname === '/login' || 
        location.pathname === '/register' || 
        location.pathname.startsWith('/verify/')) {
      return;
    }

    // Super admin accessing regular dashboard -> redirect to admin
    if (isSuperAdmin && location.pathname === '/dashboard') {
      navigate('/admin', { replace: true });
      return;
    }

    // Clinic admin accessing regular dashboard -> redirect to clinic
    if (isClinicAdmin && !isSuperAdmin && location.pathname === '/dashboard') {
      navigate('/clinic', { replace: true });
      return;
    }

    // Regular doctor accessing admin/clinic pages -> redirect to dashboard
    if (isDoctor && !isClinicAdmin && !isSuperAdmin) {
      if (location.pathname === '/admin' || location.pathname === '/clinic') {
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [isSuperAdmin, isClinicAdmin, isDoctor, loading, location.pathname, navigate]);

  return null;
};
