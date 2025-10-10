// services/storage.ts (CÓDIGO COMPLETO E CORRIGIDO)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CycleDate } from '../types/cycle'; // Caminho para a pasta 'types'

const CYCLE_KEY = '@mycycleapp:cycleDates';
const TRACKING_KEY = '@mycycleapp:dailyTracking'; 

// 🚨 CORREÇÃO CRÍTICA: export async function
export async function loadCycleDates(): Promise<CycleDate[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(CYCLE_KEY);
    if (jsonValue != null) {
      const dates: CycleDate[] = JSON.parse(jsonValue);
      // Retorna ordenado (mais recente primeiro)
      return dates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return []; 
  } catch (e) {
    console.error("Erro ao carregar dados do ciclo:", e);
    return []; 
  }
}

// 🚨 CORREÇÃO CRÍTICA: export async function
export async function saveCycleDates(dates: CycleDate[]): Promise<void> {
  try {
    const sortedDates = dates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const jsonValue = JSON.stringify(sortedDates);
    await AsyncStorage.setItem(CYCLE_KEY, jsonValue);
  } catch (e) {
    console.error("Erro ao salvar dados do ciclo:", e);
    throw new Error("Falha ao salvar a lista de ciclos.");
  }
}

// ... (Adicione as funções de loadDailyTracking e saveDailyTracking com a mesma sintaxe 'export async function')