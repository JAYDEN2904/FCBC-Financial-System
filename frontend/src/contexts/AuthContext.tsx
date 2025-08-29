import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, AuthResponse } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = apiClient.getToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            apiClient.setToken(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          apiClient.setToken(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', { email, password: '***' });
      const response = await apiClient.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        console.log('Login successful, setting user and token');
        setUser(response.data.user);
        setToken(response.data.token);
        return { success: true };
      } else {
        console.log('Login failed:', response.error);
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, role: string = 'admin'): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register({ email, password, fullName, role });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      apiClient.setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
