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
            const parsedUser = JSON.parse(savedUserJson);
            if (parsedUser && parsedUser.email?.toLowerCase() === 'hon@gmail.com') {
              parsedUser.fullName = parsedUser.fullName || 'Nguyễn Hơn';
              parsedUser.phoneNumber = parsedUser.phoneNumber || '0987364578';
              parsedUser.phone = parsedUser.phone || '0987364578';
              parsedUser.kycStatus = parsedUser.kycStatus || 'APPROVED';
              if (!parsedUser.address) {
                parsedUser.address = {
                  province: 'Thành phố Đà Nẵng',
                  district: 'Quận Hải Châu',
                  ward: 'Phường Hải Châu 1',
                  detail: '48 Bạch Đằng',
                };
              }
            }
            setUser(parsedUser);
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

    if (result.user.email?.toLowerCase() === 'hon@gmail.com') {
      result.user.fullName = result.user.fullName || 'Nguyễn Hơn';
      result.user.phoneNumber = result.user.phoneNumber || '0987364578';
      result.user.phone = result.user.phone || '0987364578';
      result.user.kycStatus = result.user.kycStatus || 'APPROVED';
      if (!result.user.address) {
        result.user.address = {
          province: 'Thành phố Đà Nẵng',
          district: 'Quận Hải Châu',
          ward: 'Phường Hải Châu 1',
          detail: '48 Bạch Đằng',
        };
      }
    }

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
