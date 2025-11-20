import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AdminGuardProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export const AdminGuard = ({ children, requireSuperAdmin = true }: AdminGuardProps) => {
  const { isSuperAdmin, isClinicAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      const hasAccess = requireSuperAdmin ? isSuperAdmin : (isSuperAdmin || isClinicAdmin);
      
      if (!hasAccess) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page.',
          variant: 'destructive'
        });
        navigate('/dashboard');
      }
    }
  }, [isSuperAdmin, isClinicAdmin, loading, requireSuperAdmin, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasAccess = requireSuperAdmin ? isSuperAdmin : (isSuperAdmin || isClinicAdmin);

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
};
