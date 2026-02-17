import React, { useState, useRef } from 'react';
import { analyzeInput, analyzeImageInput } from '../services/gemini';
import { FoodEntry, ExerciseEntry } from '../types';
import { Send, Loader2, AlertCircle, Dumbbell, Utensils, Camera, Scan } from 'lucide-react';

interface ChatLoggerProps {
  onAddEntry: (entry: FoodEntry) => void;
  onAddExercise: (entry: ExerciseEntry) => void;
}

export const ChatLogger: React.FC<ChatLoggerProps> = ({ onAddEntry, onAddExercise }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processResult = (result: any) => {
    if (result) {
        if (result.type === 'food' && result.food_data) {
            const newEntry: FoodEntry = {
              id: crypto.randomUUID(),
              type: 'food',
              name: input || 'Food Scan',
              category: result.category || 'snack',
              timestamp: Date.now(),
              nutrients: result.food_data,
            };
            onAddEntry(newEntry);
            setInput('');
        } else if (result.type === 'exercise' && result.exercise_data) {
            const newEntry: ExerciseEntry = {
                id: crypto.randomUUID(),
                type: 'exercise',
                name: result.exercise_data.name || input || 'Workout',
                timestamp: Date.now(),
                calories_burned: result.exercise_data.calories_burned,
                duration_minutes: result.exercise_data.duration_minutes
            };
            onAddExercise(newEntry);
            setInput('');
        } else {
             setError("Não entendi. Tente especificar se é comida ou treino.");
        }
    } else {
        setError("Falha na análise. Tente novamente.");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeInput(input);
      processResult(result);
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = (reader.result as string).split(',')[1];
              setLoading(true);
              setError(null);
              setInput("Analisando imagem...");
              try {
                  const result = await analyzeImageInput(base64);
                  processResult(result);
              } catch (err) {
                  setError("Erro ao analisar imagem.");
              } finally {
                  setLoading(false);
                  setInput("");
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-cyber-panel border border-gray-800 rounded-lg p-4 shadow-lg mb-6 relative overflow-hidden">
       {/* Scanner Effect Overlay */}
       {loading && (
        <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center">
            <div className="relative w-full h-1 bg-cyber-primary/50 shadow-[0_0_15px_#00f0ff] animate-[scan_2s_ease-in-out_infinite] top-[-50%]"></div>
            <Scan className="w-12 h-12 text-cyber-primary animate-pulse mb-2" />
            <span className="text-cyber-primary font-mono text-xs tracking-widest animate-pulse">ANALYZING BIOMETRICS...</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-cyber-primary font-sans font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse"></span>
            INPUT DE DADOS
        </h3>
        <div className="flex gap-2 text-[10px] text-gray-500 font-mono">
            <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> FOOD</span>
            <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> EXERCISE</span>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          className="w-full bg-black/50 border border-gray-700 rounded-md p-3 text-gray-300 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all resize-none font-mono text-sm pr-20"
          rows={3}
          placeholder="Ex: 'Comi 2 ovos' ou 'Corri 5km'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        
        <div className="absolute bottom-3 right-3 flex gap-2">
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleCameraCapture}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors border border-gray-600"
            >
                <Camera className="w-5 h-5" />
            </button>
            <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 bg-cyber-primary/20 hover:bg-cyber-primary/40 text-cyber-primary rounded-md transition-colors disabled:opacity-50 border border-cyber-primary/50"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-cyber-secondary text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};