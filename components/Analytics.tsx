import React from 'react';
import { AppState, DailyLog } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend, Cell } from 'recharts';
import { TrendingUp, CalendarDays } from 'lucide-react';

interface AnalyticsProps {
  logs: Record<string, DailyLog>;
  targets: { calories: number }; // TDEE
}

export const Analytics: React.FC<AnalyticsProps> = ({ logs, targets }) => {
  // Process last 14 days
  const data = Object.keys(logs).sort().slice(-14).map(date => {
    const log = logs[date];
    const foodCals = log.entries.reduce((sum, e) => sum + e.nutrients.calories, 0);
    const exerciseCals = (log.exercises || []).reduce((sum, e) => sum + e.calories_burned, 0);
    const net = foodCals - exerciseCals;
    const balance = net - targets.calories;

    return {
      date: date.slice(5), // MM-DD
      food: Math.round(foodCals),
      burn: Math.round(exerciseCals),
      net: Math.round(net),
      balance: Math.round(balance),
      target: targets.calories
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Chart 1: Deficit/Surplus */}
      <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyber-primary" />
            <h3 className="font-sans font-bold text-lg text-white">BALANÇO CALÓRICO (LÍQUIDO)</h3>
        </div>

        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                    <YAxis tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', borderColor: '#333', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                    <ReferenceLine y={targets.calories} stroke="#00f0ff" strokeDasharray="3 3" label={{ position: 'right',  value: 'TDEE', fill: '#00f0ff', fontSize: 10 }} />
                    <Bar dataKey="net" fill="#333" radius={[2, 2, 0, 0]} name="Líquido (Net)" />
                    {/* Overlay bars for visual effect */}
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="text-center text-[10px] text-gray-500 font-mono mt-2">
            LINHA AZUL = TDEE (Gasto Total Diário)
        </div>
      </div>

       {/* Chart 2: Deficit visualization */}
       <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-cyber-secondary" />
            <h3 className="font-sans font-bold text-lg text-white">VARIAÇÃO DIÁRIA (+/-)</h3>
        </div>

        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                    <YAxis tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#050505', borderColor: '#333', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                    <ReferenceLine y={0} stroke="#666" />
                    <Bar dataKey="balance" radius={[2, 2, 0, 0]} name="Saldo">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.balance > 0 ? '#ff003c' : '#00f0ff'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-[10px] font-mono mt-2">
            <span className="text-cyber-secondary">■ SUPERÁVIT (Ganho de Peso)</span>
            <span className="text-cyber-primary">■ DÉFICIT (Perda de Peso)</span>
        </div>
      </div>

    </div>
  );
};