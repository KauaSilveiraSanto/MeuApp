import { format } from 'date-fns'; // Para formatação de data
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../../components/AuthContext'; // Importa o hook de autenticação
import { DatabaseService } from '../../services/storage';
import { SYMPTOM_OPTIONS } from '../../types/cycle';

export default function DailyLogScreen() {
    const { user } = useAuth(); // Pega o usuário logado
    const todayString = format(new Date(), 'yyyy-MM-dd');

    // Estados
    const [date, setDate] = useState(todayString);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    // Função para carregar os dados do dia, agora dependendo do usuário
    const fetchExistingData = useCallback(async () => {
        setLoading(true);
        // Só busca dados se o usuário estiver logado
        if (!user?.id) {
            Alert.alert("Erro", "Usuário não encontrado. Por favor, faça login novamente.");
            setLoading(false);
            return;
        }

        try {
            // Passa o ID do usuário para buscar o log correto
            const todayEntry = await DatabaseService.getLogForDate(user.id, todayString); 
            
            if (todayEntry) {
                setSelectedSymptoms(JSON.parse(todayEntry.symptoms || '[]'));
                setNotes(todayEntry.notes || '');
            } else {
                setSelectedSymptoms([]);
                setNotes('');
            }

        } catch (error) {
            console.error("Erro ao carregar tracking diário:", error);
            Alert.alert("Erro", "Não foi possível carregar o log diário.");
        } finally {
            setLoading(false);
        }
    }, [todayString, user?.id]); // Adiciona user.id como dependência

    useEffect(() => {
        fetchExistingData();
    }, [fetchExistingData]);

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

    // Função para salvar os dados, agora associados ao usuário
    const handleSave = async () => {
        // Validação para garantir que o usuário está logado
        if (!user?.id) {
            Alert.alert("Erro", "Você precisa estar logado para salvar os dados.");
            return;
        }

        if (selectedSymptoms.length === 0 && !notes.trim()) {
            Alert.alert("Atenção", "Por favor, registre pelo menos um sintoma ou nota.");
            return;
        }

        setLoading(true);

        try {
            // Inclui o ID do usuário ao salvar o log
            await DatabaseService.addDailyLog({
                userId: user.id,
                date: date,
                symptoms: selectedSymptoms,
                notes: notes.trim(),
            });
            
            Alert.alert("Sucesso", "Log diário salvo!");
            router.back();
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

            <Text style={styles.label}>Notas</Text>
            <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
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
    
    tagSelected: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
    tagSelectedMood: { backgroundColor: '#00A86B', borderColor: '#00A86B' },
    tagSelectedFlow: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
    
    tagText: { color: '#333' },
    tagTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
    label: { fontSize: 16, marginTop: 15, marginBottom: 5, color: '#333' },
    textArea: { height: 100, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, textAlignVertical: 'top' },
    saveButton: { backgroundColor: '#E91E63', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 50 },
    saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
