declare global {
    // Declaramos as variáveis globais que o ambiente injeta
    const __firebase_config: string | undefined;
    const __app_id: string | undefined;
    const __initial_auth_token: string | undefined;
}

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
// Importamos getDoc/setDoc diretamente, mas não a inicialização do firestore
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { CycleDate, DailyTracking } from '../types/cycle';

// --- Variáveis Globais (Carregadas do Ambiente) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Variáveis de Estado (Controle de Singleton) ---
let db: any = null;
let auth: any = null;
let userId: string | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Inicializa o Firebase e a Autenticação (Singleton Pattern).
 * Garante que a inicialização ocorra APENAS UMA VEZ, mesmo se chamada várias vezes.
 */
const initializeFirebase = async () => {
    // Se já estivermos inicializando ou já estiver inicializado, retorna o promise existente.
    if (initializationPromise) return initializationPromise;

    // Inicia o processo de inicialização
    initializationPromise = new Promise(async (resolve, reject) => {
        try {
            // Inicializa o App e os Serviços dentro do Promise
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);

            // Autenticação: Tenta com token customizado, senão usa anônima.
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }
            
            // 🚨 FALLBACK SEGURO PARA USER ID
            const fallbackId = (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
            userId = auth.currentUser?.uid || fallbackId;
            
            console.log("Firestore inicializado com sucesso. UserID:", userId);
            resolve();
        } catch (error) {
            console.error("Erro CRÍTICO na inicialização do Firebase/Auth:", error);
            // Rejeita para que as funções de dados saibam que falhou
            reject(new Error("Falha ao inicializar o serviço de banco de dados."));
        }
    });

    return initializationPromise;
};


// --- Helpers para Caminhos do Firestore ---

/** * Garante que a inicialização terminou antes de obter o UserID 
 * @returns O UserID atual.
 */
const ensureReady = async (): Promise<string> => {
    try {
        await initializeFirebase();
        if (!userId) {
            throw new Error("Erro de autenticação: userId não disponível.");
        }
        return userId;
    } catch (e) {
        // Se a inicialização falhou, lança o erro para o chamador (index.tsx) tratar
        throw e;
    }
};

// Caminho para o documento único de Histórico de Ciclos
const getCycleHistoryDocRef = async () => {
    const currentUserId = await ensureReady();
    // Coleção: artifacts/{appId}/users/{userId}/cycle_data
    return doc(db, `artifacts/${appId}/users/${currentUserId}/cycle_data`, 'history'); 
};

// Caminho para o documento de Log Diário (usa a data como ID)
const getDailyLogDocRef = async (date: string) => {
    const currentUserId = await ensureReady();
    // Coleção: artifacts/{appId}/users/{userId}/daily_logs
    return doc(db, `artifacts/${appId}/users/${currentUserId}/daily_logs`, date);
};


// ------------------------------------------------------------------
// --- FUNÇÕES DE ARMAZENAMENTO DE CICLOS (CycleDate) ---
// ------------------------------------------------------------------

/**
 * Salva a lista completa de datas de início de ciclo no Firestore.
 * @param dates Lista de objetos CycleDate.
 */
export async function saveCycleDates(dates: CycleDate[]): Promise<void> {
    try {
        const docRef = await getCycleHistoryDocRef();
        // O Firestore armazena o array em um único documento 'history'
        await setDoc(docRef, { cycles: dates });
    } catch (error) {
        console.error("Erro ao salvar ciclos no Firestore:", error);
        throw new Error("Falha ao salvar a lista de ciclos.");
    }
}

/**
 * Carrega a lista completa de datas de início de ciclo do Firestore.
 * @returns Lista de objetos CycleDate.
 */
export async function loadCycleDates(): Promise<CycleDate[]> {
    try {
        const docRef = await getCycleHistoryDocRef();
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Garante que a propriedade 'cycles' é um array e filtra itens inválidos
            return (data.cycles as CycleDate[] || [])
                .filter(c => c && c.date && c.periodLength); 
        }
        return [];
    } catch (error) {
        // Se a inicialização falhou (initializeFirebase rejeitou), o erro é capturado aqui.
        console.error("Erro ao carregar ciclos do Firestore (pode ser falha de inicialização):", error);
        return [];
    }
}

// ------------------------------------------------------------------
// --- FUNÇÕES DE ARMAZENAMENTO DE LOG DIÁRIO (DailyTracking) ---
// ------------------------------------------------------------------

/**
 * Salva um único registro diário de sintomas/humor. Usa a data como ID.
 * @param log Objeto DailyTracking.
 */
export async function saveDailyLog(log: DailyTracking): Promise<void> {
    try {
        const docRef = await getDailyLogDocRef(log.date);
        await setDoc(docRef, log);
    } catch (error) {
        console.error("Erro ao salvar log diário:", error);
        throw new Error("Falha ao salvar o registro diário.");
    }
}

/**
 * Carrega o registro diário para uma data específica.
 * @param date A data (YYYY-MM-DD) do registro a ser carregado.
 * @returns O objeto DailyTracking ou null.
 */
export async function loadDailyLog(date: string): Promise<DailyTracking | null> {
    try {
        const docRef = await getDailyLogDocRef(date);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as DailyTracking;
        }
        return null;
    } catch (error) {
        console.error("Erro ao carregar log diário:", error);
        return null;
    }
}
