import { format } from 'date-fns'; // Para formatação de data
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// CORREÇÃO: Importa a instância Singleton do serviço
import { FirestoreServiceInstance } from '../services/storage';
import { DailyTracking, FLOW_INTENSITY_OPTIONS, MOOD_OPTIONS, SYMPTOM_OPTIONS } from '../types/cycle';

// Obtém a instância do serviço
const storage = FirestoreServiceInstance;

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
            // Usa a instância 'storage'
            const todayEntry = await storage.loadDailyLog(todayString); 
            
            if (todayEntry) {
                // Atualiza os estados com os dados existentes
                setSelectedSymptoms(todayEntry.symptoms || []);
                setSelectedMoods(todayEntry.mood || []);
                setFlowIntensity(todayEntry.flowIntensity || 'nenhum');
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
            // Usa a instância 'storage'
            await storage.saveDailyLog(newEntry); 
            Alert.alert("Sucesso", "Log diário salvo!");
            router.back(); // Volta para a tela anterior (cycles)
        } catch (error) {
            console.error("Erro ao salvar:", error);
            Alert.alert("Erro", "Falha ao salvar o log diário.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Carregando Log Diário...</Text>
            </View>
        );
    }

    // --- Renderização (Exibição dos Controles) ---
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Registro Diário: {format(new Date(date), 'dd/MM/yyyy')}</Text>

            {/* Sintomas */}
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

            {/* Humor */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Humor ({selectedMoods.length})</Text>
                <View style={styles.tagContainer}>
                    {MOOD_OPTIONS.map(mood => (
                        <TouchableOpacity 
                            key={mood} 
                            style={[styles.tag, selectedMoods.includes(mood) && styles.tagSelectedMood]}
                            onPress={() => toggleSelection(selectedMoods, mood, setSelectedMoods)}
                        >
                            <Text style={selectedMoods.includes(mood) ? styles.tagTextSelected : styles.tagText}>
                                {mood}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            {/* Intensidade do Fluxo */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fluxo Menstrual</Text>
                <View style={styles.tagContainer}>
                    {FLOW_INTENSITY_OPTIONS.map(flow => (
                        <TouchableOpacity 
                            key={flow} 
                            // Comparação ajustada para o tipo literal
                            style={[styles.tag, flowIntensity === flow && styles.tagSelectedFlow]}
                            onPress={() => setFlowIntensity(flow as 'nenhum' | 'leve' | 'moderado' | 'intenso')}
                        >
                            <Text style={flowIntensity === flow ? styles.tagTextSelected : styles.tagText}>
                                {flow.charAt(0).toUpperCase() + flow.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            

            {/* Observações */}
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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#333' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#E91E63' },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', marginRight: 10, marginBottom: 10 },
    
    // Sintomas
    tagSelected: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
    // Humor (usando cor secundária, verde)
    tagSelectedMood: { backgroundColor: '#00A86B', borderColor: '#00A86B' },
    // Fluxo (usando amarelo/laranja)
    tagSelectedFlow: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
    
    tagText: { color: '#333' },
    tagTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
    label: { fontSize: 16, marginTop: 15, marginBottom: 5, color: '#333' },
    textArea: { height: 100, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, textAlignVertical: 'top' },
    saveButton: { backgroundColor: '#E91E63', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 50 },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
