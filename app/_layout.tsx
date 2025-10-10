// app/_layout.tsx (COMPLETO E CORRIGIDO)

import { router, SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../components/AuthContext';

// O Layout que gerencia o redirecionamento
function InitialLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Esconde a tela de splash até que o estado de login seja resolvido
    if (!loading) {
        SplashScreen.hideAsync();
    }

    // Se o usuário existir, vai para as abas. Se não, vai para a tela de login.
    if (user) {
      // Redireciona para o grupo de abas
      router.replace('/(tabs)');
    } else if (!loading) {
      // Redireciona para o grupo de autenticação
      router.replace('/auth/login');
    }
  }, [user, loading]);

  // Enquanto o estado de login não é resolvido, não renderiza nada
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Iniciando...</Text>
      </View>
    );
  }

  // O Stack é o que o Expo Router renderiza.
  return (
    <Stack>
      {/* 1. Rota de Autenticação (auth) */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      {/* 2. Grupo de Abas (tabs) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* 3. Modal (que abre de qualquer lugar) */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Registrar Ciclo' }} />
      <Stack.Screen name="not-found" />
    </Stack>
  );
}

// Exporta o contexto para envolver todo o app
export default function RootLayout() {
  // Garante que o SplashScreen esteja visível até o contexto carregar
  SplashScreen.preventAutoHideAsync();
  return (
    <AuthProvider>      
      <InitialLayout />
    </AuthProvider>
  );
}