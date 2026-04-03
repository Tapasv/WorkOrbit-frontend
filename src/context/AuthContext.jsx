import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';

        // If rememberMe was set, restore from localStorage, otherwise sessionStorage
        const storedUser = rememberMe
          ? localStorage.getItem('user')
          : sessionStorage.getItem('user');
        const storedToken = rememberMe
          ? localStorage.getItem('token')
          : sessionStorage.getItem('token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore auth:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for logout from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setUser(null);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        toast.info('You have been logged out');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData, token, rememberMe = false) => {
    setUser(userData);

    if (rememberMe) {
      // Persist even after browser is closed
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('rememberMe', 'true');
      // Clear sessionStorage to avoid conflicts
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    } else {
      // Only lasts for the current browser session
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('token', token);
      // Clear localStorage to avoid conflicts
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
  };

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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};