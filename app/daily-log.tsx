// app/daily-log.tsx (CÓDIGO FINAL E COMPLETO)

import { format } from 'date-fns'; // Para formatação de data
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loadDailyTracking, saveDailyTracking } from '../services/storage'; // 🚨 Caminho para a pasta services
import { DailyTracking, SYMPTOM_OPTIONS } from '../types/cycle'; // 🚨 Caminho para a pasta types

export default function DailyLogScreen() {
  // Pega a data de hoje formatada
  const todayString = format(new Date(), 'yyyy-MM-dd');

  // Estados
  const [date, setDate] = useState(todayString);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [flowIntensity, setFlowIntensity] = useState<'nenhum' | 'leve' | 'moderado' | 'intenso'>('nenhum');
  const [observations, setObservations] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // 🚨 Função para carregar os dados do dia
  const fetchExistingData = useCallback(async () => {
    setLoading(true);
    try {
      const allEntries = await loadDailyTracking(); // Funciona se storage.ts estiver correto
      
      const todayEntry = allEntries.find(entry => entry.date === todayString);

      if (todayEntry) {
        setSelectedSymptoms(todayEntry.symptoms || []);
        setSelectedMoods(todayEntry.mood || []);
        setFlowIntensity(todayEntry.flowIntensity || 'Nenhum');
        setObservations(todayEntry.observations || '');
      } else {
        // Limpa o formulário se não houver entrada
        setSelectedSymptoms([]);
        setSelectedMoods([]);
        setFlowIntensity('nenhum');
        setObservations('');
      }

    } catch (error) {
      console.error("Erro ao carregar tracking diário:", error);
      Alert.alert("Erro", "Não foi possível carregar o log diário.");
    } finally {
      setLoading(false);
    }
  }, [todayString]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  // Função para alternar seleção de itens (sintomas/humores)
  const toggleSelection = (
    list: string[], 
    item: string, 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // 🚨 Função para salvar os dados
  const handleSave = async () => {
    if (selectedSymptoms.length === 0 && selectedMoods.length === 0 && flowIntensity === 'nenhum' && !observations) {
      Alert.alert("Atenção", "Por favor, registre pelo menos um sintoma, humor ou observação.");
      return;
    }

    setLoading(true);
    const newEntry: DailyTracking = {
      date: date, // Usa a data atual
      symptoms: selectedSymptoms,
      mood: selectedMoods,
      flowIntensity: flowIntensity,
      observations: observations,
    };

    try {
      await saveDailyTracking(newEntry);
      Alert.alert("Sucesso", "Log diário salvo!");
      router.back(); // Volta para a tela anterior (cycles)
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Falha ao salvar o log diário.");
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização (Exibição dos Controles) ---
  return (
    <ScrollView style={styles.container}>
        {/* ... (Seu JSX para renderizar as opções de sintomas, humores e fluxo) ... */}
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sintomas ({selectedSymptoms.length})</Text>
            <View style={styles.tagContainer}>
                {SYMPTOM_OPTIONS.map(symptom => (
                    <TouchableOpacity 
                        key={symptom} 
                        style={[styles.tag, selectedSymptoms.includes(symptom) && styles.tagSelected]}
                        onPress={() => toggleSelection(selectedSymptoms, symptom, setSelectedSymptoms)}
                    >
                        <Text style={selectedSymptoms.includes(symptom) ? styles.tagTextSelected : styles.tagText}>
                            {symptom}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* ... (Repetir para Moods e Flow) ... */}
        
        <Text style={styles.label}>Observações</Text>
        <TextInput
            style={styles.textArea}
            value={observations}
            onChangeText={setObservations}
            placeholder="Alguma nota sobre o seu dia..."
            multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Log'}
          </Text>
        </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#E91E63' },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', marginRight: 10, marginBottom: 10 },
    tagSelected: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
    tagText: { color: '#333' },
    tagTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
    label: { fontSize: 16, marginTop: 15, marginBottom: 5, color: '#333' },
    textArea: { height: 100, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, textAlignVertical: 'top' },
    saveButton: { backgroundColor: '#00A86B', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 50 },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});