// types/cycle.ts

// Usado para o histórico de Início de Ciclo
export type CycleDate = string; // 'YYYY-MM-DD'

// Estrutura para o Registro Diário de Sintomas (para a futura IA)
export interface DailyTracking {
    date: string; 
    symptoms: string[]; 
    mood: string[]; 
    flowIntensity: 'nenhum' | 'leve' | 'moderado' | 'intenso';
    observations: string; 
}

// Interface para as Previsões (para a tela Home)
export interface CyclePrediction {
    averageCycleLength: number;
    nextPeriodStartDate: string;
    nextPeriodEndDate: string;
    fertileWindowStart: string;
    fertileWindowEnd: string;
    cycleDayToday: number | null;
    phase: string;
}

// Opções para a tela de registro
export const SYMPTOM_OPTIONS = [
    'Cólica', 'Dor de cabeça', 'Seios sensíveis', 'Acne', 'Cansaço', 'Inchaço'
];

export const MOOD_OPTIONS = [
    'Feliz', 'Triste', 'Ansiosa', 'Irritada', 'Focada', 'Energética', 'Cansada'
];