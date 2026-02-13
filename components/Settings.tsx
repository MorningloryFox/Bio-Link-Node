import React, { useState, useEffect } from 'react';
import { UserProfile, UserTargets } from '../types';
import { calculateTargets } from '../services/calculator';
import { Save, User, Target, Calculator, RefreshCw } from 'lucide-react';

interface SettingsProps {
  profile: UserProfile;
  targets: UserTargets;
  onSave: (p: UserProfile, t: UserTargets) => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, targets, onSave }) => {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [localTargets, setLocalTargets] = useState<UserTargets>(targets);

  useEffect(() => {
    setLocalProfile(profile);
    setLocalTargets(targets);
  }, [profile, targets]);

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetChange = (field: keyof UserTargets, value: number) => {
    setLocalTargets(prev => ({ ...prev, [field]: value }));
  };

  const handleRecalculate = () => {
    const newTargets = calculateTargets(localProfile);
    setLocalTargets(newTargets);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localProfile, localTargets);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-cyber-panel border border-gray-800 rounded-lg p-6 space-y-8">
      
      {/* Bio-Data Section */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2 text-cyber-primary">
                <User className="w-5 h-5" />
                <h3 className="font-sans font-bold text-lg">DADOS BIOMÉTRICOS</h3>
            </div>
            <button 
                type="button"
                onClick={handleRecalculate}
                className="flex items-center gap-1 text-[10px] bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/50 hover:bg-cyber-primary/20 px-2 py-1 rounded transition-colors font-mono uppercase"
            >
                <Calculator className="w-3 h-3" />
                Auto-Calc Protocolo
            </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono">PESO (KG)</label>
                <input 
                    type="number" 
                    value={localProfile.weight_kg} 
                    onChange={(e) => handleProfileChange('weight_kg', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono">ALTURA (CM)</label>
                <input 
                    type="number" 
                    value={localProfile.height_cm} 
                    onChange={(e) => handleProfileChange('height_cm', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono">IDADE</label>
                <input 
                    type="number" 
                    value={localProfile.age} 
                    onChange={(e) => handleProfileChange('age', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none"
                />
            </div>
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono">GÊNERO</label>
                <select 
                    value={localProfile.gender} 
                    onChange={(e) => handleProfileChange('gender', e.target.value)}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none"
                >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                </select>
            </div>
             <div className="flex flex-col md:col-span-2">
                <label className="text-xs text-gray-500 mb-1 font-mono">NÍVEL DE ATIVIDADE</label>
                <select 
                    value={localProfile.activityLevel} 
                    onChange={(e) => handleProfileChange('activityLevel', e.target.value)}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-primary focus:outline-none"
                >
                    <option value="sedentary">Sedentário (Pouco ou nenhum exercício)</option>
                    <option value="light">Leve (Exercício 1-3 dias/semana)</option>
                    <option value="moderate">Moderado (Exercício 3-5 dias/semana)</option>
                    <option value="active">Ativo (Exercício 6-7 dias/semana)</option>
                    <option value="very_active">Muito Ativo (Exercício pesado diário)</option>
                </select>
            </div>
        </div>
      </div>

      {/* Targets Section */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2 text-cyber-secondary">
                <Target className="w-5 h-5" />
                <h3 className="font-sans font-bold text-lg">METAS (PROTOCOLO)</h3>
            </div>
            <div className="text-[10px] text-gray-500 font-mono text-right">
                TDEE ESTIMADO: {localTargets.calories} kcal
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono text-cyber-primary">PROTEÍNA (g)</label>
                <input 
                    type="number" 
                    value={localTargets.protein_g} 
                    onChange={(e) => handleTargetChange('protein_g', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-secondary focus:outline-none"
                />
            </div>
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono text-yellow-400">CARBOIDRATO (g)</label>
                <input 
                    type="number" 
                    value={localTargets.carbs_g} 
                    onChange={(e) => handleTargetChange('carbs_g', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-secondary focus:outline-none"
                />
            </div>
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono text-red-500">GORDURA (g)</label>
                <input 
                    type="number" 
                    value={localTargets.fat_g} 
                    onChange={(e) => handleTargetChange('fat_g', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-secondary focus:outline-none"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono text-blue-400">ÁGUA (ml)</label>
                <input 
                    type="number" 
                    value={localTargets.water_ml} 
                    onChange={(e) => handleTargetChange('water_ml', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-white focus:border-cyber-secondary focus:outline-none"
                />
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono">FIBRAS (g)</label>
                <input 
                    type="number" 
                    value={localTargets.fiber_g} 
                    onChange={(e) => handleTargetChange('fiber_g', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-gray-300 focus:border-gray-500 focus:outline-none text-sm"
                />
            </div>
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono">SÓDIO (mg)</label>
                <input 
                    type="number" 
                    value={localTargets.sodium_mg} 
                    onChange={(e) => handleTargetChange('sodium_mg', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-gray-300 focus:border-gray-500 focus:outline-none text-sm"
                />
            </div>
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 font-mono">POTÁSSIO (mg)</label>
                <input 
                    type="number" 
                    value={localTargets.potassium_mg} 
                    onChange={(e) => handleTargetChange('potassium_mg', parseFloat(e.target.value))}
                    className="bg-black border border-gray-700 rounded p-2 text-gray-300 focus:border-gray-500 focus:outline-none text-sm"
                />
            </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-cyber-primary hover:bg-cyan-400 text-black font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 font-sans tracking-widest uppercase shadow-[0_0_10px_theme('colors.cyber.dim')] hover:shadow-[0_0_20px_theme('colors.cyber.primary')]">
        <Save className="w-5 h-5" />
        Salvar Configurações
      </button>

    </form>
  );
};