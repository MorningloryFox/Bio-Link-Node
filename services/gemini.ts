import { GoogleGenAI, Type } from "@google/genai";
import { Nutrients } from "../types";

// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are an advanced Bio-Nutritional Analysis AI. 
Your task is to analyze user input which can be FOOD consumption or PHYSICAL EXERCISE.
1. If it is FOOD: Estimate nutritional content precisely and categorize it (breakfast, lunch, dinner, snack).
2. If it is EXERCISE: Estimate calories burned based on intensity and duration.
3. If it is BOTH: Separate them.
Return ONLY a JSON object. No markdown.
`;

export interface AnalysisResult {
    type: 'food' | 'exercise' | 'unknown';
    food_data?: Nutrients;
    category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    exercise_data?: {
        name: string;
        calories_burned: number;
        duration_minutes: number;
    };
}

const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['food', 'exercise', 'unknown'] },
        category: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
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
};

export const analyzeInput = async (text: string): Promise<AnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this input: "${text}"`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
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

export const analyzeImageInput = async (base64Image: string): Promise<AnalysisResult | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: "Analyze this image. If it is food, estimate nutrients and category. If exercise screenshot, estimate burn." }
                ]
            },
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as AnalysisResult;
        }
        return null;
    } catch (error) {
        console.error("Gemini Image Analysis Error:", error);
        return null;
    }
};

export const generateDailyInsight = async (recentLogs: any): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze these recent daily logs and provide a single, short, impactful 1-sentence bio-hack insight or warning for the user (e.g., about sodium, hydration, protein timing). Data: ${JSON.stringify(recentLogs)}`,
            config: {
                maxOutputTokens: 60,
            }
        });
        return response.text || "Status nominal. Keep logging to generate insights.";
    } catch (error) {
        return "System optimization in progress...";
    }
}