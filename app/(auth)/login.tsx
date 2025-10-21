import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { FirebaseError } from 'firebase/app';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, isFirebaseConfigured } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Preencha o email e a senha.');
      return;
    }
    try {
      await login(email.trim(), password);
      // A navegação é tratada pelo RootLayout
    } catch (e: any) {
      if (e instanceof FirebaseError) {
        switch (e.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('Email ou senha inválidos.');
            break;
          default:
            setError('Ocorreu um erro ao fazer login.');
            break;
        }
      } else if (e.message === 'Firebase não está configurado.') {
        setError('O app não está configurado para autenticação. Verifique o console.');
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    }
  };

  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Bem-vindo(a)!</Text>
        <Text style={styles.subtitle}>Faça login para acessar o app.</Text>

        {!isFirebaseConfigured && (
          <Text style={styles.warning}>
            Atenção: A configuração do Firebase está ausente. A autenticação não funcionará.
          </Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          textContentType="username"
        />

        <TextInput
          ref={passwordRef}
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          textContentType="password"
        />

        <TouchableOpacity
          style={[styles.button, (loading || !isFirebaseConfigured) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading || !isFirebaseConfigured}
          accessibilityLabel="Entrar"
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={goToRegister} accessibilityLabel="Ir para cadastro">
          <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  error: { color: 'red', marginBottom: 10, textAlign: 'center', paddingHorizontal: 20 },
  warning: { color: '#FFA500', marginBottom: 20, textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 20 },
  input: { width: '100%', maxWidth: 400, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, fontSize: 16 },
  button: { backgroundColor: '#FF6F61', padding: 15, borderRadius: 8, width: '100%', maxWidth: 400, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.5, backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20 },
  linkText: { color: '#00A86B', fontSize: 16 },
});