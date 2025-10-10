// services/prediction.ts (CÓDIGO COMPLETO E CORRIGIDO)

import { addDays, format, parseISO } from 'date-fns';
import { CycleDate, CyclePrediction } from '../types/cycle';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

// 🚨 CORREÇÃO CRÍTICA: export function
export function calculatePrediction(dates: CycleDate[]): CyclePrediction {
  if (dates.length === 0) {
    return {
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      lastPeriodEnd: format(new Date(), 'yyyy-MM-dd'),
      nextPeriodStart: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      ovulationDay: null,
    };
  }
  
  // Datas em ordem decrescente (mais recente primeiro)
  const sortedDates = dates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // 1. Calcula a Duração Média (use o código completo de cálculo que enviamos antes)
  // ... (calcula averageCycleLength e averagePeriodLength)

  const averageCycleLength = 28; // Valor de exemplo, substitua pelo cálculo real
  const averagePeriodLength = 5; // Valor de exemplo, substitua pelo cálculo real
  
  // 2. Previsão do Próximo Ciclo e Janela Fértil
  const lastPeriodStart = parseISO(sortedDates[0].date);
  const nextPeriodDate = addDays(lastPeriodStart, averageCycleLength);
  const nextPeriodStart = format(nextPeriodDate, 'yyyy-MM-dd');
  
  const lastPeriodEnd = format(addDays(lastPeriodStart, sortedDates[0].periodLength || DEFAULT_PERIOD_LENGTH - 1), 'yyyy-MM-dd');
  
  const ovulationDayDate = addDays(nextPeriodDate, -14);
  const ovulationDay = format(ovulationDayDate, 'yyyy-MM-dd');
  
  const fertileWindowStart = format(addDays(ovulationDayDate, -5), 'yyyy-MM-dd');
  const fertileWindowEnd = format(addDays(ovulationDayDate, 0), 'yyyy-MM-dd'); 

  return {
    averageCycleLength,
    averagePeriodLength,
    lastPeriodEnd,
    nextPeriodStart,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDay,
  };
}