import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Deliverer, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/auth.service';
import { delivererAuthService } from '../services/deliverer-auth.service';

interface AuthContextData {
  user: User | null;
  deliverer: Deliverer | null;
  userType: 'user' | 'deliverer' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  delivererLogin: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [deliverer, setDeliverer] = useState<Deliverer | null>(null);
  const [userType, setUserType] = useState<'user' | 'deliverer' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      const token = authService.getToken();
      const storedUserType = delivererAuthService.getUserType();

      if (token) {
        try {
          if (storedUserType === 'deliverer') {
            const storedDeliverer = delivererAuthService.getDeliverer();
            if (storedDeliverer) {
              // Validate token by fetching deliverer data
              const { deliverer: freshDeliverer } = await delivererAuthService.me();
              setDeliverer(freshDeliverer);
              setUserType('deliverer');
              delivererAuthService.saveDeliverer(freshDeliverer);
            }
          } else {
            const storedUser = authService.getUser();
            if (storedUser) {
              // Validate token by fetching user data
              const { user: freshUser } = await authService.me();
              setUser(freshUser);
              setUserType('user');
              authService.saveUser(freshUser);
            }
          }
        } catch (error) {
          authService.removeToken();
          delivererAuthService.removeToken();
          setUser(null);
          setDeliverer(null);
          setUserType(null);
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
    localStorage.setItem('userType', 'user');
    setUser(loggedUser);
    setUserType('user');
    setDeliverer(null);
  };

  const delivererLogin = async (credentials: LoginRequest) => {
    const { deliverer: loggedDeliverer, access_token, must_change_password } = await delivererAuthService.login(credentials);
    delivererAuthService.saveToken(access_token);
    delivererAuthService.saveDeliverer(loggedDeliverer);
    delivererAuthService.saveMustChangePassword(must_change_password);
    setDeliverer(loggedDeliverer);
    setUserType('deliverer');
    setUser(null);
  };

  const register = async (data: RegisterRequest) => {
    const { user: registeredUser, access_token } = await authService.register(data);
    authService.saveToken(access_token);
    authService.saveUser(registeredUser);
    localStorage.setItem('userType', 'user');
    setUser(registeredUser);
    setUserType('user');
    setDeliverer(null);
  };

  const logout = async () => {
    try {
      if (userType === 'deliverer') {
        await delivererAuthService.logout();
      } else {
        await authService.logout();
      }
    } catch (error) {
      // Ignore error, just clear local data
    }
    authService.removeToken();
    delivererAuthService.removeToken();
    setUser(null);
    setDeliverer(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        deliverer,
        userType,
        isAuthenticated: !!(user || deliverer),
        isLoading,
        login,
        delivererLogin,
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
