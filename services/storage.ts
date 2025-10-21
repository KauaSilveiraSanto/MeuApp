import {
    addCycle,
    addDailyLog,
    deleteDailyLog,
    getAllCycles,
    getLogForDate,
    getLogsForPeriod
} from './sqlite';

// Adaptador unificado para o serviço de banco de dados.
// Renomeado de FirestoreServiceInstance para evitar confusão.
export const DatabaseService = {
  addCycle,
  getAllCycles,
  addDailyLog,
  getLogsForPeriod,
  getLogForDate,
  deleteDailyLog,
};