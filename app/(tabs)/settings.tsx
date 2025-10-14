import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from '../../components/AuthContext';

import { router } from 'expo-router';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>⚙️ Tela de Configurações</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#E91E63',
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
