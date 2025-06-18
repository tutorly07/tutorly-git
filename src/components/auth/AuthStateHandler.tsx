
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading
    if (!isLoaded) return;

    // Only redirect authenticated users if they're on auth pages
    if (isSignedIn && (location.pathname === '/signin' || location.pathname === '/signup')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isSignedIn, isLoaded, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthStateHandler;
