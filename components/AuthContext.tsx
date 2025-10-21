import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../src/config/api';
import { firebaseAuth, isFirebaseConfigured } from '../src/services/firebase';

// --- Tipos de Dados Corretos ---
type UserType = FirebaseAuthTypes.User | null;

export interface AuthContextType {
    user: UserType;
    isFirebaseConfigured: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
    register: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
    logout: () => Promise<void>;
}

// Contexto para Firebase Auth
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserType>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isFirebaseConfigured) {
            setLoading(false);
            return;
        }
        // A sintaxe correta para o onAuthStateChanged
        const subscriber = firebaseAuth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return subscriber; // Retorna a função de unsubscribe
    }, []);

    const unconfiguredError = () => Promise.reject(new Error('Firebase não está configurado.'));

    // Funções de autenticação com a sintaxe correta do @react-native-firebase
    const login = async (email: string, password: string) => {
        if (!isFirebaseConfigured) return unconfiguredError();
        return firebaseAuth.signInWithEmailAndPassword(email, password);
    };

    const register = async (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
        if (!isFirebaseConfigured) return unconfiguredError();

        try {
            // Passo A: Tenta criar o utilizador no Firebase
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            const firebaseUser = userCredential.user;

            console.log('Utilizador criado no Firebase com sucesso:', firebaseUser.uid);

            // Passo B: Tenta criar o utilizador na nossa API
            const apiResponse = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: firebaseUser.email,
                    firebase_uid: firebaseUser.uid,
                }),
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error || 'Falha ao registar o utilizador no nosso servidor.');
            }
            
            const nossoUsuario = await apiResponse.json();
            console.log('Utilizador sincronizado com o nosso banco de dados:', nossoUsuario);
            
            return userCredential;

        } catch (error) {
            console.error("Erro durante o registo:", error);
            throw error; 
        }
    };

    const logout = async () => {
        if (!isFirebaseConfigured) return Promise.resolve();
        return firebaseAuth.signOut();
    };

    const value = {
        user,
        loading,
        isFirebaseConfigured,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

