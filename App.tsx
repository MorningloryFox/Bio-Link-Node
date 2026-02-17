import React, { useState, useEffect } from 'react';
import { loadState, saveState, getTodayKey } from './services/storage';
import { AppState, DailyLog, FoodEntry, ExerciseEntry, UserProfile, UserTargets, FavoriteEntry } from './types';
import { ChatLogger } from './components/ChatLogger';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { Analytics } from './components/Analytics';
import { LayoutDashboard, Settings as SettingsIcon, History as HistoryIcon, Terminal, BarChart2, Droplet } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history' | 'settings'>('dashboard');
  const todayKey = getTodayKey();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const getCurrentLog = (): DailyLog => {
    return state.logs[todayKey] || { date: todayKey, entries: [], exercises: [], water_ml: 0 };
  };

  const handleAddEntry = (entry: FoodEntry) => {
    setState(prev => {
      const currentLog = prev.logs[todayKey] || { date: todayKey, entries: [], exercises: [], water_ml: 0 };
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [todayKey]: {
            ...currentLog,
            entries: [...currentLog.entries, entry]
          }
        }
      };
    });
  };

  const handleAddExercise = (entry: ExerciseEntry) => {
    setState(prev => {
      const currentLog = prev.logs[todayKey] || { date: todayKey, entries: [], exercises: [], water_ml: 0 };
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [todayKey]: {
            ...currentLog,
            exercises: [...(currentLog.exercises || []), entry]
          }
        }
      };
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setState(prev => {
      const currentLog = prev.logs[todayKey];
      if (!currentLog) return prev;
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [todayKey]: {
            ...currentLog,
            entries: currentLog.entries.filter(e => e.id !== entryId),
            exercises: (currentLog.exercises || []).filter(e => e.id !== entryId)
          }
        }
      };
    });
  };

  const handleAddWater = (amount: number) => {
    setState(prev => {
      const currentLog = prev.logs[todayKey] || { date: todayKey, entries: [], exercises: [], water_ml: 0 };
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [todayKey]: {
            ...currentLog,
            water_ml: currentLog.water_ml + amount
          }
        }
      };
    });
  };

  const handleAddFavorite = (entry: FoodEntry) => {
      const newFav: FavoriteEntry = {
          id: crypto.randomUUID(),
          name: entry.name,
          nutrients: entry.nutrients
      };
      setState(prev => ({
          ...prev,
          favorites: [...prev.favorites, newFav]
      }));
  };

  const handleUseFavorite = (fav: FavoriteEntry) => {
      const newEntry: FoodEntry = {
          id: crypto.randomUUID(),
          type: 'food',
          name: fav.name,
          category: 'snack', // Default, user can maybe change logic later
          timestamp: Date.now(),
          nutrients: fav.nutrients
      };
      handleAddEntry(newEntry);
  };

  const handleSaveSettings = (newProfile: UserProfile, newTargets: UserTargets) => {
    setState(prev => {
        // Sync the weight to today's daily log
        const currentLog = prev.logs[todayKey] || { date: todayKey, entries: [], exercises: [], water_ml: 0 };
        const updatedLog = {
            ...currentLog,
            weight_kg: newProfile.weight_kg
        };

        return {
            ...prev,
            profile: newProfile,
            targets: newTargets,
            logs: {
                ...prev.logs,
                [todayKey]: updatedLog
            }
        };
    });
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    const currentLog = getCurrentLog();
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <ChatLogger onAddEntry={handleAddEntry} onAddExercise={handleAddExercise} />
            <Dashboard 
              log={currentLog} 
              targets={state.targets} 
              profile={state.profile}
              onAddWater={handleAddWater} 
            />
          </>
        );
      case 'analytics':
        return (
            <Analytics logs={state.logs} targets={state.targets} />
        );
      case 'history':
        return (
          <History 
            logs={state.logs} 
            currentDate={todayKey} 
            favorites={state.favorites}
            onDeleteEntry={handleDeleteEntry}
            onAddFavorite={handleAddFavorite}
            onUseFavorite={handleUseFavorite}
            fullState={state}
          />
        );
      case 'settings':
        return (
          <Settings 
            profile={state.profile} 
            targets={state.targets} 
            onSave={handleSaveSettings} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-gray-200 font-sans pb-20 md:pb-0">
      
      {/* Header */}
      <header className="fixed top-0 w-full bg-cyber-dark/90 backdrop-blur-md border-b border-gray-800 z-50 h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 text-cyber-primary">
          <Terminal className="w-6 h-6" />
          <h1 className="font-bold text-xl tracking-tighter">BIO-LINK<span className="text-white">.NODE</span></h1>
        </div>
        <div className="text-xs font-mono text-gray-500 hidden md:block">
            STATUS: ONLINE | SYSTEM: OPTIMAL
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl pt-24 px-4 pb-24">
        {renderContent()}
      </main>

      {/* Quick Water FAB */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40">
        <button 
            onClick={() => handleAddWater(250)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center text-white transition-all active:scale-95 group"
            title="+250ml Water"
        >
            <Droplet className="w-6 h-6 fill-current" />
            <span className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                +250ml
            </span>
        </button>
      </div>

      {/* Mobile Navigation (Sticky Bottom) */}
      <nav className="fixed bottom-0 w-full bg-cyber-dark border-t border-gray-800 z-50 md:hidden">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'dashboard' ? 'text-cyber-primary' : 'text-gray-500'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Dash</span>
          </button>
          
           <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'analytics' ? 'text-cyber-primary' : 'text-gray-500'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Stats</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'history' ? 'text-cyber-primary' : 'text-gray-500'}`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Log</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'settings' ? 'text-cyber-primary' : 'text-gray-500'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Config</span>
          </button>
        </div>
      </nav>

       {/* Desktop Navigation (Top Right absolute) */}
       <div className="hidden md:flex fixed top-0 right-8 h-16 items-center gap-6 z-50">
           <button 
            onClick={() => setActiveTab('dashboard')}
            className={`text-sm font-mono hover:text-cyber-primary transition-colors ${activeTab === 'dashboard' ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-gray-400'}`}
          >
            DASHBOARD
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`text-sm font-mono hover:text-cyber-primary transition-colors ${activeTab === 'analytics' ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-gray-400'}`}
          >
            ANALYTICS
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`text-sm font-mono hover:text-cyber-primary transition-colors ${activeTab === 'history' ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-gray-400'}`}
          >
            HISTORY
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`text-sm font-mono hover:text-cyber-primary transition-colors ${activeTab === 'settings' ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-gray-400'}`}
          >
            SYSTEM
          </button>
       </div>

    </div>
  );
};

export default App;