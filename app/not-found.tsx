import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, color: 'red' }}>Página não encontrada</Text>
      <Text style={{ marginTop: 12 }}>A rota que você tentou acessar não existe.</Text>
    </View>
  );
}
