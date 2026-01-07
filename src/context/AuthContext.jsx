import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔧 FIX: Use sessionStorage for tab-specific auth + localStorage for token
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check sessionStorage first (tab-specific)
        let storedUser = sessionStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        // If no user in sessionStorage, check localStorage (for initial load)
        if (!storedUser && storedToken) {
          storedUser = localStorage.getItem('user');
          if (storedUser) {
            // Copy to sessionStorage for this tab
            sessionStorage.setItem('user', storedUser);
          }
        }
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✅ User restored from storage:', parsedUser);
        } else {
          console.log('ℹ️ No stored auth found');
        }
      } catch (error) {
        console.error('❌ Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 🔔 Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab - logout this tab too
        console.log('🚪 Logout detected in another tab');
        setUser(null);
        sessionStorage.removeItem('user');
        toast.info('You have been logged out');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData, token) => {
    console.log('🔐 Logging in user:', userData);
    setUser(userData);
    
    // Store user in BOTH localStorage (for initial load) and sessionStorage (tab-specific)
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
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