// app/modal.tsx
import React, { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Certifique-se de que expo install @react-native-community/datetimepicker foi executado
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { loadCycleDates, saveCycleDates } from '../services/storage'; // APENAS UM '../'

export default function RegisterCycleModal() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios'); 

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') { setShowPicker(false); }
    if (selectedDate) { setDate(selectedDate); }
  };

  const handleSave = async () => {
    const cycleDateString = date.toISOString().split('T')[0];

    try {
      const existingDates = await loadCycleDates();
      if (existingDates.includes(cycleDateString)) {
        Alert.alert("Atenção", "Esta data já está registrada no seu histórico!");
        return;
      }
      
      const newDatesList = [cycleDateString, ...existingDates];
      await saveCycleDates(newDatesList);
      Alert.alert("Sucesso", `Ciclo registrado em: ${cycleDateString}`);
      
      router.back(); 

    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a data do ciclo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Início do Ciclo</Text>
      <Text style={styles.currentDateText}>Data Selecionada: {date.toLocaleDateString()}</Text>

      <View style={styles.pickerContainer}>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
            maximumDate={new Date()} 
          />
        )}
        
        {Platform.OS !== 'ios' && (
          <Button title="Escolher Data" onPress={() => setShowPicker(true)} color="#E91E63" />
        )}
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#E91E63'}]} onPress={handleSave}>
          <Text style={styles.actionButtonText}>SALVAR CICLO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#777'}]} onPress={() => router.back()}>
          <Text style={styles.actionButtonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
// ... (Styles)
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#FFF8F9', },
    title: { fontSize: 24, fontWeight: 'bold', color: '#E91E63', marginBottom: 30, },
    currentDateText: { fontSize: 18, marginBottom: 20, color: '#333', },
    pickerContainer: { width: '100%', marginVertical: 20, },
    buttonGroup: { marginTop: 40, width: '100%', alignItems: 'center', },
    actionButton: { width: '80%', padding: 15, borderRadius: 50, marginVertical: 10, alignItems: 'center', },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', },
});