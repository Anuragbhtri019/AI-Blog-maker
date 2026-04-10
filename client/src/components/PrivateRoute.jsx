import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Protected route component - redirects to login if not authenticated
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
