// app/auth/login.tsx (CÓDIGO COMPLETO E CORRIGIDO)

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Importação do Firebase para Login e da instância auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha o email e a senha.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Se for bem-sucedido, o AuthContext detectará e fará o redirecionamento.
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      // O replace é necessário para limpar o histórico e ir para as abas.
      router.replace('/(tabs)'); 

    } catch (error: any) {
      console.error("Erro de Login:", error);

      let errorMessage = "Ocorreu um erro no login. Verifique suas credenciais.";

      // Mensagens de erro mais amigáveis (baseadas nos códigos do Firebase)
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Nenhum usuário encontrado com este email. Você precisa se cadastrar.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "O formato do email está incorreto.";
      }
      
      Alert.alert("Erro de login", errorMessage);

    } finally {
      setLoading(false);
    }
  };

  // ... (AQUI DEVE TER O CÓDIGO JSX/UI da sua tela de login, que não foi enviado)
  // Certifique-se de que seus botões e inputs chamem handleLogin, setEmail e setPassword.

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo(a)!</Text>
        <Text style={styles.subtitle}>Faça login para salvar seus dados na nuvem.</Text>

        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />
        
        <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
        >
            <Text style={styles.buttonText}>{loading ? "Aguarde..." : "Entrar"}</Text>
        </TouchableOpacity>

        {/* Você pode adicionar um link para a tela de cadastro aqui */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
    input: { width: '100%', padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
    button: { backgroundColor: '#FF6F61', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});