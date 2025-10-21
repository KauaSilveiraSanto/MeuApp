import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useAuth } from '../../components/AuthContext';
import { Cycle } from '../../services/sqlite';
import { DatabaseService } from '../../services/storage';
import { API_BASE_URL } from '../../src/config/api';

// --- Configuração de Localização para o Calendário ---
LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    today: "Hoje"
};
LocaleConfig.defaultLocale = 'pt-br';

// --- Constantes de Estilo ---
const PRIMARY_COLOR = '#E91E63';
const CYCLE_START_COLOR = '#FF6F61'; // Coral for cycle start
const MARKED_DOT_COLOR = '#5D3FD3'; // Roxo para os pontos

export default function CyclesScreen() {
    const router = useRouter();
    const { user } = useAuth(); // Pega o usuário logado
    const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // Formato 'YYYY-MM'
    const [isLoading, setIsLoading] = useState(true);
    // Esta é a sua função para o botão "onPress"
const handleSalvarCiclo = async () => {
  // 1. Pegue os dados da sua tela (de um 'useState', por exemplo)
  // Vou simular os dados por enquanto:
  const dadosDoCiclo = {
    data_inicio: new Date(), // Pega a data de hoje
    observacoes: "Ciclo salvo pelo app!"
    // nota: data_fim é opcional, então não precisamos enviar
  };

  console.log('Enviando dados para a API:', dadosDoCiclo);

  try {
    // 2. A chamada FETCH (aqui é a mágica!)
    const resposta = await fetch(`${API_BASE_URL}/ciclos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosDoCiclo), // Transforma o objeto JS em texto JSON
    });

    // 3. Checar se a requisição deu certo
    if (!resposta.ok) {
      // Se o servidor deu um erro (ex: 400, 500), ele entra aqui
      throw new Error('Falha ao salvar no servidor. Status: ' + resposta.status);
    }

    // 4. Pegar a resposta do servidor (o ciclo que foi criado)
    const cicloSalvo = await resposta.json();

    console.log('Ciclo salvo com sucesso no banco de dados:', cicloSalvo);
    alert('Ciclo salvo com sucesso!');

  } catch (error) {
    // 5. Lidar com erros de rede ou da API
    console.error('Erro ao salvar ciclo:', error);
    alert('Erro ao salvar: ' + error.message);
  }
};

    // Hook para buscar dados quando a tela é focada ou o mês muda
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    // Requisito Chave: Garante que só buscamos dados se tivermos um ID de usuário.
                    if (!user?.id) {
                        throw new Error("ID do usuário não encontrado. Não é possível buscar os dados.");
                    }

                    // Calcula o primeiro e o último dia do mês corrente
                    const year = parseInt(currentMonth.slice(0, 4));
                    const month = parseInt(currentMonth.slice(5, 7));
                    const startDate = `${currentMonth}-01`;
                    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

                    // Fetch both daily logs and cycle starts
                    const [logs, cycles] = await Promise.all([
                        DatabaseService.getLogsForPeriod(user.id, startDate, endDate),
                        DatabaseService.getAllCycles(user.id)
                    ]);

                    // Transforma os logs no formato esperado pelo componente Calendar
                    const newMarkedDates: { [key: string]: any } = {};

                    // 1. Mark daily logs with a dot
                    logs.forEach(log => {
                        if (log.date) {
                            newMarkedDates[log.date] = {
                                dots: [{ key: 'log', color: MARKED_DOT_COLOR }],
                            };
                        }
                    });

                    // 2. Mark cycle start dates with a selected background
                    // This will merge with any existing dots
                    cycles.forEach((cycle: Cycle) => {
                        if (cycle.startDate >= startDate && cycle.startDate <= endDate) {
                            const existingMarking = newMarkedDates[cycle.startDate] || {};
                            newMarkedDates[cycle.startDate] = {
                                ...existingMarking,
                                selected: true,
                                selectedColor: CYCLE_START_COLOR,
                            };
                        }
                    });

                    setMarkedDates(newMarkedDates);
                } catch (error) {
                    console.error("Erro ao buscar logs para o calendário:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, [currentMonth, user?.id]) // O efeito é re-executado quando o mês ou o usuário muda
    );

    // Navega para a tela de modal ao pressionar um dia
    const onDayPress = (day: DateData) => {
        router.push({
            pathname: '/modal',
            params: { date: day.dateString } // Passa a data selecionada
        });
    };

    // Atualiza o estado do mês atual quando o usuário navega no calendário
    const onMonthChange = (month: DateData) => {
        setCurrentMonth(month.dateString.slice(0, 7));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meu Calendário</Text>
            <Text style={styles.subtitle}>
                Selecione um dia para registrar seus sintomas e notas.
            </Text>
            {isLoading && <ActivityIndicator style={styles.loader} size="small" color={PRIMARY_COLOR} />}
            <Calendar
                style={styles.calendar}
                current={currentMonth}
                onDayPress={onDayPress}
                onMonthChange={onMonthChange}
                markedDates={markedDates}
                // Use 'multi-dot' to allow combining a selected day with dots
                markingType="multi-dot"
                theme={{
                    calendarBackground: '#FFFFFF',
                    selectedDayBackgroundColor: PRIMARY_COLOR,
                    todayTextColor: PRIMARY_COLOR,
                    arrowColor: PRIMARY_COLOR,
                    textSectionTitleColor: '#b6c1cd',
                    textDayFontWeight: '500',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '500',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                }}
            />
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: CYCLE_START_COLOR }]} />
                    <Text style={styles.legendText}>Início do Ciclo</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, {
                        backgroundColor: MARKED_DOT_COLOR, borderRadius: 5, width: 10, height: 10, alignSelf: 'center'
                    }]} />
                    <Text style={styles.legendText}>Log Diário</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7', padding: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
    calendar: { borderRadius: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    loader: { position: 'absolute', top: 100, alignSelf: 'center', zIndex: 10 },
    legendContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, marginTop: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendIndicator: { width: 20, height: 20, borderRadius: 10, marginRight: 8 },
    legendText: { fontSize: 14, color: '#555' },
});