import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../components/AuthContext";

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Tela de Configurações</Text>
      <Text style={styles.subtitle}>
        Use o botão de sair no canto superior direito para deslogar da sua conta.
      </Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, color: '#666' },
  button: { backgroundColor: '#FF6F61', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});