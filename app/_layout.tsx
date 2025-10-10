// app/_layout.tsx (CÓDIGO COMPLETO E CORRIGIDO)

import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native'; // Importar View para a tela de loading
import { AuthProvider, useAuth } from '../components/AuthContext';

SplashScreen.preventAutoHideAsync(); 

function InitialLayout() {
  const { user, loading } = useAuth(); 
  
  // Esconde a tela de splash quando o estado de autenticação é resolvido
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    // Não renderiza nada enquanto carrega
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />; 
  }

  return (
    <Stack>
      {/* 🚨 DECISÃO DA ROTA: Se logado, vai para abas, senão, vai para autenticação */}
      {user ? (
        // Grupo (tabs) se o usuário estiver logado
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Grupo auth se o usuário não estiver logado
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}

      {/* Rota do Modal (acessível de qualquer lugar) */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Registrar Ciclo' }} /> 
      
      {/* Rota 404 de fallback */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}