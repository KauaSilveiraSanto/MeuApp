// components/AuthContext.tsx (Versão Final e Estável)

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';


export interface AuthContextType {
  user: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Login local
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (users[email] && users[email] === password) {
        setUser(email);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch {
      setLoading(false);
      return false;
    }
  };

  // Cadastro local
  const register = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const usersRaw = await AsyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (users[email]) {
        setLoading(false);
        return false; // Usuário já existe
      }
      users[email] = password;
      await AsyncStorage.setItem('users', JSON.stringify(users));
      setUser(email);
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};