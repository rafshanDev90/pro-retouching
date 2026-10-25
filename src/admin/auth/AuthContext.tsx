import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getApiErrorMessage } from '../../lib/api';
import type { AdminUser, ApiResponse } from '../../lib/types';

interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  /** True while the initial /auth/me session check is running. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify the existing session cookie on first load.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Timeout so a hung/cold-booting backend can never leave the admin
        // stuck on the session spinner forever — fall through to the login page.
        const res = await api.get<ApiResponse<{ admin: AdminUser }>>('/auth/me', {
          timeout: 15000,
        });
        if (!cancelled) setAdmin(res.data.data.admin);
      } catch {
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post<ApiResponse<{ admin: AdminUser }>>('/auth/login', {
        email,
        password,
      });
      setAdmin(res.data.data.admin);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Login failed'));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear the local session even if the server call fails.
    } finally {
      setAdmin(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isLoading,
      login,
      logout,
    }),
    [admin, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
