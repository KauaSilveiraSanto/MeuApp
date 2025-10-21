// Estrutura para o Registro Diário de Sintomas (para a futura IA)
export interface DailyTracking {
    date: string; // 'YYYY-MM-DD'
    symptoms: string[]; 
    mood: string[]; 
    flowIntensity: 'nenhum' | 'leve' | 'moderado' | 'intenso';
    observations: string; 
}


// Interface para as Previsões (para a tela Home) - ESTA INTERFACE FOI SUBSTITUÍDA
// As novas interfaces (CycleStats, CyclePrediction, CurrentCycleInfo) estão em utils/cycle-calculations.ts
/*
export interface CyclePrediction {
    averageCycleLength: number;
    averagePeriodLength: number;
    
    // Data prevista para o próximo período (início)
    nextPeriodStart: string | null;
    
    // Data prevista para o fim do último período registrado
    lastPeriodEnd: string;
    
    fertileWindowStart: string;
    fertileWindowEnd: string;
    
    // Dia da ovulação previsto
    ovulationDay: string | null;

    // Propriedades extras (opcionais, mas úteis para exibição)
    cycleDayToday?: number | null; 
    phase?: string;
}
*/


// Opções para a tela de registro de sintomas
export const SYMPTOM_OPTIONS = [
    'Cólica', 'Dor de cabeça', 'Seios sensíveis', 'Acne', 'Cansaço', 'Inchaço'
];

// Opções para a tela de registro de humor
export const MOOD_OPTIONS = [
    'Feliz', 'Triste', 'Ansiosa', 'Irritada', 'Focada', 'Energética', 'Cansada'
];

// Constante necessária para o daily-log.tsx
export const FLOW_INTENSITY_OPTIONS = [
    'nenhum', 'leve', 'moderado', 'intenso'
];
