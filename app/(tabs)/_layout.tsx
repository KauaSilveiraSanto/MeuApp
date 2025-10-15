// app/(tabs)/_layout.tsx 

import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '../../components/AuthContext';


// 🚨 Componente Auxiliar para o Ícone
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { user, loading } = useAuth(); 

  // Se o estado de autenticação ainda está carregando, não renderize nada para evitar "flicker".
  if (loading) {
    return null; // Ou um componente de loading.
  }
  
  const PRIMARY_COLOR = '#E91E63'; 
  const ACCENT_COLOR = '#00A86B'; 

  // Esta é a "guarda de rota". Se não houver usuário, redireciona para a tela de login.
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_COLOR,
        // Garante que o cabeçalho seja visível e tenha o nome do grupo de abas
        headerShown: true,
        tabBarStyle: {
           
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
        }
      }}
    >
      {/* 1. ABA PADRÃO (index.tsx) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
          headerTitle: 'Bem-vinda(o)!',
        }}
      />
      
      {/* 2. ABA DE CICLOS (cycles.tsx) */}
      <Tabs.Screen
        name="cycles"
        options={{
          title: 'Ciclos',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-outline" color={color} />,
          headerTitle: 'Meu Calendário',
        }}
      />

      {/* 3. ABA DE CONFIGURAÇÕES (settings.tsx) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
          // O botão de Logout pode ser adicionado ao cabeçalho aqui
          headerRight: () => (
            <Ionicons 
                name="log-out-outline" 
                size={24} 
                color={PRIMARY_COLOR} 
                style={{ marginRight: 15 }}
                // Adicione a função de logout aqui se user.logout existir
                // onPress={() => auth.signOut()} 
            />
          ),
        }}
      />
      
      {/* 🚨 CORREÇÃO: daily-log e modal não devem aparecer como abas */}
      {/* Oculta arquivos que são modais ou auxiliares para que não apareçam na barra de abas */}
      <Tabs.Screen name="daily-log" options={{ href: null }} />
      <Tabs.Screen name="modal" options={{ href: null }} /> 
      
    </Tabs>
  );
}