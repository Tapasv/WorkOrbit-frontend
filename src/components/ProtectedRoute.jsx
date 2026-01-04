import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    console.log('🚫 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have required role, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`🚫 User role '${user.role}' not allowed for this route`);
    const dashboardMap = {
      Admin: '/admin',
      Manager: '/manager',
      Employee: '/employee',
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;