import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FirestoreServiceInstance } from '../services/storage';
import { Cycle } from '../types/cycle';

const storage = FirestoreServiceInstance;

// Helper para obter a data de hoje no formato 'YYYY-MM-DD'
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

export default function CycleRegistrationModal() {
    const router = useRouter();
    const [startDate, setStartDate] = useState<string>(getTodayDateString());
    const [flowDurationDays, setFlowDurationDays] = useState<number>(5);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = useCallback(async () => {
        setErrorMessage('');

        if (!startDate || flowDurationDays <= 0) {
            setErrorMessage('Por favor, preencha a data de início e a duração do fluxo.');
            return;
        }

        const newCycle: Omit<Cycle, 'id' | 'userId'> = {
            startDate,
            flowDurationDays,
        };

        setIsLoading(true);

        try {
            await storage.addCycle(newCycle);
            
            Alert.alert('Sucesso!', 'Ciclo registrado com sucesso.');
            
            // Volta para a tela anterior após o sucesso
            if (router.canGoBack()) {
                router.back();
            }

        } catch (error) {
            console.error("Erro ao salvar o ciclo:", error);
            const message = error instanceof Error ? error.message : 'Falha ao salvar o ciclo. Tente novamente.';
            setErrorMessage(message);
            Alert.alert('Erro', message);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, flowDurationDays, router]);

    return (
        <View style={styles.container}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Novo Registro de Ciclo</Text>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Data de Início do Fluxo</Text>
                    <TextInput
                        style={styles.input}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="YYYY-MM-DD"
                        maxLength={10}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Duração do Fluxo (dias)</Text>
                    <TextInput
                        style={styles.input}
                        value={String(flowDurationDays)}
                        onChangeText={(text) => setFlowDurationDays(parseInt(text) || 0)}
                        keyboardType="number-pad"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, styles.buttonSave]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Salvar Registro</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => router.back()}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    inputGroup: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        fontSize: 16,
    },
    button: {
        borderRadius: 20,
        padding: 12,
        elevation: 2,
        width: '100%',
        marginTop: 10,
        alignItems: 'center',
    },
    buttonSave: {
        backgroundColor: '#E91E63',
    },
    buttonClose: {
        backgroundColor: '#757575',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});