import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      const token = authService.getToken();
      const storedUser = authService.getUser();

      if (token && storedUser) {
        try {
          // Validate token by fetching user data
          const { user: freshUser } = await authService.me();
          setUser(freshUser);
          authService.saveUser(freshUser);
        } catch (error) {
          authService.removeToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadStoredData();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const { user: loggedUser, access_token } = await authService.login(credentials);
    authService.saveToken(access_token);
    authService.saveUser(loggedUser);
    setUser(loggedUser);
  };

  const register = async (data: RegisterRequest) => {
    const { user: registeredUser, access_token } = await authService.register(data);
    authService.saveToken(access_token);
    authService.saveUser(registeredUser);
    setUser(registeredUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error, just clear local data
    }
    authService.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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
