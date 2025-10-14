import { addDays, differenceInDays } from 'date-fns';
import { Cycle } from '../types/cycle';

/**
 * Interfaces para as estruturas de dados de saída.
 */
export interface CycleStats {
    averageCycleLength: number;
    averageFlowDuration: number;
    cycleCount: number;
}

export interface CyclePrediction {
    nextPeriodStartDate: Date;
    fertileWindowStart: Date;
    fertileWindowEnd: Date;
    ovulationDate: Date;
}

export interface CurrentCycleInfo {
    currentDay: number;
    currentPhase: 'menstrual' | 'folicular' | 'ovulação' | 'lútea' | 'desconhecida';
    daysUntilNextPeriod: number;
}

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_FLOW_DURATION = 5;
const LUTEAL_PHASE_LENGTH = 14; // A fase lútea é relativamente constante

/**
 * Calcula estatísticas médias com base no histórico de ciclos.
 * @param cycles - Uma lista de ciclos, do mais recente para o mais antigo.
 * @returns Um objeto com as estatísticas calculadas.
 */
export const calculateStats = (cycles: Cycle[]): CycleStats => {
    if (cycles.length === 0) {
        return { averageCycleLength: DEFAULT_CYCLE_LENGTH, averageFlowDuration: DEFAULT_FLOW_DURATION, cycleCount: 0 };
    }

    const totalFlowDuration = cycles.reduce((sum, cycle) => sum + cycle.flowDurationDays, 0);
    const averageFlowDuration = Math.round(totalFlowDuration / cycles.length);

    // Para calcular a duração do ciclo, precisamos de pelo menos dois ciclos.
    if (cycles.length < 2) {
        return { averageCycleLength: DEFAULT_CYCLE_LENGTH, averageFlowDuration, cycleCount: cycles.length };
    }

    let totalCycleLength = 0;
    // Itera do segundo ciclo mais recente até o mais antigo para calcular as durações
    for (let i = 0; i < cycles.length - 1; i++) {
        const currentCycleStartDate = new Date(cycles[i].startDate);
        const previousCycleStartDate = new Date(cycles[i + 1].startDate);
        const cycleLength = differenceInDays(currentCycleStartDate, previousCycleStartDate);
        
        // Ignora durações de ciclo irrealistas
        if (cycleLength > 15 && cycleLength < 45) {
            totalCycleLength += cycleLength;
        }
    }

    const validCycleCount = cycles.length - 1;
    const averageCycleLength = validCycleCount > 0 
        ? Math.round(totalCycleLength / validCycleCount) 
        : DEFAULT_CYCLE_LENGTH;

    return {
        averageCycleLength: averageCycleLength || DEFAULT_CYCLE_LENGTH,
        averageFlowDuration: averageFlowDuration || DEFAULT_FLOW_DURATION,
        cycleCount: cycles.length,
    };
};

/**
 * Prevê o próximo ciclo com base no ciclo mais recente e nas estatísticas.
 * @param latestCycle - O ciclo mais recente registrado.
 * @param stats - As estatísticas calculadas dos ciclos anteriores.
 * @returns Um objeto com as datas previstas para o próximo ciclo.
 */
export const predictNextCycle = (latestCycle: Cycle, stats: CycleStats): CyclePrediction => {
    const lastStartDate = new Date(latestCycle.startDate);
    const cycleLength = stats.averageCycleLength;

    const nextPeriodStartDate = addDays(lastStartDate, cycleLength);
    const ovulationDate = addDays(nextPeriodStartDate, -LUTEAL_PHASE_LENGTH);
    const fertileWindowStart = addDays(ovulationDate, -5); // 5 dias antes da ovulação
    const fertileWindowEnd = addDays(ovulationDate, 1);   // 1 dia após a ovulação

    return {
        nextPeriodStartDate,
        fertileWindowStart,
        fertileWindowEnd,
        ovulationDate,
    };
};

/**
 * Fornece informações sobre o dia e a fase atuais do ciclo.
 * @param latestCycle - O ciclo mais recente.
 * @param prediction - A previsão para o próximo ciclo.
 * @returns Informações sobre o estado atual do ciclo.
 */
export const getCurrentCycleInfo = (latestCycle: Cycle, prediction: CyclePrediction): CurrentCycleInfo => {
    const today = new Date();
    const lastStartDate = new Date(latestCycle.startDate);
    
    const currentDay = differenceInDays(today, lastStartDate) + 1;
    const daysUntilNextPeriod = differenceInDays(prediction.nextPeriodStartDate, today);

    let currentPhase: CurrentCycleInfo['currentPhase'] = 'desconhecida';

    if (currentDay <= latestCycle.flowDurationDays) {
        currentPhase = 'menstrual';
    } else if (today >= prediction.fertileWindowStart && today <= prediction.fertileWindowEnd) {
        // A ovulação está dentro da janela fértil
        if (differenceInDays(today, prediction.ovulationDate) >= -1 && differenceInDays(today, prediction.ovulationDate) <= 1) {
            currentPhase = 'ovulação';
        } else {
            currentPhase = 'folicular'; // Fase antes da ovulação
        }
    } else if (currentDay > latestCycle.flowDurationDays && today < prediction.fertileWindowStart) {
        currentPhase = 'folicular';
    } else if (today > prediction.ovulationDate && today < prediction.nextPeriodStartDate) {
        currentPhase = 'lútea';
    }

    return {
        currentDay,
        currentPhase,
        daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod), // Não mostra dias negativos
    };
};
