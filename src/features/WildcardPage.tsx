import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext/hooks/useAuthContext';
import {
  AdminRoutes,
  AuthRoutes,
  ClassroomRoutes,
  TeacherRoutes,
} from '../constants/routes';

export const WildcardPage = () => {
  const { role } = useAuthContext();

  if (role === 'admin') {
    return <Navigate to={AdminRoutes.root()} />;
  }

  if (role === 'teacher') {
    return <Navigate to={TeacherRoutes.root()} />;
  }

  if (role === 'student') {
    return <Navigate to={ClassroomRoutes.root()} />;
  }

  return <Navigate to={AuthRoutes.root()} />;
};
