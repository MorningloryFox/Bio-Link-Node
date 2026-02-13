import { UserProfile, UserTargets } from '../types';

export const calculateTargets = (profile: UserProfile): UserTargets => {
  // 1. Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor
  let bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age);
  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // 2. Calculate TDEE (Total Daily Energy Expenditure)
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = Math.round(bmr * activityMultipliers[profile.activityLevel]);

  // 3. Macronutrient Split Strategy (Performance/Hypertrophy Focus)
  // Protein: 2.0g per kg of body weight (Standard for active individuals)
  const protein_g = Math.round(profile.weight_kg * 2.0);
  
  // Fat: 0.9g per kg of body weight (Healthy baseline)
  const fat_g = Math.round(profile.weight_kg * 0.9);

  // Carbs: Remaining calories
  // 1g Protein = 4kcal, 1g Fat = 9kcal, 1g Carb = 4kcal
  const consumedCalories = (protein_g * 4) + (fat_g * 9);
  const remainingCalories = Math.max(0, tdee - consumedCalories);
  const carbs_g = Math.round(remainingCalories / 4);

  // 4. Hydration (Specific Rule: 35ml per kg)
  const water_ml = Math.round(profile.weight_kg * 35);

  // 5. Micronutrients (General Guidelines)
  // Fiber: 14g per 1000kcal
  const fiber_g = Math.round((tdee / 1000) * 14);
  
  // Sodium: Standard recommendation ~2300mg
  const sodium_mg = 2300;
  
  // Potassium: WHO recommendation ~3510mg
  const potassium_mg = 3500;

  return {
    calories: tdee,
    protein_g,
    fat_g,
    carbs_g,
    water_ml,
    fiber_g,
    sodium_mg,
    potassium_mg
  };
};