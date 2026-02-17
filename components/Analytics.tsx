import React, { useEffect, useState } from 'react';
import { AppState, DailyLog } from '../types';
import { generateDailyInsight } from '../services/gemini';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, CalendarDays, BrainCircuit, Sparkles, Scale } from 'lucide-react';

interface AnalyticsProps {
  logs: Record<string, DailyLog>;
  targets: { calories: number }; // TDEE
}

export const Analytics: React.FC<AnalyticsProps> = ({ logs, targets }) => {
  const [insight, setInsight] = useState<string>("Analyzing bio-patterns...");

  // Process last 14 days
  const sortedDates = Object.keys(logs).sort();
  const recentLogs = sortedDates.slice(-7).map(d => logs[d]);

  const data = sortedDates.slice(-14).map(date => {
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
      target: targets.calories,
      weight: log.weight_kg // Extract weight
    };
  });

  // Data for weight chart (only points with recorded weight)
  const weightData = data.filter(d => d.weight !== undefined && d.weight > 0);

  useEffect(() => {
    const fetchInsight = async () => {
        if (recentLogs.length > 0) {
            const text = await generateDailyInsight(recentLogs);
            setInsight(text);
        } else {
            setInsight("Insufficient data for pattern recognition.");
        }
    };
    fetchInsight();
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-gray-900 to-black border border-cyber-primary/30 p-6 rounded-lg relative overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.05)]">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit className="w-24 h-24 text-cyber-primary" />
        </div>
        <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyber-primary animate-pulse" />
            <h3 className="font-mono text-xs text-cyber-primary tracking-widest uppercase">AI BIO-INSIGHT</h3>
        </div>
        <p className="font-sans text-lg text-gray-200 italic leading-relaxed">
            "{insight}"
        </p>
      </div>

      {/* Chart 1: Weight Trend */}
      {weightData.length > 1 && (
        <div className="bg-cyber-panel border border-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
                <Scale className="w-5 h-5 text-pink-500" />
                <h3 className="font-sans font-bold text-lg text-white">EVOLUÇÃO DE PESO</h3>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                         <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
                        <YAxis 
                            domain={['dataMin - 2', 'dataMax + 2']} 
                            tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#050505', borderColor: '#333', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#ff003c" 
                            strokeWidth={2}
                            dot={{ fill: '#ff003c', r: 3 }}
                            activeDot={{ r: 6, fill: '#fff' }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* Chart 2: Deficit/Surplus */}
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
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

       {/* Chart 3: Deficit visualization */}
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
      </div>

    </div>
  );
};