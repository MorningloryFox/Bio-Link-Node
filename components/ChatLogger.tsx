import React, { useState } from 'react';
import { analyzeInput } from '../services/gemini';
import { FoodEntry, ExerciseEntry } from '../types';
import { Send, Loader2, AlertCircle, Dumbbell, Utensils } from 'lucide-react';

interface ChatLoggerProps {
  onAddEntry: (entry: FoodEntry) => void;
  onAddExercise: (entry: ExerciseEntry) => void;
}

export const ChatLogger: React.FC<ChatLoggerProps> = ({ onAddEntry, onAddExercise }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeInput(input);
      
      if (result) {
        if (result.type === 'food' && result.food_data) {
            const newEntry: FoodEntry = {
              id: crypto.randomUUID(),
              type: 'food',
              name: input,
              timestamp: Date.now(),
              nutrients: result.food_data,
            };
            onAddEntry(newEntry);
            setInput('');
        } else if (result.type === 'exercise' && result.exercise_data) {
            const newEntry: ExerciseEntry = {
                id: crypto.randomUUID(),
                type: 'exercise',
                name: result.exercise_data.name || input,
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
        setError("Não foi possível analisar. Tente novamente.");
      }
    } catch (err) {
        console.error(err);
      setError("Erro de conexão com a IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-cyber-panel border border-gray-800 rounded-lg p-4 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-cyber-primary font-sans font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-cyber-primary rounded-full animate-pulse"></span>
            INPUT DE DADOS
        </h3>
        <div className="flex gap-2 text-[10px] text-gray-500 font-mono">
            <span className="flex items-center gap-1"><Utensils className="w-3 h-3" /> ALIMENTAÇÃO</span>
            <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> EXERCÍCIO</span>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          className="w-full bg-black/50 border border-gray-700 rounded-md p-3 text-gray-300 focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all resize-none font-mono text-sm"
          rows={3}
          placeholder="Ex: 'Comi 2 ovos e pão' OU 'Corri 5km em 30min'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="absolute bottom-3 right-3 p-2 bg-cyber-primary/20 hover:bg-cyber-primary/40 text-cyber-primary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-cyber-primary/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-cyber-secondary text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};