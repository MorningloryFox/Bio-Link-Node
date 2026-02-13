import React from 'react';
import { DailyLog, UserTargets, UserProfile } from '../types';
import { Droplet, Activity, Flame, Layers, Cpu, Dumbbell } from 'lucide-react';
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
  color: string; 
  unit: string 
}> = ({ label, current, target, color, unit }) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  
  return (
    <div className="mb-4 group">
      <div className="flex justify-between text-xs font-mono mb-1 text-gray-400">
        <span className="group-hover:text-white transition-colors uppercase tracking-widest">{label}</span>
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
          <div className="text-[10px] mt-2 font-mono" style={{ color: balanceColor }}>
             {balance > 0 ? '+' : ''}{Math.round(balance)} kcal ({balance > 0 ? 'Surplus' : 'Deficit'})
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
              Food: {Math.round(totals.calories)} | Burn: {Math.round(burnedCalories)}
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
               {(log.exercises || []).length} sessões hoje
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
          <div className="flex gap-2 mt-2">
            <button onClick={() => onAddWater(250)} className="bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 text-[10px] px-2 py-1 rounded border border-blue-900 transition-colors">
              +250ml
            </button>
            <button onClick={() => onAddWater(500)} className="bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 text-[10px] px-2 py-1 rounded border border-blue-900 transition-colors">
              +500ml
            </button>
          </div>
        </div>

        {/* Micros Summary */}
        <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Micros</span>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <div className="text-[10px] text-gray-500">Fibra</div>
                    <div className="text-[10px] font-bold font-mono text-purple-200">{totals.fiber.toFixed(0)}/{targets.fiber_g}g</div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-[10px] text-gray-500">Sódio</div>
                    <div className="text-[10px] font-bold font-mono text-purple-200">{totals.sodium.toFixed(0)}/{targets.sodium_mg}mg</div>
                </div>
                 <div className="flex justify-between items-center">
                    <div className="text-[10px] text-gray-500">Potás</div>
                    <div className="text-[10px] font-bold font-mono text-purple-200">{totals.potassium.toFixed(0)}/{targets.potassium_mg}mg</div>
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
            
            <ProgressBar label="Proteína" current={totals.protein} target={targets.protein_g} color="#00f0ff" unit="g" />
            <ProgressBar label="Carboidratos" current={totals.carbs} target={targets.carbs_g} color="#fcee0a" unit="g" />
            <ProgressBar label="Gorduras" current={totals.fat} target={targets.fat_g} color="#ff003c" unit="g" />
            
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