import React from 'react';
import { DailyLog, FoodEntry, ExerciseEntry, AppState } from '../types';
import { exportData } from '../services/storage';
import { Download, Trash2, Calendar, Utensils, Dumbbell } from 'lucide-react';

interface HistoryProps {
  logs: Record<string, DailyLog>;
  currentDate: string;
  onDeleteEntry: (entryId: string) => void;
  fullState: AppState;
}

export const History: React.FC<HistoryProps> = ({ logs, currentDate, onDeleteEntry, fullState }) => {
  const todayLog = logs[currentDate] || { entries: [], exercises: [] };
  
  // Combine and sort by timestamp
  const allItems = [
    ...todayLog.entries.map(e => ({ ...e, isExercise: false })),
    ...(todayLog.exercises || []).map(e => ({ ...e, isExercise: true }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const handleExport = () => {
    exportData(fullState);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-cyber-panel border border-gray-800 p-4 rounded-lg">
        <div>
            <h3 className="text-white font-sans font-bold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                REGISTRO DIÁRIO
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-1">{currentDate}</p>
        </div>
        <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-xs font-mono bg-gray-800 hover:bg-gray-700 text-cyber-primary px-3 py-2 rounded border border-gray-700 transition-colors"
        >
            <Download className="w-4 h-4" />
            EXPORTAR DADOS
        </button>
      </div>

      <div className="space-y-2">
        {allItems.length === 0 ? (
            <div className="text-center py-10 text-gray-600 font-mono text-sm border border-dashed border-gray-800 rounded">
                NENHUM DADO REGISTRADO HOJE.
            </div>
        ) : (
            allItems.map((item: any) => (
                <div key={item.id} className={`border p-3 rounded flex justify-between items-start transition-colors group ${item.isExercise ? 'bg-orange-900/10 border-orange-900/30' : 'bg-black/40 border-gray-800'}`}>
                    <div>
                        <div className="flex items-center gap-2">
                             {item.isExercise ? <Dumbbell className="w-3 h-3 text-orange-500" /> : <Utensils className="w-3 h-3 text-cyber-primary" />}
                             <div className="text-gray-300 font-medium text-sm">{item.name}</div>
                        </div>
                        
                        {item.isExercise ? (
                             <div className="text-[10px] text-orange-400 font-mono mt-1">
                                -{item.calories_burned} kcal {item.duration_minutes ? `| ${item.duration_minutes} min` : ''}
                             </div>
                        ) : (
                            <div className="text-[10px] text-gray-500 font-mono mt-1 flex gap-2">
                                <span className="text-cyber-primary">{item.nutrients.protein_g}p</span>
                                <span className="text-yellow-400">{item.nutrients.carbs_g}c</span>
                                <span className="text-red-500">{item.nutrients.fat_g}g</span>
                                <span className="text-gray-400">{item.nutrients.calories}kcal</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => onDeleteEntry(item.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};