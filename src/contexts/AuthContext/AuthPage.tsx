import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdminRoutes,
  ClassroomRoutes,
  TeacherRoutes,
} from '@/constants/routes';
import { useAuthContext } from './hooks/useAuthContext';

export const AuthPage = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'admin') {
      navigate(AdminRoutes.root());
    }

    if (role === 'teacher') {
      navigate(TeacherRoutes.root());
    }

    if (role === 'student') {
      navigate(ClassroomRoutes.root());
    }
  }, [role, navigate]);

  return <>{children}</>;
};
