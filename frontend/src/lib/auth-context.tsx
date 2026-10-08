'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, UserProfile } from './api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  quickLoginDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Muat sesi pengguna saat aplikasi dimuat
  useEffect(() => {
    const savedUserId = localStorage.getItem('goodwaste_user_id');
    if (savedUserId) {
      api
        .getProfile(savedUserId)
        .then((profile) => {
          setUser(profile);
        })
        .catch(() => {
          localStorage.removeItem('goodwaste_user_id');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    if (!user?.id) return;
    try {
      const updated = await api.getProfile(user.id);
      setUser(updated);
    } catch (err) {
      console.error('Gagal memperbarui profil pengguna', err);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    localStorage.setItem('goodwaste_user_id', res.user.id);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    setUser(res.user);
    localStorage.setItem('goodwaste_user_id', res.user.id);
  };

  const quickLoginDemo = async () => {
    await login('budi@goodwaste.id', 'password123');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('goodwaste_user_id');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
