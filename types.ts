export interface Nutrients {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  potassium_mg: number;
}

export interface FoodEntry {
  id: string;
  type: 'food';
  name: string; 
  timestamp: number;
  nutrients: Nutrients;
}

export interface ExerciseEntry {
  id: string;
  type: 'exercise';
  name: string;
  timestamp: number;
  calories_burned: number;
  duration_minutes?: number;
}

export interface UserTargets {
  calories: number; // Calculated or manual
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
  // Micronutrients
  fiber_g: number;
  sodium_mg: number;
  potassium_mg: number;
}

export interface UserProfile {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  manualTargets: boolean; // If true, ignore TMB calc for calories/macros
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: FoodEntry[];
  exercises: ExerciseEntry[]; // New field
  water_ml: number;
  weight_kg?: number; // Optional daily weigh-in
}

export interface AppState {
  profile: UserProfile;
  targets: UserTargets;
  logs: Record<string, DailyLog>; // Keyed by YYYY-MM-DD
}

export const DEFAULT_TARGETS: UserTargets = {
  calories: 2000,
  protein_g: 160,
  carbs_g: 220,
  fat_g: 70,
  water_ml: 3500,
  fiber_g: 30,
  sodium_mg: 2300,
  potassium_mg: 3500,
};

export const DEFAULT_PROFILE: UserProfile = {
  weight_kg: 70,
  height_cm: 175,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  manualTargets: false,
};