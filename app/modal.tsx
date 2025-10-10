import { format } from 'date-fns';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

// ⚠️ IMPORTAÇÕES DOS SERVIÇOS
import { loadCycleDates, saveCycleDates } from '../services/storage';
import { CycleDate } from '../types/cycle';

export default function Modal() {
    // Estado para a data selecionada (string YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    // Estado para a duração da menstruação
    const [periodLength, setPeriodLength] = useState<string>('5'); 
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Marcação para a data selecionada no calendário
    const markedDate = {
        [selectedDate]: { selected: true, selectedColor: '#E91E63', disableTouchEvent: true }
    };

    // --- Lógica de Salvamento ---
    const handleSaveCycle = async () => {
        if (!selectedDate || isNaN(parseInt(periodLength)) || parseInt(periodLength) <= 0) {
            Alert.alert("Erro", "Por favor, selecione uma data e insira uma duração válida para o período.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Cria o novo objeto CycleDate
            const newCycle: CycleDate = {
                date: selectedDate,
                periodLength: parseInt(periodLength)
            };

            // 2. Carrega o histórico existente
            const existingCycles = await loadCycleDates();

            // 3. Verifica se a data já existe para evitar duplicatas
            const filteredCycles = existingCycles.filter(
                (cycle: CycleDate) => cycle.date !== newCycle.date
            );

            // 4. Adiciona o novo ciclo e salva
            const updatedCycles = [...filteredCycles, newCycle];
            await saveCycleDates(updatedCycles);

            Alert.alert("Sucesso", "Ciclo registrado com sucesso!");
            router.back(); // Volta para a tela principal (index/cycles)

        } catch (error) {
            console.error("Falha ao salvar o ciclo:", error);
            Alert.alert("Erro", "Não foi possível salvar o registro. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* O Stack.Screen permite configurar o modal (como o título) */}
            <Stack.Screen options={{ title: 'Registrar Novo Ciclo' }} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>Início do Último Ciclo</Text>
                <Text style={styles.instructionText}>Selecione o primeiro dia da sua última menstruação.</Text>
                
                {/* 1. SELETOR DE DATA (Calendário) */}
                <Calendar
                    onDayPress={(day) => {
                        setSelectedDate(day.dateString);
                    }}
                    markedDates={markedDate}
                    theme={{
                        selectedDayBackgroundColor: '#E91E63',
                        todayTextColor: '#00A86B',
                        arrowColor: '#E91E63',
                        indicatorColor: '#E91E63',
                    }}
                    style={styles.calendar}
                />

                {/* 2. DURAÇÃO DO PERÍODO */}
                <Text style={[styles.header, { marginTop: 30 }]}>Duração da Menstruação (dias)</Text>
                <Text style={styles.instructionText}>Quantos dias dura sua menstruação tipicamente?</Text>
                
                <TextInput
                    style={styles.input}
                    onChangeText={setPeriodLength}
                    value={periodLength}
                    keyboardType="numeric"
                    placeholder="Ex: 5"
                    editable={!isSaving}
                />

                {/* 3. BOTÃO DE SALVAMENTO */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveCycle}
                    disabled={isSaving}
                >
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Salvando...' : 'Salvar Ciclo'}
                    </Text>
                </TouchableOpacity>
                
                {/* 4. BOTÃO DE CANCELAR */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={isSaving}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F2F6' },
    scrollContent: { padding: 20, alignItems: 'center' },
    header: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
    instructionText: { fontSize: 14, color: '#777', marginBottom: 15, textAlign: 'center' },
    calendar: { width: '100%', borderRadius: 10, elevation: 3, shadowOpacity: 0.1, backgroundColor: '#FFFFFF' },
    input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, fontSize: 18, backgroundColor: '#FFFFFF', marginTop: 10, textAlign: 'center' },
    saveButton: { width: '100%', backgroundColor: '#00A86B', padding: 15, borderRadius: 50, marginTop: 40, elevation: 3 },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    cancelButton: { width: '100%', padding: 10, borderRadius: 50, marginTop: 15, },
    cancelButtonText: { color: '#E91E63', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
