
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
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
  const { logout } = useAuth(); 
  
  const PRIMARY_COLOR = '#E91E63'; 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_COLOR,
        headerShown: true,
        tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
        },
        headerRight: () => (
          <Ionicons 
              name="log-out-outline" 
              size={24} 
              color={PRIMARY_COLOR} 
              style={{ marginRight: 15 }}
              onPress={logout} 
          />
        ),
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
          headerTitle: 'Ajustes',
        }}
      />
      
      {/* Oculta a tela de log diário para que não apareça na barra de abas */}
      <Tabs.Screen name="daily-log" options={{ href: null }} />
      
    </Tabs>
  );
}
