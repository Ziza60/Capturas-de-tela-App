
import React, { useState } from 'react';
import { AGE_OPTIONS, GENDER_OPTIONS, ETHNICITY_OPTIONS, LIGHTING_OPTIONS, EXPRESSION_OPTIONS, BEAUTY_OPTIONS } from '../constants';
import type { UserProfile, LightingOption, ExpressionOption, BeautyOption } from '../types';

interface AdvancedOptionsProps {
  userProfile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  selectedLighting: LightingOption;
  onLightingChange: (lighting: LightingOption) => void;
  selectedExpression: ExpressionOption;
  onExpressionChange: (exp: ExpressionOption) => void;
  selectedBeauty: BeautyOption;
  onBeautyChange: (beauty: BeautyOption) => void;
  is4kMode: boolean;
  onToggle4k: (enabled: boolean) => void;
  isBatchMode?: boolean;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ 
  userProfile, 
  onProfileChange,
  selectedLighting,
  onLightingChange,
  selectedExpression,
  onExpressionChange,
  selectedBeauty,
  onBeautyChange,
  is4kMode,
  onToggle4k,
  isBatchMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    onProfileChange({
      ...userProfile,
      [field]: value
    });
  };

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-xl flex flex-col items-center shadow-lg overflow-hidden border border-gray-700">
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="w-full p-4 flex justify-between items-center text-left focus:outline-none hover:bg-gray-700 transition-colors"
       >
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <span>⚙️ Opções Pro & Calibração</span>
                <span className="text-[10px] bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">Premium</span>
            </h3>
            <span className="text-xs text-gray-400 mt-1">
                {isBatchMode ? 'Iluminação, Expressão e Acabamento' : 'Identidade, Iluminação e Detalhes'}
            </span>
          </div>
          <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
       </button>

       {isOpen && (
         <div className="w-full p-4 pt-0 space-y-6 animate-fade-in bg-gray-800/50">
           
           {/* 1. Identity Calibration - HIDDEN IN BATCH MODE (Dangerous for mixed groups) */}
           {!isBatchMode && (
               <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-1 flex justify-between">
                    1. Calibração de Identidade
                    <span className="text-[10px] text-gray-500 font-normal">Evita troca de etnia/idade</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Gênero</label>
                      <select 
                        value={userProfile.gender}
                        onChange={(e) => handleProfileChange('gender', e.target.value)}
                        className="w-full bg-gray-700 text-white text-xs rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 outline-none border border-gray-600"
                      >
                        {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Faixa Etária</label>
                      <select 
                        value={userProfile.ageGroup}
                        onChange={(e) => handleProfileChange('ageGroup', e.target.value)}
                        className="w-full bg-gray-700 text-white text-xs rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 outline-none border border-gray-600"
                      >
                        {AGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Etnia / Origem</label>
                      <select 
                        value={userProfile.ethnicity}
                        onChange={(e) => handleProfileChange('ethnicity', e.target.value)}
                        className="w-full bg-gray-700 text-white text-xs rounded-lg p-2 focus:ring-2 focus:ring-cyan-400 outline-none border border-gray-600"
                      >
                        {ETHNICITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                  </div>
               </div>
           )}

           {/* 2. Lighting Studio */}
           <div className={`space-y-3 ${isBatchMode ? 'pt-2' : ''}`}>
              <h4 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-1">
                  {isBatchMode ? '1. Iluminação de Estúdio' : '2. Iluminação de Estúdio'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LIGHTING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onLightingChange(option)}
                    className={`p-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all text-center border ${
                      selectedLighting.id === option.id
                        ? 'bg-cyan-900/50 border-cyan-400 text-cyan-200'
                        : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
           </div>

           {/* 3. Expression Control */}
           <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-1 flex items-center gap-2">
                 {isBatchMode ? '2. Expressão Facial' : '3. Expressão Facial'}
                <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 rounded border border-purple-700">Experimental</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPRESSION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onExpressionChange(option)}
                    className={`p-2 rounded-lg text-[10px] font-medium transition-all text-center border ${
                      selectedExpression.id === option.id
                        ? 'bg-purple-900/50 border-purple-400 text-purple-200'
                        : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
           </div>

           {/* 4. Beauty Level */}
           <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-200 border-b border-gray-700 pb-1">
                 {isBatchMode ? '3. Nível de Retoque (Beauty)' : '4. Nível de Retoque (Beauty)'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BEAUTY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onBeautyChange(option)}
                    className={`p-2 rounded-lg text-[10px] font-medium transition-all text-center border ${
                      selectedBeauty.id === option.id
                        ? 'bg-pink-900/50 border-pink-400 text-pink-200'
                        : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
           </div>

           {/* 5. High Detail Toggle */}
           <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Modo Ultra Detalhe (Textura HD)</span>
                    <span className="text-[10px] text-gray-400">Maximiza nitidez e texturas (Resolução limitada pela API)</span>
                </div>
                <button 
                    onClick={() => onToggle4k(!is4kMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is4kMode ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is4kMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
           </div>

         </div>
       )}
    </div>
  );
};

export default AdvancedOptions;
