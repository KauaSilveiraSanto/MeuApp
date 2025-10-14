import { format } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FirestoreServiceInstance } from '../../services/storage';
import { Cycle } from '../../types/cycle';
import { calculateStats, CurrentCycleInfo, CyclePrediction, CycleStats, getCurrentCycleInfo, predictNextCycle } from '../../utils/cycle-calculations';

const storage = FirestoreServiceInstance;

export default function HomeScreen() {
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [stats, setStats] = useState<CycleStats | null>(null);
    const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
    const [currentInfo, setCurrentInfo] = useState<CurrentCycleInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchDataAndPredict = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedCycles = await storage.getAllCycles();
            setCycles(fetchedCycles);

            if (fetchedCycles.length > 0) {
                const calculatedStats = calculateStats(fetchedCycles);
                setStats(calculatedStats);

                const nextCyclePrediction = predictNextCycle(fetchedCycles[0], calculatedStats);
                setPrediction(nextCyclePrediction);

                const cycleInfo = getCurrentCycleInfo(fetchedCycles[0], nextCyclePrediction);
                setCurrentInfo(cycleInfo);
            } else {
                // Reseta os estados se não houver ciclos
                setStats(null);
                setPrediction(null);
                setCurrentInfo(null);
            }
        } catch (error) {
            console.error("Erro ao carregar ou calcular dados:", error);
            Alert.alert("Erro de Dados", "Não foi possível carregar seu histórico de ciclo.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchDataAndPredict();
        }, [fetchDataAndPredict])
    );

    const getPhaseStyle = (phase: CurrentCycleInfo['currentPhase']) => {
        switch (phase) {
            case 'menstrual': return { color: '#E91E63', borderColor: '#E91E63' };
            case 'folicular': return { color: '#00A86B', borderColor: '#00A86B' };
            case 'ovulação': return { color: '#FFC107', borderColor: '#FFC107' };
            case 'lútea': return { color: '#FF9800', borderColor: '#FF9800' };
            default: return { color: '#9E9E9E', borderColor: '#9E9E9E' };
        }
    };

    const renderContent = () => {
        if (loading && cycles.length === 0) {
            return <View style={styles.messageContainer}><ActivityIndicator size="large" color="#E91E63" /></View>;
        }

        if (!currentInfo || !prediction || !stats) {
            return (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>Comece a registrar seus ciclos para ver as previsões!</Text>
                    <TouchableOpacity style={styles.mainButton} onPress={() => router.push('/modal')}>
                        <Text style={styles.mainButtonText}>Registrar Primeiro Ciclo 📅</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const phaseStyle = getPhaseStyle(currentInfo.currentPhase);

        return (
            <>
                <View style={[styles.cycleVisualizer, { borderColor: phaseStyle.borderColor }]}>
                    <Text style={styles.visualizerText}>Você está no</Text>
                    <Text style={[styles.cycleDayNumber, { color: phaseStyle.color }]}>Dia {currentInfo.currentDay}</Text>
                    <Text style={styles.visualizerPhase}>Fase: {currentInfo.currentPhase}</Text>
                </View>

                <View style={styles.predictionCard}>
                    <Text style={styles.cardTitle}>Previsões 🎯</Text>
                    <Text style={styles.cardDetail}>
                        Próxima menstruação em <Text style={styles.highlight}>{currentInfo.daysUntilNextPeriod} dias</Text>
                    </Text>
                    <Text style={styles.cardDetail}>
                        Data prevista: <Text style={styles.highlight}>{format(prediction.nextPeriodStartDate, 'dd/MM/yyyy')}</Text>
                    </Text>
                    <Text style={styles.cardDetail}>
                        Janela fértil: <Text style={styles.highlight}>{format(prediction.fertileWindowStart, 'dd/MM')} a {format(prediction.fertileWindowEnd, 'dd/MM')}</Text>
                    </Text>
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.cardTitle}>Estatísticas</Text>
                    <Text style={styles.cardDetail}>Duração média do ciclo: <Text style={styles.highlight}>{stats.averageCycleLength} dias</Text></Text>
                    <Text style={styles.cardDetail}>Duração média do fluxo: <Text style={styles.highlight}>{stats.averageFlowDuration} dias</Text></Text>
                </View>
            </>
        );
    };

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDataAndPredict} colors={["#E91E63"]} />}
        >
            <Text style={styles.title}>Meu Ciclo Hoje</Text>
            {renderContent()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, backgroundColor: '#F7F2F6' },
    container: { padding: 20, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#E91E63', marginBottom: 20, alignSelf: 'flex-start' },
    messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    messageText: { fontSize: 20, textAlign: 'center', marginBottom: 30, color: '#777' },
    cycleVisualizer: { width: 250, height: 250, borderRadius: 125, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginVertical: 20, borderWidth: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    visualizerText: { fontSize: 16, color: '#777' },
    cycleDayNumber: { fontSize: 72, fontWeight: 'bold' },
    visualizerPhase: { fontSize: 20, fontWeight: '600', textTransform: 'capitalize' },
    predictionCard: { width: '100%', padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10, elevation: 2, shadowOpacity: 0.1, marginTop: 20, marginBottom: 10 },
    statsCard: { width: '100%', padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10, elevation: 2, shadowOpacity: 0.1, marginTop: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    cardDetail: { fontSize: 16, color: '#555', lineHeight: 24 },
    highlight: { fontWeight: 'bold', color: '#E91E63' },
    mainButton: { backgroundColor: '#E91E63', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 50, marginTop: 20, elevation: 3 },
    mainButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
