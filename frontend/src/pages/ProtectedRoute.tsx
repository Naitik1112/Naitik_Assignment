import { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import NotLoggedIn from './NotLoggedIn';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!user) {
    return <NotLoggedIn />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;