import React from 'react';
import { DailyLog, FoodEntry, ExerciseEntry, AppState, FavoriteEntry } from '../types';
import { exportData } from '../services/storage';
import { Download, Trash2, Calendar, Utensils, Dumbbell, Coffee, Sun, Moon, Apple, Heart, Plus } from 'lucide-react';

interface HistoryProps {
  logs: Record<string, DailyLog>;
  currentDate: string;
  favorites: FavoriteEntry[];
  onDeleteEntry: (entryId: string) => void;
  onAddFavorite: (entry: FoodEntry) => void;
  onUseFavorite: (fav: FavoriteEntry) => void;
  fullState: AppState;
}

export const History: React.FC<HistoryProps> = ({ logs, currentDate, favorites, onDeleteEntry, onAddFavorite, onUseFavorite, fullState }) => {
  const todayLog = logs[currentDate] || { entries: [], exercises: [] };
  
  // Grouping logic
  const grouped = {
      breakfast: todayLog.entries.filter(e => e.category === 'breakfast'),
      lunch: todayLog.entries.filter(e => e.category === 'lunch'),
      dinner: todayLog.entries.filter(e => e.category === 'dinner'),
      snack: todayLog.entries.filter(e => e.category === 'snack'),
      exercise: todayLog.exercises || []
  };

  const handleExport = () => {
    exportData(fullState);
  };

  const CategorySection = ({ title, icon: Icon, items, type }: any) => {
      if (items.length === 0) return null;
      return (
          <div className="mb-6">
              <h4 className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-gray-800 pb-1">
                  <Icon className="w-3 h-3" /> {title}
              </h4>
              <div className="space-y-2">
                  {items.map((item: any) => (
                      <div key={item.id} className={`border p-3 rounded flex justify-between items-start transition-colors group ${type === 'exercise' ? 'bg-orange-900/10 border-orange-900/30' : 'bg-black/40 border-gray-800'}`}>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="text-gray-300 font-medium text-sm">{item.name}</div>
                            </div>
                            
                            {type === 'exercise' ? (
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
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {type !== 'exercise' && (
                                <button onClick={() => onAddFavorite(item)} className="text-gray-600 hover:text-pink-500 transition-colors" title="Salvar Favorito">
                                    <Heart className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => onDeleteEntry(item.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6">
      
      {/* Favorites Quick Bar */}
      {favorites.length > 0 && (
          <div className="bg-cyber-panel border border-gray-800 p-3 rounded-lg overflow-x-auto">
              <h4 className="text-[10px] text-gray-500 font-mono mb-2 flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500" /> FAVORITOS</h4>
              <div className="flex gap-2">
                  {favorites.map(fav => (
                      <button 
                        key={fav.id} 
                        onClick={() => onUseFavorite(fav)}
                        className="flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-pink-500/50 rounded px-3 py-2 text-xs text-gray-300 whitespace-nowrap transition-colors"
                      >
                          {fav.name}
                          <Plus className="w-3 h-3 text-gray-500" />
                      </button>
                  ))}
              </div>
          </div>
      )}

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
            EXPORTAR
        </button>
      </div>

      <div className="space-y-2">
        {todayLog.entries.length === 0 && todayLog.exercises.length === 0 ? (
            <div className="text-center py-10 text-gray-600 font-mono text-sm border border-dashed border-gray-800 rounded">
                NENHUM DADO REGISTRADO HOJE.
            </div>
        ) : (
            <>
                <CategorySection title="CAFÉ DA MANHÃ" icon={Coffee} items={grouped.breakfast} type="food" />
                <CategorySection title="ALMOÇO" icon={Sun} items={grouped.lunch} type="food" />
                <CategorySection title="JANTAR" icon={Moon} items={grouped.dinner} type="food" />
                <CategorySection title="LANCHES" icon={Apple} items={grouped.snack} type="food" />
                <CategorySection title="ATIVIDADE FÍSICA" icon={Dumbbell} items={grouped.exercise} type="exercise" />
            </>
        )}
      </div>
    </div>
  );
};