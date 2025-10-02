"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import jwtDecode from 'jwt-decode';

interface User {
  id: string;
  email?: string;
  name?: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage if present
    const stored = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (stored) {
      setToken(stored);
      try {
        const decoded: any = jwtDecode(stored);
        setUser({ id: decoded.userId, role: decoded.role });
      } catch {
        // invalid token, remove
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    try {
      const decoded: any = jwtDecode(newToken);
      setUser({ id: decoded.userId, role: decoded.role });
    } catch {
      setUser(null);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};