"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Update interface
interface AuthContextType {
  user: any;
  token: string | null;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 👇 Add API base URL (from .env or fallback)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (googleIdToken: string) => {
    try {
      // ✅ Use env-based API URL instead of hardcoding localhost
      const response = await axios.post(`${API_BASE_URL}/api/auth/google-login`, {
        token: googleIdToken,
      });

      const { user, token } = response.data;

      // Store the user info and JWT in localStorage
      localStorage.setItem('userToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);

      // Redirect to the home page
      router.push('/');
    } catch (error: any) {
    console.error('API call failed:', error.response?.data || error.message);
    throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginWithGoogle, logout, loading }}>
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
