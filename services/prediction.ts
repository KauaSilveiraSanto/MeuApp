// services/prediction.ts (FINAL, COMPLETO E ROBUSTO)

import { addDays, differenceInDays, format, parseISO } from 'date-fns';
// Importação dos tipos
import { Cycle } from '../types/cycle';
import { CyclePrediction } from '../utils/cycle-calculations';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

// Função principal de cálculo e previsão
export function calculatePrediction(dates: Cycle[]): CyclePrediction {
    
    // 🚨 CORREÇÃO CRÍTICA: Garante que só objetos válidos (com a propriedade startDate) sejam usados para cálculo
    const validDates = dates.filter(date => date && date.startDate);

    // Se não há dados válidos, retorna a previsão padrão
    if (validDates.length === 0) {
        return {
			// averageCycleLength removido, não faz parte de CyclePrediction
			// averagePeriodLength removido, não faz parte de CyclePrediction
            // lastPeriodEnd formatada para hoje, já que não há dados históricos
			// lastPeriodEnd removido, não faz parte de CyclePrediction
			nextPeriodStartDate: new Date(),
			fertileWindowStart: new Date(),
			fertileWindowEnd: new Date(),
			ovulationDate: new Date(),
            // cycleDayToday removido, não faz parte de CyclePrediction
            // phase removido, não faz parte de CyclePrediction
        };
    }
    
    // 1. Preparação dos Dados
    // Datas em ordem decrescente (mais recente primeiro)
    const sortedDates = validDates.slice().sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    let totalCycleLength = 0;
    let totalPeriodLength = 0;
    let numCycles = 0;

    // 2. Calcula a Duração Média
    for (let i = 1; i < sortedDates.length; i++) {
        // 🚨 CORREÇÃO: Usando 'startDate'
        const previousStart = parseISO(sortedDates[i].startDate);
        const currentStart = parseISO(sortedDates[i-1].startDate);
        
        const cycleLength = differenceInDays(currentStart, previousStart);
        totalCycleLength += cycleLength;
        
        // 🚨 CORREÇÃO: Usando 'flowDurationDays'
        // Uso de || DEFAULT_PERIOD_LENGTH evita erro de acesso a 'undefined'
        totalPeriodLength += sortedDates[i-1].flowDurationDays || DEFAULT_PERIOD_LENGTH;
        numCycles++;
    }

    const averageCycleLength = numCycles > 0 
        ? Math.round(totalCycleLength / numCycles) 
        : DEFAULT_CYCLE_LENGTH;
        
    const averagePeriodLength = numCycles > 0 
        ? Math.round(totalPeriodLength / numCycles) 
        : DEFAULT_PERIOD_LENGTH;
    
    // 3. Previsão do Próximo Ciclo e Janela Fértil
    const lastPeriod = sortedDates[0];
    // 🚨 CORREÇÃO: Usando 'startDate'
    const lastPeriodStart = parseISO(lastPeriod.startDate);
    
    // Próximo Período = Data do último + duração média
    const nextPeriodDate = addDays(lastPeriodStart, averageCycleLength);
    const nextPeriodStart = format(nextPeriodDate, 'yyyy-MM-dd');
    
    // Fim do Último Período
    // 🚨 CORREÇÃO: Usando 'flowDurationDays'
    const lastPeriodLength = lastPeriod.flowDurationDays || DEFAULT_PERIOD_LENGTH;
    const lastPeriodEnd = format(
        addDays(lastPeriodStart, lastPeriodLength - 1), 
        'yyyy-MM-dd'
    );

    // Dia da Ovulação: 14 dias antes do próximo período (fase lútea padrão)
    const ovulationDayDate = addDays(nextPeriodDate, -14);
    const ovulationDay = format(ovulationDayDate, 'yyyy-MM-dd');
    
    // Janela Fértil: 5 dias antes da Ovulação até o dia da Ovulação
    const fertileWindowStart = format(addDays(ovulationDayDate, -5), 'yyyy-MM-dd');
    const fertileWindowEnd = format(addDays(ovulationDayDate, 0), 'yyyy-MM-dd'); 

    // 4. Retorno (Deve corresponder à interface CyclePrediction)
    return {
	// averageCycleLength removido, não faz parte de CyclePrediction
	// averagePeriodLength removido, não faz parte de CyclePrediction
	// lastPeriodEnd removido, não faz parte de CyclePrediction
	nextPeriodStartDate: new Date(),
	fertileWindowStart: typeof fertileWindowStart === 'string' ? new Date(fertileWindowStart) : fertileWindowStart,
	fertileWindowEnd: typeof fertileWindowEnd === 'string' ? new Date(fertileWindowEnd) : fertileWindowEnd,
	ovulationDate: typeof ovulationDay === 'string' ? new Date(ovulationDay) : ovulationDay,
        // Deixamos estas como null/padrão, pois o cálculo do dia do ciclo e da fase será feito na tela Home.
	// cycleDayToday removido, não faz parte de CyclePrediction
	// phase removido, não faz parte de CyclePrediction
    };
}
