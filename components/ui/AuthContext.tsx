// components/ui/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseAuth } from '../../services/firebase';
import { API_BASE_URL } from '../../src/config/api';

// Define o tipo para os dados do contexto
interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Cria o contexto com um valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Componente Provedor do Contexto
export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // O onAuthStateChanged é um listener que observa mudanças no estado de autenticação
    const unsubscribe = firebaseAuth.onAuthStateChanged(initializingUser => {
      setUser(initializingUser);
      setIsLoading(false);
    });

    // Retorna a função de limpeza para remover o listener quando o componente desmontar
    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);

    if (userCredential.user) {
      const { uid } = userCredential.user;
      
      // Sincroniza o novo utilizador com o back-end
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, firebase_uid: uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Lança um erro que será apanhado no ecrã de registo
        throw new Error(errorData.message || 'Erro ao sincronizar utilizador com o back-end.');
      }
    }
  };

  const login = async (email: string, password: string) => {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
  };

  const logout = async () => {
    await firebaseAuth.signOut();
  };

  const value = {
    user,
    register,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
