import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FirestoreServiceInstance } from '../../services/storage';
import { Cycle } from '../../types/cycle';

const storage = FirestoreServiceInstance;

export default function CycleHistoryScreen() {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedCycles = await storage.getAllCycles();
            setCycles(fetchedCycles);
        } catch (err) {
            console.error("Erro ao carregar histórico de ciclos:", err);
            const message = err instanceof Error ? err.message : "Não foi possível carregar seu histórico.";
            setError(message);
            Alert.alert("Erro", message);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const calculateCycleDuration = useCallback((index: number) => {
        if (index >= cycles.length - 1) return 'N/A';
        
        const currentCycle = new Date(cycles[index].startDate);
        const previousCycle = new Date(cycles[index + 1].startDate);
        
        const diffTime = Math.abs(currentCycle.getTime() - previousCycle.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return `${diffDays} dias`;
    }, [cycles]);

    const renderContent = () => {
        if (loading && cycles.length === 0) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E91E63" />
                    <Text style={styles.loadingText}>Carregando Histórico...</Text>
                </View>
            );
        }

        if (error && cycles.length === 0) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.mainButton} onPress={fetchData}>
                        <Text style={styles.mainButtonText}>Tentar Novamente</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (cycles.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>Nenhum ciclo registrado ainda.</Text>
                    <TouchableOpacity style={styles.mainButton} onPress={() => router.push('/modal')}>
                        <Text style={styles.mainButtonText}>Registrar Primeiro Ciclo ➕</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            cycles.map((cycle, index) => (
                <View key={cycle.id} style={styles.cycleCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Ciclo #{cycles.length - index}</Text>
                        <Text style={styles.cardDuration}>{calculateCycleDuration(index)}</Text>
                    </View>
                    <Text style={styles.cardDetail}>
                        <Text style={styles.label}>Início:</Text> {format(new Date(cycle.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </Text>
                    <Text style={styles.cardDetail}>
                        <Text style={styles.label}>Duração do Fluxo:</Text> {cycle.flowDurationDays} dias
                    </Text>
                </View>
            ))
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Histórico de Ciclos</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push('/modal')}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchData} colors={["#E91E63"]} />
                }
            >
                {renderContent()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F7F2F6' 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#E91E63', 
    },
    addButton: {
        backgroundColor: '#E91E63',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContainer: { 
        padding: 20,
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: { 
        marginTop: 10, 
        color: '#333' 
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 100,
    },
    errorText: {
        fontSize: 16,
        color: '#E91E63',
        textAlign: 'center',
        marginBottom: 20
    },
    noDataContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20, 
        paddingTop: 100 
    },
    noDataText: { 
        fontSize: 18, 
        color: '#777', 
        marginBottom: 20,
        textAlign: 'center',
    },
    cycleCard: { 
        backgroundColor: '#FFFFFF', 
        padding: 15, 
        borderRadius: 10, 
        marginBottom: 15, 
        elevation: 2, 
        shadowOpacity: 0.1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: '#EEE', 
        paddingBottom: 10, 
        marginBottom: 10 
    },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#00A86B' 
    },
    cardDuration: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#333' 
    },
    cardDetail: { 
        fontSize: 16, 
        color: '#555', 
        lineHeight: 24 
    },
    label: { 
        fontWeight: 'bold', 
        color: '#E91E63' 
    },
    mainButton: { 
        backgroundColor: '#E91E63', 
        paddingHorizontal: 30, 
        paddingVertical: 15, 
        borderRadius: 50, 
        marginTop: 20, 
        elevation: 3, 
    },
    mainButtonText: { 
        color: '#FFFFFF', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
});