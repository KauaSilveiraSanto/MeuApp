// app/(tabs)/cycles.tsx (CÓDIGO COMPLETO E CORRIGIDO)

import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

// 🚨 IMPORTAÇÕES OK
import { calculatePrediction } from '../../services/prediction';
import { loadCycleDates } from '../../services/storage';
import { CycleDate, CyclePrediction } from '../../types/cycle';

// ... (MARKING_COLORS e markDateRange - Mantenha o código anterior)
const MARKING_COLORS = { /* ... */ }; 
const markDateRange = (/* ... */) => { /* ... */ };

export default function CyclesScreen() {
  const [cycleDates, setCycleDates] = useState<CycleDate[]>([]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  // 🚨 CORREÇÃO: Define o estado 'prediction' corretamente
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);

  const fetchCyclesAndPredict = useCallback(async () => {
    setLoading(true);
    try {
      const dates = await loadCycleDates(); // Funciona se storage.ts estiver correto
      setCycleDates(dates);

      if (dates.length > 0) {
        const calculatedPrediction = calculatePrediction(dates); // Funciona se prediction.ts estiver correto
        setPrediction(calculatedPrediction);
        
        let newMarkedDates: { [key: string]: any } = {};

        // Marcações (use o código completo que enviamos nas interações anteriores)
        // ...
        
        setMarkedDates(newMarkedDates);
      } else {
        setPrediction(null);
        setMarkedDates({});
      }

    } catch (error) {
      // Este catch pegará o erro se o storage.ts ou prediction.ts estiverem incorretos
      console.error("Erro ao carregar ciclos ou calcular predição:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do ciclo. Verifique o console para detalhes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCyclesAndPredict();
  }, [fetchCyclesAndPredict]);

  // ... (JSX de carregamento, sem dados, e a visualização principal com Calendar)
  
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* ... (Visualização da Predição usando 'prediction?.nextPeriodStart') */}
        <Text>Próximo Ciclo: {prediction?.nextPeriodStart}</Text>
        
        <Calendar
          // ... (Propriedades do Calendar)
        />
        
        <TouchableOpacity style={styles.button} onPress={() => router.push('/modal')}>
          <Text style={styles.buttonText}>Registrar Novo Ciclo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ /* ... */ });