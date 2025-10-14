import {
    addCycle,
    getAllCycles,
    loadDailyLog,
    saveDailyLog
} from './sqlite';

// Interface compatível para uso nas telas
export const FirestoreServiceInstance = {
  addCycle,
  getAllCycles,
  saveDailyLog,
  loadDailyLog,
};