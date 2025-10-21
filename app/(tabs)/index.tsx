import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { Cycle } from '../../services/sqlite';
import { DatabaseService } from '../../services/storage';
import { calculateStats, CurrentCycleInfo, CyclePrediction, CycleStats, getCurrentCycleInfo, predictNextCycle } from '../../utils/cycle-calculations';

// Cores definidas no TabLayout
const PRIMARY_COLOR = '#E91E63'; 
const SECONDARY_TEXT = '#666';

// --- Componente Auxiliar para Boas-Vindas ---
const Greeting = ({ userName }: { userName: string }) => (
    <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {userName}!</Text>
    </View>
);

// Helper para formatar data em Português
// CORREÇÃO: Aceita Date | string | undefined para resolver o erro de tipagem.
const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    try {
        const dateObject = typeof date === 'string' ? new Date(date) : date;
        // Converte o string ISO ou objeto Date para objeto Date e formata
        return format(dateObject, "dd 'de' MMMM", { locale: ptBR });
    } catch (e) {
        // Retorna o valor original ou um fallback se a formatação falhar
        return typeof date === 'string' ? date : 'Data inválida';
    }
};

// Mapeamento de Fases para Português
const phaseTranslations: { [key: string]: string } = {
    menstrual: 'Menstruação',
    folicular: 'Fase Folicular',
    ovulação: 'Ovulação',
    lútea: 'Fase Lútea',
    desconhecida: 'Fase Desconhecida',
};

export default function HomeScreen() {
    const { user } = useAuth(); 
    
    // Usa o email do objeto de usuário para saudação
    const emailPrefix = user?.email ? user.email.split('@')[0] : 'Usuária';
    const userName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1); 

    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [stats, setStats] = useState<CycleStats | null>(null);
    const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
    const [currentInfo, setCurrentInfo] = useState<CurrentCycleInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchDataAndPredict = useCallback(async () => {
        setLoading(true);
        try {
            // Requisito Chave: Garante que só buscamos dados se tivermos um ID de usuário.
            if (!user?.id) {
                throw new Error("ID do usuário não encontrado. Não é possível buscar os dados.");
            }
            // Pega os ciclos (deve retornar ordenado do mais recente para o mais antigo)
            const fetchedCycles = await DatabaseService.getAllCycles(user.id); 
            setCycles(fetchedCycles);

            if (fetchedCycles.length > 0) {
                const calculatedStats = calculateStats(fetchedCycles);
                setStats(calculatedStats);

                // O ciclo mais recente é o primeiro item
                const nextCyclePrediction = predictNextCycle(fetchedCycles[0], calculatedStats);
                setPrediction(nextCyclePrediction);

                const cycleInfo = getCurrentCycleInfo(fetchedCycles[0], nextCyclePrediction, calculatedStats);
                setCurrentInfo(cycleInfo);
            } else {
                setStats(null);
                setPrediction(null);
                setCurrentInfo(null);
            }
        } catch (error) {
            console.error("Erro ao carregar ou calcular dados:", error);
            // Uso de Alert temporário, idealmente seria um modal customizado.
            Alert.alert("Erro de Dados", "Não foi possível carregar os dados do ciclo. Verifique sua conexão."); 
        } finally {
            setLoading(false);
        }
    }, [user?.id]); // Adiciona user.id como dependência

    // Recarrega os dados sempre que a tela é focada (navegação de volta)
    useFocusEffect(
        useCallback(() => {
            fetchDataAndPredict();
        }, [fetchDataAndPredict])
    );
    
    // --- Renderização Condicional do Conteúdo ---
    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    <Text style={styles.loadingText}>Carregando dados do ciclo...</Text>
                </View>
            );
        }
        
        // Se não houver ciclos, pede para registrar o primeiro
        if (cycles.length === 0) {
            return (
                <View style={styles.cycleCard}>
                    <Text style={[styles.cardTitle, { color: PRIMARY_COLOR }]}>Bem-vinda ao seu rastreador!</Text>
                    <Text style={styles.phaseText}>
                        Parece que você ainda não registrou nenhum ciclo.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.quickActionButton, { marginTop: 20 }]} 
                        onPress={() => router.push({ 
                            pathname: '/modal', 
                            params: { date: new Date().toISOString().slice(0, 10) } 
                        })}
                    >
                        <Ionicons name="add-circle" size={28} color="#FFF" />
                        <Text style={styles.quickActionButtonText}>Registrar Primeiro Ciclo</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        
        // Se temos ciclos mas os dados calculados (currentInfo e prediction) ainda estão nulos,
        // exibimos um loading temporário. Isso resolve os erros de tipo no TypeScript.
        if (!currentInfo || !prediction) {
             return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    <Text style={styles.loadingText}>Calculando informações do ciclo...</Text>
                </View>
            );
        }

        // Dados do Ciclo Atual
        // Com a verificação acima, 'prediction' e 'currentInfo' são garantidos como não-nulos.
        const nextPeriodDate = formatDate(prediction.nextPeriodStartDate); 
        const daysUntil = currentInfo.daysUntilNextPeriod;

        const currentPhaseKey = currentInfo.currentPhase; // ex: 'menstrual', 'folicular'
        const currentCycleDay = currentInfo.currentDay;
        const isPeriod = currentPhaseKey === 'menstrual';
        
        // Traduz a chave da fase para exibição
        const currentPhaseDisplay = phaseTranslations[currentPhaseKey] || phaseTranslations.unknown;

        
        // Dica baseada na fase
        let tipText = '';
        if (stats) {
            // CORREÇÃO: Usar as chaves em português definidas em 'CurrentCycleInfo'
            if (currentPhaseKey === 'menstrual' && currentInfo.currentDay !== undefined && stats.averageFlowDuration) {
                tipText = `Dia ${currentCycleDay} do ciclo. É dia de descanso! Seu fluxo dura em média ${stats.averageFlowDuration} dias. Mantenha-se hidratada.`;
            } else if (currentPhaseKey === 'folicular' && currentInfo.currentDay !== undefined) {
                tipText = `Dia ${currentCycleDay} do ciclo. Sua energia está aumentando! O ciclo médio é de ${stats.averageCycleLength} dias. Aproveite para planejar e fazer exercícios.`;
            } else if (currentPhaseKey === 'ovulação' && currentInfo.currentDay !== undefined) {
                tipText = `Dia ${currentCycleDay} do ciclo. Pico de fertilidade! A janela de ovulação é estimada em torno do dia ${Math.round(stats.averageCycleLength - 14)} do ciclo.`;
            } else if (currentPhaseKey === 'lútea' && currentInfo.currentDay !== undefined) {
                tipText = `Dia ${currentCycleDay} do ciclo. Fase Lútea: pratique o autocuidado e prepare-se. O próximo período está a ${daysUntil} dias.`;
            } else {
                 tipText = "Estamos calculando sua fase atual! Registre mais ciclos para obter estatísticas personalizadas.";
            }
        } else {
             tipText = "Registre mais ciclos para obter estatísticas personalizadas!";
        }
        
        return (
            <>
                {/* Cartão de Status do Ciclo */}
                <View style={styles.cycleCard}>
                    <Text style={styles.cardTitle}>Status Atual do Ciclo</Text>
                    
                    {/* Destaque do Próximo Evento */}
                    <View style={styles.nextEvent}>
                        <Ionicons 
                            name={isPeriod ? "water-outline" : "calendar-outline"} 
                            size={24} 
                            color={isPeriod ? '#00A86B' : PRIMARY_COLOR} // Cor verde para fluxo ou rosa para previsão
                        />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.nextEventLabel}>
                                {isPeriod ? 'Dia Atual do Fluxo' : 'Próxima Menstruação Estimada:'}
                            </Text>
                            <Text style={styles.nextEventDate}>
                                {/* CORREÇÃO: Usa currentDay, que é o dia do ciclo. flowDay não existe em CurrentCycleInfo */}
                                {isPeriod && currentInfo.currentDay !== undefined ? `Dia ${currentInfo.currentDay}` : nextPeriodDate}
                            </Text>
                        </View>
                    </View>

                    {/* Contador de Dias / Dia do Ciclo */}
                    <View style={[styles.counterContainer, { backgroundColor: isPeriod ? '#E0F2F1' : '#FCE4EC' }]}>
                        <Text style={[styles.daysCount, { color: isPeriod ? '#00A86B' : PRIMARY_COLOR }]}>
                            {isPeriod && currentInfo.currentDay !== undefined ? currentCycleDay : daysUntil}
                        </Text>
                        <Text style={[styles.daysLabel, { color: isPeriod ? '#00A86B' : PRIMARY_COLOR }]}>
                            {isPeriod ? 'Dia do Ciclo' : 'dias restantes'}
                        </Text>
                    </View>

                    <Text style={styles.phaseText}>
                        Fase atual: <Text style={{ fontWeight: 'bold' }}>{currentPhaseDisplay}</Text>
                    </Text>
                </View>
                
                {/* Botão para Ações Rápidas (Chamada para o Modal) */}
                <Link href="/modal" asChild>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Ionicons name="add-circle" size={28} color="#FFF" />
                        <Text style={styles.quickActionButtonText}>Registrar Sintoma ou Ciclo</Text>
                    </TouchableOpacity>
                </Link>
                
                {/* Seção de Dicas (Conteúdo Adicional) */}
                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>Dica da Fase</Text>
                    <Text style={styles.tipText}>
                        {tipText}
                    </Text>
                </View>
            </>
        );
    };

    // --- Renderização Principal ---
    return (
        <ScrollView 
            style={styles.container}
            // Adiciona um refresh control se estivermos carregando
            // CORREÇÃO: Usar o componente RefreshControl do React Native
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDataAndPredict} colors={[PRIMARY_COLOR]} />}

            // refreshControl={
            //     <ActivityIndicator 
            //         size="small" 
            //         color={PRIMARY_COLOR} 
            //         animating={loading && cycles.length > 0} 
            //         style={{ opacity: loading && cycles.length > 0 ? 1 : 0 }}
            //     />
            // }
        >
            <Greeting userName={userName} />
            {renderContent()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7', // Fundo leve
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '700',
        color: PRIMARY_COLOR, // Alterado para PRIMARY_COLOR para destacar
    },
    // Estilos para o estado de carregamento/sem dados
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 200, 
    },
    loadingText: {
        marginTop: 10,
        color: SECONDARY_TEXT,
        fontSize: 16
    },
    cycleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 25,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: SECONDARY_TEXT,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 5,
        width: '100%',
        textAlign: 'center',
    },
    nextEvent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    nextEventLabel: {
        fontSize: 14,
        color: SECONDARY_TEXT,
    },
    nextEventDate: {
        fontSize: 22,
        fontWeight: 'bold',
        color: PRIMARY_COLOR,
    },
    counterContainer: {
        marginVertical: 15,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#FCE4EC', // Rosa bem claro
        alignItems: 'center',
        width: '60%',
    },
    daysCount: {
        fontSize: 56,
        fontWeight: '900',
        color: PRIMARY_COLOR,
    },
    daysLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: PRIMARY_COLOR,
        marginTop: -5,
    },
    phaseText: {
        fontSize: 16,
        color: SECONDARY_TEXT,
        marginTop: 10,
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY_COLOR,
        padding: 18,
        borderRadius: 12,
        marginBottom: 30,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    quickActionButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    tipsSection: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginBottom: 10,
    },
    tipText: {
        fontSize: 16,
        color: SECONDARY_TEXT,
        lineHeight: 24,
    }
});
