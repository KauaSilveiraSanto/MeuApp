import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { addCycle, addDailyLog, getLogForDate } from '../services/sqlite';
import { SYMPTOM_OPTIONS } from '../types/cycle';

const PRIMARY_COLOR = '#E91E63';

export default function ModalScreen() {
  const { user } = useAuth(); // Pega o usuário logado
  const { date } = useLocalSearchParams<{ date: string }>();

  // Garante que a data foi passada como parâmetro
  useEffect(() => {
      if (!date) {
          Alert.alert("Erro", "Nenhuma data foi selecionada para o registro.", [
              { text: "OK", onPress: () => router.back() }
          ]);
      }
  }, [date]);

  const [isStartOfCycle, setIsStartOfCycle] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load existing data for the selected date
  useEffect(() => {
      const loadData = async () => {
          // Requisito Chave: Garante que só buscamos dados se tivermos um ID de usuário e uma data.
          if (date && user?.id) {
              // A função getLogForDate também precisa ser atualizada para aceitar o userId
              const existingLog = await getLogForDate(user.id, date);
              if (existingLog) {
                  setSymptoms(JSON.parse(existingLog.symptoms || '[]'));
                  setNotes(existingLog.notes || '');
              }
          }
          setInitialLoading(false);
      };
      loadData();
  }, [date, user?.id]);
  
  const canSave = isStartOfCycle || symptoms.length > 0 || notes.trim() !== '';

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    // Requisito Chave: Garante que temos um usuário para associar o dado.
    if (!canSave || !date || !user?.id) {
      return;
    }

    setLoading(true);

    try {
      // Salva o início de um novo ciclo se a opção estiver marcada
      if (isStartOfCycle) {
        await addCycle({ startDate: date, userId: user.id }); // Passa o userId
      }

      // Salva o log diário se houver sintomas ou notas
      if (symptoms.length > 0 || notes.trim() !== '') {
        await addDailyLog({
          userId: user.id, // Passa o userId
          date,
          symptoms,
          notes: notes.trim(),
        });
      }
      
      Alert.alert("Sucesso", "Registro salvo com sucesso!", [
        { text: "OK", onPress: () => router.back() } // Fecha o modal após o usuário confirmar
      ]);

    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
      return (
          <View style={styles.container}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
      );
  }
  if (!date) return <View style={styles.container} />; // Fallback

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registro para {date}</Text>

      {/* Seção de Início de Ciclo */}
      <View style={styles.section}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>É o primeiro dia da sua menstruação?</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#f4f3f4" }}
            thumbColor={isStartOfCycle ? PRIMARY_COLOR : "#f4f3f4"}
            onValueChange={setIsStartOfCycle}
            value={isStartOfCycle}
          />
        </View>
      </View>

      {/* Seção de Sintomas */}
      <View style={styles.section}>
        <Text style={styles.label}>Quais sintomas você sentiu hoje?</Text>
        <View style={styles.symptomsContainer}>
          {SYMPTOM_OPTIONS.map(symptom => (
            <TouchableOpacity
              key={symptom}
              style={[
                styles.symptomChip,
                symptoms.includes(symptom) && styles.symptomChipSelected
              ]}
              onPress={() => toggleSymptom(symptom)}
            >
              <Text style={symptoms.includes(symptom) ? styles.chipTextSelected : styles.chipText}>
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Seção de Observações */}
        <View style={styles.section}>
        <Text style={styles.label}>Notas:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Alguma anotação adicional sobre o seu dia..."
          multiline
        />
      </View>

      <TouchableOpacity style={[styles.saveButton, (!canSave || loading) && styles.saveButtonDisabled]} onPress={handleSave} disabled={!canSave || loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  contentContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: PRIMARY_COLOR },
  section: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  symptomsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  symptomChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#EEE' },
  symptomChipSelected: { backgroundColor: PRIMARY_COLOR },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#FFF' },
  saveButton: { backgroundColor: PRIMARY_COLOR, padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  saveButtonDisabled: { backgroundColor: '#E91E63', opacity: 0.5 },
});