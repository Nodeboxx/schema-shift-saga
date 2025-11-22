import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const RoleRedirect = () => {
  const { user, roles, isSuperAdmin, isClinicAdmin, isDoctor, isPatient, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [checkingClinic, setCheckingClinic] = useState(true);

  // Check if doctor is part of a clinic
  useEffect(() => {
    const checkClinicMembership = async () => {
      if (!user || !isDoctor) {
        setCheckingClinic(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_id')
          .eq('id', user.id)
          .maybeSingle();

        setClinicId(profile?.clinic_id || null);
      } catch (error) {
        console.error('Error checking clinic membership:', error);
      } finally {
        setCheckingClinic(false);
      }
    };

    checkClinicMembership();
  }, [user, isDoctor]);

  useEffect(() => {
    if (loading || !user || checkingClinic) return;

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
      navigate('/clinic/dashboard', { replace: true });
      return;
    }

    // Doctor who is part of a clinic -> redirect to clinic dashboard
    if (isDoctor && clinicId && !isSuperAdmin) {
      // If trying to access regular doctor pages, redirect to clinic equivalents
      if (location.pathname === '/dashboard') {
        navigate('/clinic/dashboard', { replace: true });
        return;
      }
      if (location.pathname === '/prescription' || location.pathname.startsWith('/prescription/')) {
        // Extract prescription ID if it exists
        const prescriptionId = location.pathname.split('/')[2];
        if (prescriptionId && prescriptionId !== 'new') {
          navigate(`/clinic/prescription/${prescriptionId}`, { replace: true });
        } else {
          navigate('/clinic/prescription', { replace: true });
        }
        return;
      }
      if (location.pathname === '/prescriptions') {
        navigate('/clinic/prescriptions', { replace: true });
        return;
      }
    }

    // Regular independent doctor accessing admin/clinic pages -> redirect to dashboard
    if (isDoctor && !clinicId && !isClinicAdmin && !isSuperAdmin) {
      if (location.pathname === '/admin' || location.pathname.startsWith('/clinic')) {
        navigate('/dashboard', { replace: true });
        return;
      }
    }

    // Doctor/staff trying to access patient pages -> redirect to dashboard
    if ((isDoctor || isSuperAdmin || isClinicAdmin) && location.pathname.startsWith('/patient/')) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, roles, isSuperAdmin, isClinicAdmin, isDoctor, isPatient, loading, checkingClinic, clinicId, location.pathname, navigate]);

  return null;
};
