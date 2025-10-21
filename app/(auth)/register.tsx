// app/(auth)/register.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../components/ui/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setError(null);

    try {
      await register(email, password);
      // Navega para a página principal após o registo bem-sucedido
      router.replace('/(tabs)/');
    } catch (e: any) {
      console.error(e);
      // Tratamento de erros específico para @react-native-firebase/auth
      if (e.code) {
        switch (e.code) {
          case 'auth/email-already-in-use':
            setError('Este endereço de e-mail já está em uso.');
            break;
          case 'auth/invalid-email':
            setError('O formato do e-mail é inválido.');
            break;
          case 'auth/weak-password':
            setError('A palavra-passe deve ter, no mínimo, 6 caracteres.');
            break;
          default:
            setError('Ocorreu um erro inesperado ao tentar registar.');
            break;
        }
      } else if (e.message) {
        // Apanha erros da nossa API, como "Utilizador já existe."
        setError(e.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button title="Registar" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
});