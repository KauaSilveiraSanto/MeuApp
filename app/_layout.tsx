import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { initializeDB } from '../services/sqlite';
import { ActivityIndicator, View } from 'react-native';

// Garante a inicialização do banco de dados uma única vez.
initializeDB().catch(err => console.error("Falha ao inicializar DB:", err));

const InitialLayout = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Não faz nada enquanto o estado de autenticação está carregando

    const inAuthGroup = segments[0] === '(auth)';

    if (user && !inAuthGroup) {
      // Se o usuário está logado e não está no grupo de autenticação, tudo certo.
    } else if (user && inAuthGroup) {
      // Se o usuário está logado e dentro do grupo de autenticação, redireciona para a home.
      router.replace('/(tabs)/home');
    } else if (!user) {
      // Se o usuário não está logado, redireciona para a tela de login.
      router.replace('/auth/login');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
