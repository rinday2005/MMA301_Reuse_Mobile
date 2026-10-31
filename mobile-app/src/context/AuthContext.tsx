import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { loginApi, type LoginRequest, type User } from '../services/auth.api';
import { setAuthToken } from '../services/api';
import { storage } from '../utils/storage';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth state from storage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = (await storage.getItem('token')) || (await storage.getItem('accessToken'));
        const savedUserJson = await storage.getItem('user');

        if (savedToken) {
          setToken(savedToken);
          setAuthToken(savedToken);
        }

        if (savedUserJson) {
          try {
            setUser(JSON.parse(savedUserJson));
          } catch {
            // invalid JSON, ignore
          }
        }
      } catch (err) {
        console.warn('Failed to initialize auth state from storage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<User> => {
    const result = await loginApi(data);

    await storage.removeItem('user_profile_data');
    await storage.setItem('token', result.accessToken);
    await storage.setItem('user', JSON.stringify(result.user));

    setAuthToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);

    return result.user;
  };

  const logout = async (): Promise<void> => {
    await storage.removeItem('token');
    await storage.removeItem('accessToken');
    await storage.removeItem('user');
    await storage.removeItem('user_profile_data');

    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedFields };
      storage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
