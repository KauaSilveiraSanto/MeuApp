// app/_layout.tsx (COMPLETO E CORRIGIDO)

import { router, SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../components/AuthContext';

// O Layout que gerencia o redirecionamento
function InitialLayout() {
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!loading && !redirected) {
      SplashScreen.hideAsync();
      try {
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
        setRedirected(true);
      } catch (e: any) {
        setError(e?.message || 'Erro desconhecido na inicialização.');
      }
    }
  }, [user, loading, redirected]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>Erro ao iniciar o app:</Text>
        <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</Text>
        <Text style={{ marginTop: 30, color: '#333', textAlign: 'center' }}>Tente fechar e abrir o app novamente.</Text>
      </View>
    );
  }

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