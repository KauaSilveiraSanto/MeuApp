// app/auth/login.tsx (CÓDIGO COMPLETO E CORRIGIDO)

import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../services/firebase'; // Verifique o caminho '../../services/firebase'

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
      
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      
      // 🚨 CORREÇÃO DE TIPAGEM: Ignora o erro de tipagem forçando a navegação
      router.replace('/(tabs)' as any); 

    } catch (error: any) {
      console.error("Erro de Login:", error);
      
      let errorMessage = "Ocorreu um erro no login. Verifique suas credenciais.";

      if (error.code === 'auth/user-not-found') {
        errorMessage = "Nenhum usuário encontrado com este email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta.";
      }

      Alert.alert("Erro de Login", errorMessage);

    } finally {
      setLoading(false);
    }
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
});