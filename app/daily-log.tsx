// app/daily-log.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loadDailyTracking, saveDailyTracking } from '../services/storage';
import { DailyTracking, MOOD_OPTIONS, SYMPTOM_OPTIONS } from '../types/cycle';

export default function DailyLogScreen() {
  const todayString = new Date().toISOString().split('T')[0];

  const [date] = useState(todayString);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [flowIntensity, setFlowIntensity] = useState<DailyTracking['flowIntensity']>('nenhum');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(true);

  // Carrega o registro do dia, se existir
  useEffect(() => {
    const fetchExistingData = async () => {
      const allEntries = await loadDailyTracking();
      const todayEntry = allEntries.find(entry => entry.date === todayString);
      
      if (todayEntry) {
        setSelectedSymptoms(todayEntry.symptoms);
        setSelectedMoods(todayEntry.mood);
        setFlowIntensity(todayEntry.flowIntensity);
        setObservations(todayEntry.observations);
      }
      setLoading(false);
    };
    fetchExistingData();
  }, []);

  const toggleSelection = (list: string[], item: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };
  
  const handleSave = async () => {
    if (selectedSymptoms.length === 0 && selectedMoods.length === 0 && observations.length === 0 && flowIntensity === 'nenhum') {
        Alert.alert("Atenção", "Por favor, registre pelo menos um sintoma, humor ou observação.");
        return;
    }

    const newEntry: DailyTracking = {
      date,
      symptoms: selectedSymptoms,
      mood: selectedMoods,
      flowIntensity,
      observations,
    };

    try {
      await saveDailyTracking(newEntry);
      Alert.alert("Sucesso", "Registro diário salvo!");
      router.back(); 
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar o registro.");
    }
  };

  if (loading) {
    return <Text style={styles.loadingText}>Carregando registro...</Text>
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Hoje ({date})</Text>

      {/* Seção 1: Intensidade do Fluxo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intensidade do Fluxo 🩸</Text>
        <View style={styles.optionGroup}>
          {['nenhum', 'leve', 'moderado', 'intenso'].map(intensity => (
            <TouchableOpacity
              key={intensity}
              style={[styles.flowButton, flowIntensity === intensity && styles.flowButtonActive]}
              onPress={() => setFlowIntensity(intensity as DailyTracking['flowIntensity'])}
            >
              <Text style={styles.flowButtonText}>{intensity.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Seção 2: Sintomas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sintomas Físicos 🤒</Text>
        <View style={styles.optionGroup}>
          {SYMPTOM_OPTIONS.map(symptom => (
            <TouchableOpacity
              key={symptom}
              style={[styles.tagButton, selectedSymptoms.includes(symptom) && styles.tagButtonActive]}
              onPress={() => toggleSelection(selectedSymptoms, symptom, setSelectedSymptoms)}
            >
              <Text style={styles.tagButtonText}>{symptom}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Seção 3: Humor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Humor e Energia 😄</Text>
        <View style={styles.optionGroup}>
          {MOOD_OPTIONS.map(mood => (
            <TouchableOpacity
              key={mood}
              style={[styles.tagButton, selectedMoods.includes(mood) && styles.tagButtonActive]}
              onPress={() => toggleSelection(selectedMoods, mood, setSelectedMoods)}
            >
              <Text style={styles.tagButtonText}>{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Seção 4: Observações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observações (Para sua IA! 🧠)</Text>
        <TextInput
          style={styles.textArea}
          value={observations}
          onChangeText={setObservations}
          placeholder="Ex: Não dormi bem, bebi muita água, estresse no trabalho..."
          multiline
        />
      </View>

      {/* Botão Salvar */}
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>SALVAR REGISTRO DIÁRIO</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
    loadingText: { flex: 1, textAlign: 'center', marginTop: 50 },
    scrollContainer: { flex: 1, backgroundColor: '#F7F2F6' },
    container: { padding: 20, paddingBottom: 50 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#E91E63', marginBottom: 20, textAlign: 'center' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
    
    // Estilos para as opções em Tag
    optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tagButton: { padding: 10, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDD' },
    tagButtonActive: { backgroundColor: '#FFDCEF', borderColor: '#E91E63' },
    tagButtonText: { color: '#333', fontWeight: '500' },

    // Estilos para o Fluxo
    flowButton: { flexGrow: 1, padding: 10, borderRadius: 5, backgroundColor: '#F0F0F0', alignItems: 'center', minWidth: '22%' },
    flowButtonActive: { backgroundColor: '#E91E63', borderColor: '#C2185B' },
    flowButtonText: { color: '#333', fontWeight: 'bold' },

    // Text Area para Observações
    textArea: { height: 100, borderColor: '#DDD', borderWidth: 1, padding: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },

    // Botão Salvar
    saveButton: { backgroundColor: '#00A86B', padding: 15, borderRadius: 50, marginTop: 30, alignItems: 'center' },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});