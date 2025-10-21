import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

// --- Tipos de Dados ---
export interface Cycle {
  id: number;
  userId: string;
  startDate: string;
  endDate: string | null;
}

export interface DailyLog {
  userId: string;
  date: string;
  symptoms: string[];
  notes: string;
}

export interface DailyLogFromDB {
  id: number;
  userId: string;
  date: string;
  symptoms: string; // JSON string
  notes: string;
}

// --- Conexão com o Banco de Dados ---
// A API `next` é assíncrona, então inicializamos o DB com uma Promise.
const dbPromise: Promise<SQLiteDatabase> = openDatabaseAsync('meu-ciclo.db');

/**
 * Cria as tabelas do banco de dados se elas ainda não existirem.
 * Deve ser chamada na inicialização do aplicativo.
 */
export async function initializeDB(): Promise<void> {
  const db = await dbPromise;
  try {
    await db.withTransactionAsync(async () => {
      // Tabela para armazenar os ciclos menstruais
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS cycles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          startDate TEXT NOT NULL,
          endDate TEXT
        );
      `);
      // Tabela para registros diários de sintomas e notas
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS daily_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          date TEXT NOT NULL,
          symptoms TEXT,
          notes TEXT
        );
      `);
    });
    console.log('[SQLite] Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('[SQLite] Erro ao inicializar o banco de dados:', error);
    throw error; // Propaga o erro para ser tratado na inicialização do app
  }
}

/**
 * Adiciona um novo ciclo ao banco de dados de forma robusta.
 * - Previne a criação de ciclos duplicados na mesma data.
 * - Limpa ciclos futuros que se tornariam inválidos.
 * - Fecha o ciclo anterior que estava aberto.
 * @param cycleData Objeto contendo a `startDate` e o `userId`.
 */
export async function addCycle(cycleData: { startDate: string; userId: string }): Promise<void> {
  const db = await dbPromise;
  await db.withTransactionAsync(async () => {
    // Etapa 1: Garantir que não há ciclo duplicado na mesma data de início.
    const existingCycleOnDate = await db.getFirstAsync<Cycle>(
      `SELECT id FROM cycles WHERE userId = ? AND startDate = ?`,
      cycleData.userId,
      cycleData.startDate
    );

    if (existingCycleOnDate) {
      console.log(`[SQLite] Um ciclo já começa na data ${cycleData.startDate} para este usuário.`);
      return; // Evita duplicatas e ações desnecessárias.
    }

    // Etapa 2: Remover quaisquer ciclos que comecem APÓS a nova data de início.
    // Isso corrige o cenário onde o usuário insere um ciclo no passado, invalidando os futuros.
    await db.runAsync(
      `DELETE FROM cycles WHERE userId = ? AND startDate > ?`,
      cycleData.userId,
      cycleData.startDate
    );

    // Etapa 3: Encontrar o ciclo anterior mais recente para fechar o período.
    const previousCycle = await db.getFirstAsync<Cycle>(
      `SELECT * FROM cycles WHERE userId = ? AND startDate < ? ORDER BY startDate DESC LIMIT 1`,
      cycleData.userId,
      cycleData.startDate
    );

    // Etapa 4: Se houver um ciclo anterior e ele estiver aberto, feche-o.
    if (previousCycle && !previousCycle.endDate) {
      const previousEndDate = new Date(cycleData.startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      
      await db.runAsync(
        'UPDATE cycles SET endDate = ? WHERE id = ?',
        previousEndDate.toISOString().slice(0, 10),
        previousCycle.id
      );
    }

    // Etapa 5: Inserir o novo ciclo.
    await db.runAsync(
      'INSERT INTO cycles (userId, startDate, endDate) VALUES (?, ?, NULL)',
      cycleData.userId,
      cycleData.startDate
    );
  });
}

/**
 * Busca todos os ciclos registrados, ordenados do mais recente para o mais antigo.
 * @returns Uma Promise que resolve para um array de ciclos.
 */
export async function getAllCycles(userId: string): Promise<Cycle[]> {
  const db = await dbPromise;
  // Retorna todos os ciclos, com o mais recente (maior startDate) primeiro.
  return await db.getAllAsync<Cycle>(
    'SELECT * FROM cycles WHERE userId = ? ORDER BY startDate DESC',
    userId
  );
}


/**
 * Adiciona ou atualiza um registro diário.
 * Usa `INSERT OR REPLACE` para garantir que cada data seja única.
 * @param log - O objeto de log diário a ser salvo.
 */
export async function addDailyLog(log: Omit<DailyLog, 'id'>): Promise<void> {
  const db = await dbPromise;
  const symptomsJson = JSON.stringify(log.symptoms || []);
  // Como a data não é mais UNIQUE, precisamos deletar o log antigo antes de inserir o novo.
  await db.runAsync('DELETE FROM daily_logs WHERE userId = ? AND date = ?', log.userId, log.date);
  await db.runAsync(
    'INSERT INTO daily_logs (userId, date, symptoms, notes) VALUES (?, ?, ?, ?)',
    log.userId,
    log.date,
    symptomsJson,
    log.notes
  );
}

/**
 * Busca todos os registros diários dentro de um intervalo de datas.
 * @param startDate - A data de início do período (formato 'YYYY-MM-DD').
 * @param endDate - A data de fim do período (formato 'YYYY-MM-DD').
 * @returns Uma Promise que resolve para um array de logs diários.
 */
export async function getLogsForPeriod(userId: string, startDate: string, endDate: string): Promise<DailyLogFromDB[]> {
  const db = await dbPromise;
  return await db.getAllAsync<DailyLogFromDB>(
    'SELECT * FROM daily_logs WHERE userId = ? AND date >= ? AND date <= ? ORDER BY date ASC',
    userId,
    startDate,
    endDate
  );
}

/**
 * Busca um registro diário para uma data específica.
 * @param date - A data do log a ser buscado (formato 'YYYY-MM-DD').
 * @returns Uma Promise que resolve para o log do dia ou `null` se não for encontrado.
 */
export async function getLogForDate(userId: string, date: string): Promise<DailyLogFromDB | null> {
  const db = await dbPromise;
  const result = await db.getFirstAsync<DailyLogFromDB>(
    'SELECT * FROM daily_logs WHERE userId = ? AND date = ?',
    userId,
    date
  );
  return result ?? null;
}

/**
 * Deleta um registro diário para uma data específica.
 * @param date - A data do log a ser deletado (formato 'YYYY-MM-DD').
 */
export async function deleteDailyLog(userId: string, date: string): Promise<void> {
  const db = await dbPromise;
  await db.runAsync(
    'DELETE FROM daily_logs WHERE userId = ? AND date = ?',
    userId,
    date
  );
}
