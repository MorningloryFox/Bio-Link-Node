import React from 'react';
import { DailyLog, UserTargets, UserProfile } from '../types';
import { Droplet, Activity, Flame, Layers, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardProps {
  log: DailyLog;
  targets: UserTargets;
  profile: UserProfile;
  onAddWater: (amount: number) => void;
}

const ProgressBar: React.FC<{ 
  label: string; 
  current: number; 
  target: number; 
  unit: string;
  variant?: 'limit' | 'target'; // 'limit' turns red when full, 'target' turns green
}> = ({ label, current, target, unit, variant = 'limit' }) => {
  const rawPercentage = (current / target) * 100;
  const percentage = Math.min(100, Math.max(0, rawPercentage));
  
  let color = '#00f0ff'; // Default Cyan

  if (variant === 'limit') {
      // Logic for things you shouldn't exceed (Fat, Carbs in cut)
      if (percentage >= 100) color = '#ff003c'; // Red (Limit Reached)
      else if (percentage > 85) color = '#fcee0a'; // Yellow (Warning)
      else color = '#00f0ff'; // Cyan (Safe)
  } else {
      // Logic for things you want to reach (Protein)
      if (percentage >= 100) color = '#39ff14'; // Neon Green (Success)
      else if (percentage > 50) color = '#00f0ff'; // Cyan (On track)
      else color = '#00f0ff';
  }

  return (
    <div className="mb-4 group">
      <div className="flex justify-between text-xs font-mono mb-1 text-gray-400">
        <span className="group-hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
            {label}
            {percentage >= 100 && <span className="text-[8px] px-1 rounded bg-gray-800 text-white border border-gray-600">COMPLETED</span>}
        </span>
        <span>
          <span className="text-white font-bold">{Math.round(current)}</span>
          <span className="text-gray-600">/</span>
          {target}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-900 rounded-sm overflow-hidden border border-gray-800 relative">
        <div
          className={`h-full transition-all duration-500 ease-out shadow-[0_0_10px_currentColor]`}
          style={{ width: `${percentage}%`, backgroundColor: color, color: color }}
        ></div>
         {/* Grid lines overlay for tech look */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ log, targets, profile, onAddWater }) => {
  // Aggregate Food data
  const totals = log.entries.reduce((acc, entry) => {
    return {
      calories: acc.calories + (entry.nutrients.calories || 0),
      protein: acc.protein + (entry.nutrients.protein_g || 0),
      carbs: acc.carbs + (entry.nutrients.carbs_g || 0),
      fat: acc.fat + (entry.nutrients.fat_g || 0),
      fiber: acc.fiber + (entry.nutrients.fiber_g || 0),
      sodium: acc.sodium + (entry.nutrients.sodium_mg || 0),
      potassium: acc.potassium + (entry.nutrients.potassium_mg || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, potassium: 0 });

  // Aggregate Exercise data
  const burnedCalories = (log.exercises || []).reduce((acc, ex) => acc + ex.calories_burned, 0);

  // Net Calculations
  const tdee = targets.calories; 
  const netCalories = totals.calories - burnedCalories;
  const balance = netCalories - tdee;
  const balanceColor = balance > 0 ? '#ff003c' : '#00f0ff'; // Red for surplus, Cyan for deficit

  // Data for chart
  const macroData = [
    { name: 'Prot', current: totals.protein, target: targets.protein_g, fill: '#00f0ff' },
    { name: 'Carb', current: totals.carbs, target: targets.carbs_g, fill: '#fcee0a' },
    { name: 'Gord', current: totals.fat, target: targets.fat_g, fill: '#ff003c' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calorie Card */}
        <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Activity className="w-6 h-6 text-cyber-primary" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Net Calories</div>
          <div className="text-xl font-sans font-bold text-white mt-1">
            {Math.round(netCalories)}
            <span className="text-sm text-gray-500 font-mono ml-1">/ {tdee}</span>
          </div>
          
          {/* Explicit Calculation Breakdown */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-2 border-t border-gray-800 pt-2">
            <span className="text-gray-400">{Math.round(totals.calories)} In</span>
            <span className="text-gray-600">-</span>
            <span className="text-orange-400">{Math.round(burnedCalories)} Out</span>
          </div>

          <div className="text-[10px] mt-1 font-mono" style={{ color: balanceColor }}>
             {balance > 0 ? '+' : ''}{Math.round(balance)} kcal ({balance > 0 ? 'Surplus' : 'Deficit'})
          </div>
        </div>
        
        {/* Exercise Card */}
        <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Exercício</div>
          <div className="text-xl font-sans font-bold text-orange-400 mt-1">
            {Math.round(burnedCalories)}
            <span className="text-sm text-gray-500 font-mono ml-1">kcal</span>
          </div>
           <div className="text-[10px] text-gray-500 mt-2 font-mono">
               {(log.exercises || []).length} sessões
           </div>
        </div>

        {/* Water Card */}
        <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
            <Droplet className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Hidratação</div>
          <div className="text-xl font-sans font-bold text-blue-400 mt-1">
            {(log.water_ml / 1000).toFixed(1)}L
            <span className="text-sm text-gray-500 font-mono ml-1">/ {(targets.water_ml / 1000).toFixed(1)}L</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 font-mono">
              Use o botão + para adicionar
          </div>
        </div>

        {/* Bio-Status Monitor (Micros) */}
        <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                <HeartPulse className="w-4 h-4 text-purple-500 animate-pulse" />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">BIO-STATUS</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center group">
                    <div className="text-[10px] text-gray-500 group-hover:text-purple-300 transition-colors">Fibra</div>
                    <div className="h-1 w-16 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (totals.fiber/targets.fiber_g)*100)}%` }}></div>
                    </div>
                    <div className="text-[10px] font-mono text-purple-200 w-8 text-right">{Math.round(totals.fiber)}g</div>
                </div>
                <div className="flex justify-between items-center group">
                    <div className="text-[10px] text-gray-500 group-hover:text-purple-300 transition-colors">Sódio</div>
                    <div className="h-1 w-16 bg-gray-800 rounded overflow-hidden">
                        <div className={`h-full ${totals.sodium > targets.sodium_mg ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(100, (totals.sodium/targets.sodium_mg)*100)}%` }}></div>
                    </div>
                     <div className="text-[10px] font-mono text-purple-200 w-8 text-right">{(totals.sodium/1000).toFixed(1)}g</div>
                </div>
                 <div className="flex justify-between items-center group">
                    <div className="text-[10px] text-gray-500 group-hover:text-purple-300 transition-colors">Potás</div>
                     <div className="h-1 w-16 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (totals.potassium/targets.potassium_mg)*100)}%` }}></div>
                    </div>
                    <div className="text-[10px] font-mono text-purple-200 w-8 text-right">{(totals.potassium/1000).toFixed(1)}g</div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Macros Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Bars */}
        <div className="lg:col-span-2 bg-cyber-panel border border-gray-800 p-6 rounded-lg relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary to-transparent opacity-50"></div>
            <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-cyber-primary" />
                <h3 className="text-lg font-sans font-bold text-white tracking-wide">MACRONUTRIENTES</h3>
            </div>
            
            <ProgressBar label="Proteína" current={totals.protein} target={targets.protein_g} unit="g" variant="target" />
            <ProgressBar label="Carboidratos" current={totals.carbs} target={targets.carbs_g} unit="g" variant="limit" />
            <ProgressBar label="Gorduras" current={totals.fat} target={targets.fat_g} unit="g" variant="limit" />
            
             <div className="mt-6 pt-4 border-t border-gray-800 text-xs font-mono text-gray-500 flex justify-between">
                <span>STATUS: {balance > 0 ? 'SUPERÁVIT (+G)' : 'DÉFICIT (-G)'}</span>
                <span>EFFICIENCY: {Math.min(100, Math.round((totals.protein / targets.protein_g) * 100))}%</span>
             </div>
        </div>

        {/* Mini Chart */}
        <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg flex flex-col items-center justify-center">
           <div className="w-full h-48">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={macroData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                 <XAxis dataKey="name" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                 <YAxis tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                 <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#050505', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ fontFamily: 'monospace' }}
                 />
                 <Bar dataKey="current" radius={[4, 4, 0, 0]}>
                    {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="text-xs text-gray-500 font-mono mt-2">DISTRIBUIÇÃO MACRO</div>
        </div>
      </div>
    </div>
  );
};