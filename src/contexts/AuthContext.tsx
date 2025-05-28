// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation'; // Corrected import for App Router

// Define User and AuthState types
interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  profileImage?: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUserFromToken: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const loadUserFromToken = async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      try {
        // You might have a '/auth/me' endpoint to get current user
        const response = await apiClient.get('/auth/me');
        setUser(response.data.data.user);
      } catch (error) {
        console.error('Failed to load user from token', error);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        apiClient.defaults.headers.common['Authorization'] = '';
      }
    }
    setIsLoading(false);
  };

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { token: receivedToken, data: { user: receivedUser } } = response.data;
      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      router.push('/'); // Redirect to home after login
    } catch (error) {
      console.error('Login failed', error);
      throw error; // Re-throw to be caught by the form
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', data);
      const { token: receivedToken, data: { user: receivedUser } } = response.data;
      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      router.push('/'); // Redirect to home after registration
    } catch (error) {
      console.error('Registration failed', error);
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    apiClient.defaults.headers.common['Authorization'] = '';
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        loadUserFromToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};