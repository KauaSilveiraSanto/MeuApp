import * as SQLite from 'expo-sqlite';
import { Cycle, DailyTracking } from '../types/cycle';

// Utilitário para log de erros
function logError(context: string, error: any) {
  console.error(`[SQLite][${context}]`, error);
}

const DB_NAME = 'meuapp.db';
let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  try {
    if (!db) {
      db = await SQLite.openDatabaseAsync(DB_NAME);
      await migrateDbIfNeeded(db);
    }
    return db;
  } catch (error) {
    logError('getDb', error);
    throw new Error('Erro ao abrir banco de dados');
  }
}

async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cycles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startDate TEXT NOT NULL,
        flowDurationDays INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS dailyLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        symptoms TEXT,
        mood TEXT,
        flowIntensity TEXT,
        observations TEXT
      );
    `);
  } catch (error) {
    logError('migrateDbIfNeeded', error);
    throw new Error('Erro ao migrar banco de dados');
  }
}

export async function addCycle(cycle: Omit<Cycle, 'id' | 'userId'>): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO cycles (startDate, flowDurationDays) VALUES (?, ?)',
    cycle.startDate,
    cycle.flowDurationDays
  );
  return result.lastInsertRowId;
}

export async function getAllCycles(): Promise<Cycle[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: number; startDate: string; flowDurationDays: number }>('SELECT id, startDate, flowDurationDays FROM cycles ORDER BY startDate DESC');
  return rows.map((row: { id: number; startDate: string; flowDurationDays: number }) => ({
    id: String(row.id),
    userId: '',
    startDate: row.startDate,
    flowDurationDays: row.flowDurationDays
  }));
}

export async function saveDailyLog(entry: DailyTracking): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM dailyLogs WHERE date = ?', entry.date);
  const symptoms = JSON.stringify(entry.symptoms || []);
  const mood = JSON.stringify(entry.mood || []);
  if (existing) {
    await db.runAsync(
      'UPDATE dailyLogs SET symptoms = ?, mood = ?, flowIntensity = ?, observations = ? WHERE date = ?',
      symptoms,
      mood,
      entry.flowIntensity,
      entry.observations,
      entry.date
    );
  } else {
    await db.runAsync(
      'INSERT INTO dailyLogs (date, symptoms, mood, flowIntensity, observations) VALUES (?, ?, ?, ?, ?)',
      entry.date,
      symptoms,
      mood,
      entry.flowIntensity,
      entry.observations
    );
  }
}

export async function loadDailyLog(date: string): Promise<DailyTracking | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ date: string; symptoms: string; mood: string; flowIntensity: string; observations: string }>('SELECT * FROM dailyLogs WHERE date = ?', date);
  if (!row) return null;
  const validFlow: DailyTracking['flowIntensity'][] = ['nenhum', 'leve', 'moderado', 'intenso'];
  const flowIntensity = validFlow.includes(row.flowIntensity as DailyTracking['flowIntensity'])
    ? (row.flowIntensity as DailyTracking['flowIntensity'])
    : 'nenhum';
  return {
    date: row.date,
    symptoms: JSON.parse(row.symptoms || '[]'),
    mood: JSON.parse(row.mood || '[]'),
    flowIntensity,
    observations: row.observations || ''
  };
}

