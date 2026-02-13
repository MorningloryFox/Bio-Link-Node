import { GoogleGenAI, Type } from "@google/genai";
import { Nutrients } from "../types";

// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are an advanced Bio-Nutritional Analysis AI. 
Your task is to analyze user input which can be FOOD consumption or PHYSICAL EXERCISE.
1. If it is FOOD: Estimate nutritional content precisely.
2. If it is EXERCISE: Estimate calories burned based on intensity and duration.
3. If it is BOTH: Separate them (though the schema below handles one primary intent, try to detect the dominant one or split).
Return ONLY a JSON object. No markdown.
`;

export interface AnalysisResult {
    type: 'food' | 'exercise' | 'unknown';
    food_data?: Nutrients;
    exercise_data?: {
        name: string;
        calories_burned: number;
        duration_minutes: number;
    };
}

export const analyzeInput = async (text: string): Promise<AnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this input: "${text}"`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, enum: ['food', 'exercise', 'unknown'] },
                food_data: {
                    type: Type.OBJECT,
                    properties: {
                        calories: { type: Type.NUMBER },
                        protein_g: { type: Type.NUMBER },
                        carbs_g: { type: Type.NUMBER },
                        fat_g: { type: Type.NUMBER },
                        fiber_g: { type: Type.NUMBER },
                        sodium_mg: { type: Type.NUMBER },
                        potassium_mg: { type: Type.NUMBER }
                    }
                },
                exercise_data: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        calories_burned: { type: Type.NUMBER },
                        duration_minutes: { type: Type.NUMBER }
                    }
                }
            }
        }
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};