import { AppState, DEFAULT_PROFILE, DEFAULT_TARGETS, DailyLog, FoodEntry } from '../types';

/*
  NOTA DE MIGRAÇÃO DE PERSISTÊNCIA:
  
  O sistema atual usa `localStorage`, que é simples mas volátil e limitado a um único navegador.
  Para uma aplicação de produção robusta, a persistência de dados deve ser movida para um serviço de backend.
  Abaixo estão exemplos de como você pode adaptar este arquivo para usar Vercel KV (Redis) ou Supabase (PostgreSQL).
  
  Estes exemplos assumem que você terá uma forma de autenticar o usuário para que os dados sejam salvos
  de forma segura e associados à conta correta. A lógica de `userId` é crucial.
*/

// --- Exemplo com Vercel KV (requer 'npm install @vercel/kv') ---
/*
import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.VITE_KV_REST_API_URL,
  token: process.env.VITE_KV_REST_API_TOKEN,
});

export const loadState = async (userId: string): Promise<AppState> => {
  try {
    const state = await kv.get(`user:${userId}`);
    if (!state) {
      // Retorna estado padrão se for um novo usuário
      return {
        profile: DEFAULT_PROFILE,
        targets: DEFAULT_TARGETS,
        favorites: [],
        logs: {},
      };
    }
    // Aqui você pode adicionar lógica de migração se o formato dos dados mudar
    return state as AppState;
  } catch (e) {
    console.error("Failed to load state from Vercel KV", e);
    // Retornar um estado de emergência para não quebrar o app
    return { profile: DEFAULT_PROFILE, targets: DEFAULT_TARGETS, favorites: [], logs: {} };
  }
};

export const saveState = async (userId: string, state: AppState) => {
  try {
    await kv.set(`user:${userId}`, state);
  } catch (e) {
    console.error("Failed to save state to Vercel KV", e);
  }
};
*/


// --- Exemplo com Supabase (requer 'npm install @supabase/supabase-js') ---
/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Em um cenário real, os dados seriam normalizados em tabelas (profiles, targets, logs, etc.)
// Para uma migração rápida, podemos continuar salvando o objeto AppState inteiro em uma única tabela.

// Exemplo de tabela 'user_data':
// columns: user_id (text, primary key), app_state (jsonb)

export const loadState = async (): Promise<AppState> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: DEFAULT_PROFILE, targets: DEFAULT_TARGETS, favorites: [], logs: {} };

  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('app_state')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: 'single' did not find a row
      throw error;
    }
    
    if (!data) {
      return { profile: DEFAULT_PROFILE, targets: DEFAULT_TARGETS, favorites: [], logs: {} };
    }

    return data.app_state as AppState;
  } catch (e) {
    console.error("Failed to load state from Supabase", e);
    return { profile: DEFAULT_PROFILE, targets: DEFAULT_TARGETS, favorites: [], logs: {} };
  }
};

export const saveState = async (state: AppState) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({ user_id: user.id, app_state: state });

    if (error) throw error;
  } catch (e) {
    console.error("Failed to save state to Supabase", e);
  }
};
*/


// --- Implementação original com localStorage (mantida para referência) ---

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