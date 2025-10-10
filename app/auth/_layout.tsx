// app/auth/login.tsx

import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importação do Firebase para Login
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../services/firebase'; // Importa a instância de autenticação

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Função FINAL do Login (usando Firebase)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha o email e a senha.");
      return;
    }

    setLoading(true);

    try {
      // Tenta autenticar no Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      
      // 🚨 CORREÇÃO FINAL DA ROTA: Usa 'as any' para ignorar o erro de tipagem do TS.
      router.replace('/(tabs)' as any); 

    } catch (error: any) {
      console.error("Erro de Login:", error);
      
      let errorMessage = "Ocorreu um erro no login. Verifique suas credenciais.";

      if (error.code === 'auth/user-not-found') {
        errorMessage = "Nenhum usuário encontrado com este email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "O formato do email está incorreto.";
      }

      Alert.alert("Erro de Login", errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    Alert.alert("Cadastro", "Implementar navegação para a tela de cadastro.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vinda(o)!</Text>
      <Text style={styles.subtitle}>Faça login para salvar seus dados na nuvem.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={handleGoToRegister}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#F7F2F6' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#E91E63', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#777', marginBottom: 40, textAlign: 'center' },
  input: { width: '100%', height: 50, backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  button: { width: '100%', height: 50, backgroundColor: '#E91E63', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 20 },
  linkText: { color: '#00A86B', fontSize: 16 }
});