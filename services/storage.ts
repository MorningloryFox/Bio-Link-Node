import { AppState, DEFAULT_PROFILE, DEFAULT_TARGETS, DailyLog, FoodEntry } from '../types';

const STORAGE_KEY = 'BIO_LINK_DATA_V1';

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return {
        profile: DEFAULT_PROFILE,
        targets: DEFAULT_TARGETS,
        favorites: [],
        logs: {},
      };
    }
    const parsed = JSON.parse(serialized);
    
    // MIGRATION LOGIC
    const migratedLogs: Record<string, DailyLog> = {};
    if (parsed.logs) {
      Object.keys(parsed.logs).forEach(key => {
        const log = parsed.logs[key];
        migratedLogs[key] = {
          ...log,
          exercises: log.exercises || [],
          entries: (log.entries || []).map((entry: any) => ({
             ...entry,
             category: entry.category || 'snack' // Default category for old entries
          }))
        };
      });
    }

    return {
      ...parsed,
      favorites: parsed.favorites || [],
      targets: {
        ...DEFAULT_TARGETS,
        ...(parsed.targets || {})
      },
      profile: {
        ...DEFAULT_PROFILE,
        ...(parsed.profile || {})
      },
      logs: migratedLogs
    };
  } catch (e) {
    console.error("Failed to load state", e);
    return {
      profile: DEFAULT_PROFILE,
      targets: DEFAULT_TARGETS,
      favorites: [],
      logs: {},
    };
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const getTodayKey = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const exportData = (state: AppState) => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bio-link-export-${getTodayKey()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};