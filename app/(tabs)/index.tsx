// app/(tabs)/index.tsx

import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ⚠️ VERIFICAÇÃO DE CAMINHOS: DOIS PONTINHOS SÃO NECESSÁRIOS
import { calculatePrediction } from '../../services/prediction';
import { loadCycleDates } from '../../services/storage';
import { CycleDate, CyclePrediction } from '../../types/cycle';

export default function HomeScreen() {
  const [cycleDates, setCycleDates] = useState<CycleDate[]>([]);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Funções de Dados - Tratamento de erro robusto
  const fetchDataAndPredict = async () => {
    setLoading(true);
    try {
      const dates = await loadCycleDates();
      setCycleDates(dates);
      
      const calculatedPrediction = calculatePrediction(dates);
      setPrediction(calculatedPrediction);
      
    } catch (error) {
      console.error("Erro ao carregar ou calcular dados:", error);
      Alert.alert("Erro de Dados", "Não foi possível carregar seu histórico de ciclo.");
    } finally {
      setLoading(false); // Garante que a tela saia do loading, mesmo com erro
    }
  };

  // Recarrega os dados sempre que a aba é focada
  useFocusEffect(
    React.useCallback(() => {
      fetchDataAndPredict();
      return () => {};
    }, [])
  );

  // 1. Tela de Loading
  if (loading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Carregando dados...</Text></View>;
  }

  // 2. Tela de Sem Dados
  if (!prediction || cycleDates.length === 0) {
      return (
        <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Comece a registrar para ver sua previsão!</Text>
            <TouchableOpacity 
                style={styles.mainButton} 
                onPress={() => router.push('/modal')} 
            >
                <Text style={styles.mainButtonText}>Registrar Primeiro Ciclo 📅</Text>
            </TouchableOpacity>
        </View>
      );
  }

  // --- 3. Renderização Principal ---
  const cycleDay = prediction.cycleDayToday ?? 'N/A';
  const phaseText = prediction.phase ?? 'Sem Dados';
  const nextPeriod = prediction.nextPeriodStartDate ?? 'Sem Previsão';

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Ciclo de Hoje</Text>
      
      {/* Exibição Central */}
      <View style={[styles.cycleVisualizer, { borderColor: phaseText === 'Menstruação' ? '#E91E63' : '#00A86B' }]}>
        <Text style={styles.visualizerText}>Você está no</Text>
        <Text style={styles.cycleDayNumber}>Dia {cycleDay}</Text>
        <Text style={styles.visualizerPhase}>Fase: {phaseText}</Text>
      </View>

      {/* Cartão de Previsões */}
      <View style={styles.predictionCard}>
        <Text style={styles.cardTitle}>Próximo Período 🎯</Text>
        <Text style={styles.cardDetail}>**Previsão:** {nextPeriod}</Text>
        <Text style={styles.cardDetail}>**Janela Fértil:** De {prediction.fertileWindowStart} a {prediction.fertileWindowEnd}</Text>
      </View>

      {/* Botões */}
      <TouchableOpacity style={styles.mainButton} onPress={() => router.push('/modal')}>
        <Text style={styles.mainButtonText}>Registrar Novo Ciclo 📅</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/daily-log')}>
        <Text style={styles.secondaryButtonText}>Registrar Sintomas de Hoje</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
    scrollContainer: { flex: 1, backgroundColor: '#F7F2F6' },
    container: { padding: 20, paddingTop: 60, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#E91E63', marginBottom: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 18, color: '#333' },
    noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#F7F2F6' },
    noDataText: { fontSize: 20, textAlign: 'center', marginBottom: 30, color: '#777' },
    cycleVisualizer: { width: 250, height: 250, borderRadius: 125, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginVertical: 30, borderWidth: 10, borderColor: '#E91E6350' },
    visualizerText: { fontSize: 16, color: '#777' },
    cycleDayNumber: { fontSize: 72, fontWeight: 'bold', color: '#E91E63' },
    visualizerPhase: { fontSize: 20, fontWeight: '600', color: '#333' },
    predictionCard: { width: '100%', padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10, elevation: 2, shadowOpacity: 0.1, borderLeftWidth: 5, borderLeftColor: '#00A86B', marginTop: 20 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#00A86B', marginBottom: 10 },
    cardDetail: { fontSize: 16, color: '#333', lineHeight: 24 },
    mainButton: { backgroundColor: '#E91E63', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 50, marginTop: 40, elevation: 3, },
    mainButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    secondaryButton: { backgroundColor: '#F5A623', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 50, marginTop: 15, elevation: 1, },
    secondaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});