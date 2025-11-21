import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const RoleRedirect = () => {
  const { user, roles, isSuperAdmin, isClinicAdmin, isDoctor, isPatient, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;

    // List of public pages that don't require authentication
    const publicPages = [
      '/', '/login', '/register', '/forgot-password', '/reset-password',
      '/patient-invite', '/terms', '/privacy', '/about', '/contact',
      '/find-doctors', '/book-appointment'
    ];
    
    const isPublicPage = publicPages.some(page => 
      location.pathname === page || location.pathname.startsWith('/verify/')
    );
    
    if (isPublicPage) return;

    // Check if user is a patient (has patient role)
    const isOnlyPatient = isPatient && !isDoctor && !isClinicAdmin && !isSuperAdmin;

    // Patient trying to access doctor/admin pages -> redirect to patient dashboard
    if (isOnlyPatient) {
      const doctorPages = ['/dashboard', '/prescription', '/prescriptions', '/appointments', 
                          '/analytics', '/settings', '/telemedicine', '/admin', '/clinic'];
      const isDoctorPage = doctorPages.some(page => location.pathname.startsWith(page));
      
      if (isDoctorPage && !location.pathname.startsWith('/patient/')) {
        navigate('/patient/dashboard', { replace: true });
        return;
      }
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

    // Doctor/staff trying to access patient pages -> redirect to dashboard
    if ((isDoctor || isSuperAdmin || isClinicAdmin) && location.pathname.startsWith('/patient/')) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, roles, isSuperAdmin, isClinicAdmin, isDoctor, isPatient, loading, location.pathname, navigate]);

  return null;
};
