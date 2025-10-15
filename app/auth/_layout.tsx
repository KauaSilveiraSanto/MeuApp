import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../components/AuthContext';

// Layout para o grupo de autenticação
export default function AuthLayout() {
  const { user } = useAuth();

  // Se o usuário já está logado, redireciona para a tela principal.
  // Isso impede que um usuário logado veja as telas de login/registro.
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Cadastro',
          headerShown: false,
        }}
      />
    </Stack>
  );
}