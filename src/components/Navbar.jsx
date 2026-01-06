import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  Menu,
  X,
  Home,
  FileText,
  Settings,
  Clock,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'Admin':
        return '/admin';
      case 'Manager':
        return '/manager';
      case 'Employee':
        return '/employee';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Enterprise Portal
                </h1>
                <p className="text-xs text-gray-500">Request Management</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to={getDashboardLink()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              to={user?.role === 'Employee' ? '/employee/attendance' :
                user?.role === 'Manager' ? '/manager/attendance' : '/admin/attendance'}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              <Clock className="w-4 h-4" />
              <span className="font-medium">Attendance</span>
            </Link>

            {user?.role === 'Employee' && (
              <Link
                to="/employee/my-requests"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">My Requests</span>
              </Link>
            )}

            {user?.role === 'Manager' && (
              <Link
                to="/manager/teams"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Teams</span>
              </Link>
            )}

            {user?.role === 'Admin' && (
              <Link
                to="/admin/teams"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Teams</span>
              </Link>
            )}

            {/* Notifications - Replace with NotificationDropdown */}
            <NotificationDropdown />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.Username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.Username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.Username}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.role}</p>
                  </div>

                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>

                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Preferences</span>
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-blue-50"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="space-y-2">
              <Link
                to={getDashboardLink()}
                className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                to={user?.role === 'Employee' ? '/employee/attendance' :
                  user?.role === 'Manager' ? '/manager/attendance' : '/admin/attendance'}
                className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Attendance</span>
              </Link>

              {user?.role === 'Employee' && (
                <Link
                  to="/employee/my-requests"
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">My Requests</span>
                </Link>
              )}

              {user?.role === 'Manager' && (
                <Link
                  to="/manager/teams"
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Teams</span>
                </Link>
              )}

              {user?.role === 'Admin' && (
                <Link
                  to="/admin/teams"
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Teams</span>
                </Link>
              )}

              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.Username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;