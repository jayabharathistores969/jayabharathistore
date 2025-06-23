import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api, { setAuthToken } from '../api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  active: boolean;
  isBanned: boolean;
  phone: string;
  createdAt?: string | Date;
  lastLogin?: string | Date | null;
  addresses?: {
    _id?: string;
    fullName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    mobileNumber?: string;
  }[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = () => {
      const storedToken = sessionStorage.getItem('token');
      const storedUser = sessionStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // This function needs to be defined within the component's scope or passed in.
          // For now, let's define it here.
          const isTokenExpired = (tokenToCheck: string): boolean => {
            try {
              const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
              return payload.exp * 1000 < Date.now();
            } catch {
              return true;
            }
          };

          if (isTokenExpired(storedToken)) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          } else {
            setToken(storedToken);
            setAuthToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error bootstrapping auth:', error);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    try {
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Failed to save login data');
    }
  };

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setAuthToken(null);
      setUser(null);
      setToken(null);
      window.location.href = '/welcome';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/welcome';
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          console.error('Unauthorized request, logging out from interceptor.');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  useEffect(() => {
    if (!user || !token) return;
    let interval: NodeJS.Timeout;
    let didLogout = false;

    const checkActiveStatus = async () => {
      try {
        const res = await api.get('/users/profile');
        const freshUser = res.data;
        setUser(freshUser);
        sessionStorage.setItem('user', JSON.stringify(freshUser));
        if (freshUser.active === false || freshUser.isBanned === true) {
          if (!didLogout) {
            didLogout = true;
            alert('Your account has been banned or deactivated by an admin. You will be logged out.');
            logout();
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    };

    checkActiveStatus(); // Check immediately
    interval = setInterval(checkActiveStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, token, logout]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      user, 
      token, 
      login, 
      logout, 
      loading,
      isAdmin,
      isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 