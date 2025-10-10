// components/AuthContext.tsx (Versão Final e Estável)

import React, { createContext, useContext, useEffect, useState } from 'react';
// IMPORTAÇÃO ESSENCIAL: onAuthStateChanged deve vir do 'firebase/auth'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
// 🚨 IMPORTAÇÃO CRÍTICA: O caminho é crucial
import { auth } from './../services/firebase';

interface AuthContextType {
  user: FirebaseUser | null; 
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 🚨 Escuta mudanças no estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};