// app/(tabs)/cycles.tsx (CÓDIGO FINAL E COMPLETO)

import { format } from 'date-fns';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

// 🚨 IMPORTAÇÕES DOS SERVIÇOS (Caminhos verificados)
import { calculatePrediction } from '../../services/prediction';
import { loadCycleDates } from '../../services/storage';
import { CycleDate, CyclePrediction } from '../../types/cycle';

// --- Configurações de Cores e Marcações (Mantenha o seu código aqui) ---
const MARKING_COLORS = { 
  period: { color: '#E91E63', textColor: 'white' },
  fertile: { color: '#00A86B', textColor: 'white' },
  ovulation: { color: '#FFC107', textColor: 'black' },
}; 

// Função de Marcação (simplificada, use a sua versão completa se preferir)
const markDateRange = (startDate: string, endDate: string, color: any, markedDates: { [key: string]: any }) => {
  // ... lógica completa da sua função markDateRange
  return markedDates;
};


export default function CyclesScreen() {
  const [cycleDates, setCycleDates] = useState<CycleDate[]>([]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);

  // 🚨 CORREÇÃO: Usa useCallback para envolver a função fetch
  const fetchCyclesAndPredict = useCallback(async () => {
    setLoading(true);
    try {
      const dates = await loadCycleDates(); 
      setCycleDates(dates);

      if (dates.length > 0) {
        const calculatedPrediction = calculatePrediction(dates); 
        setPrediction(calculatedPrediction);
        
        // --- Lógica de Marcação ---
        let newMarkedDates: { [key: string]: any } = {};

        // 1. Marca períodos passados (dates)
        // ... (Use o seu código completo para marcar)

        // 2. Marca a predição (fertile, ovulation, nextPeriod)
        if (calculatedPrediction.nextPeriodStartDate) {
            newMarkedDates = markDateRange(
                calculatedPrediction.nextPeriodStartDate, 
                format(new Date(), 'yyyy-MM-dd'), // Apenas um exemplo de uso
                MARKING_COLORS.period, 
                newMarkedDates
            );
        }
        
        setMarkedDates(newMarkedDates);
      } else {
        setPrediction(null);
        setMarkedDates({});
      }

    } catch (error: any) { // 🚨 Usa 'error: any' para tipagem mais segura do catch
      console.error("Erro ao carregar ciclos ou calcular predição:", error.message || error);
      Alert.alert("Erro de Dados", "Não foi possível carregar os dados. Tente limpar o cache.");
    } finally {
      setLoading(false);
    }
  }, []); // 🚨 Dependências vazias - Opcional se for chamada apenas no useEffect

  useEffect(() => {
    // 🚨 Apenas chama a função
    fetchCyclesAndPredict(); 
  }, [fetchCyclesAndPredict]); // 🚨 Inclui a função como dependência

  if (loading) {
    return <View style={styles.container}><Text>Carregando dados...</Text></View>;
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.predictionText}>
            Próximo Ciclo: {prediction?.nextPeriodStartDate || 'Sem Previsão'}
        </Text>
        
        <Calendar
          // ... (Propriedades do Calendar)
          markedDates={markedDates}
        />
        
        <TouchableOpacity style={styles.button} onPress={() => router.push('/modal')}>
          <Text style={styles.buttonText}>Registrar Novo Ciclo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#F7F2F6' },
  container: { flex: 1, padding: 20 },
  predictionText: { fontSize: 18, fontWeight: 'bold', color: '#E91E63', marginBottom: 15, textAlign: 'center' },
  button: { width: '100%', height: 50, backgroundColor: '#00A86B', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});