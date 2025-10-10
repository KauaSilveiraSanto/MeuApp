// Usado para o histórico de Início de Ciclo
export interface CycleDate {
    date: string; // 'YYYY-MM-DD'
    periodLength?: number; // Propriedade opcional (o ? é importante!)
}

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
    averagePeriodLength: number;
    
    // 🚨 RENOMEADO: De 'nextPeriodStartDate' para 'nextPeriodStart'
    nextPeriodStart: string | null;
    
    // 🚨 RENOMEADO: De 'nextPeriodEndDate' para 'lastPeriodEnd'
    lastPeriodEnd: string;
    
    fertileWindowStart: string;
    fertileWindowEnd: string;
    
    // 🚨 PROPRIEDADE FALTANDO: 'ovulationDay'
    ovulationDay: string | null;

    // As propriedades extras que você adicionou, mas que não estão na lógica que criamos (por isso as tornamos opcionais aqui para evitar novos erros)
    cycleDayToday?: number | null; 
    phase?: string;
}

// Opções para a tela de registro
export const SYMPTOM_OPTIONS = [
    'Cólica', 'Dor de cabeça', 'Seios sensíveis', 'Acne', 'Cansaço', 'Inchaço'
];

export const MOOD_OPTIONS = [
    'Feliz', 'Triste', 'Ansiosa', 'Irritada', 'Focada', 'Energética', 'Cansada'
];

// 🛠️ ADICIONADO: Constante necessária para o daily-log.tsx
export const FLOW_INTENSITY_OPTIONS = [
    'nenhum', 'leve', 'moderado', 'intenso'
];
