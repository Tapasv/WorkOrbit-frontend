import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyRequests from './pages/MyRequests';
import NotFound from './pages/NotFound';
import EmployeeAttendance from './pages/EmployeeAttendance';
import ManagerAttendance from './pages/ManagerAttendance';
import AdminAttendance from './pages/AdminAttendance';
import ManagerTeams from './pages/ManagerTeams';
import AdminTeams from './pages/AdminTeams';

// Smart root redirect — sends logged-in users to their dashboard, others to /login
const RootRedirect = () => {
  const { user, loading } = useAuth();

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

  if (!user) return <Navigate to="/login" replace />;

  const dashboardMap = {
    Admin: '/admin',
    Manager: '/manager',
    Employee: '/employee',
  };

  return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e293b',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Root route — smart redirect based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/my-requests"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <MyRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/attendance"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <EmployeeAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/attendance"
            element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/teams"
            element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerTeams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminTeams />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;