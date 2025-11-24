
import React, { useState, useMemo, useEffect } from 'react';
import type { StyleOption, StyleCategory } from '../types';
import { SparklesIcon } from './icons';

interface StyleSelectorProps {
  styles: StyleOption[];
  selectedStyle: StyleOption | null;
  onStyleSelect: (style: StyleOption) => void;
  onSurpriseMe: () => void;
  isTeamMode?: boolean;
}

const CATEGORIES: { id: StyleCategory; label: string }[] = [
  { id: 'professional', label: 'Profissional' },
  { id: 'casual_natural', label: 'Casual & Natural' },
  { id: 'halloween_fantasy', label: 'Halloween & Fantasia' },
  { id: 'travel_scenery', label: 'Viagens' },
  { id: 'creative_artistic', label: 'Criativo' },
];

const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onStyleSelect, onSurpriseMe, isTeamMode = false }) => {
  const [activeCategory, setActiveCategory] = useState<StyleCategory>('professional');

  // Force Professional category when switching to Team Mode
  useEffect(() => {
    if (isTeamMode) {
      setActiveCategory('professional');
    }
  }, [isTeamMode]);

  const filteredStyles = useMemo(() => {
    return styles.filter((style) => style.category === activeCategory);
  }, [styles, activeCategory]);

  return (
    <div className={`w-full max-w-md p-4 rounded-xl flex flex-col items-center shadow-lg transition-colors duration-300 ${isTeamMode ? 'bg-slate-800 border border-slate-600' : 'bg-gray-800'}`}>
       <div className="w-full flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${isTeamMode ? 'text-white' : 'text-cyan-300'}`}>
            {isTeamMode ? '3. Estilo Corporativo' : '2. Escolha um Estilo'}
        </h3>
        
        {!isTeamMode && (
            <button
            onClick={onSurpriseMe}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 rounded-full text-cyan-300 hover:bg-gray-600 transition-colors"
            title="Escolha um estilo aleatório"
            >
            <SparklesIcon className="w-4 h-4" />
            Me Surpreenda!
            </button>
        )}
       </div>

       {/* Category Tabs - HIDDEN IN TEAM MODE to ensure professionalism */}
       {!isTeamMode && (
           <div className="flex flex-wrap w-full mb-4 bg-gray-900/50 p-1 rounded-lg gap-1">
             {CATEGORIES.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`flex-grow px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-all text-center ${
                   activeCategory === cat.id
                     ? 'bg-gray-700 text-cyan-300 shadow-sm'
                     : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                 }`}
               >
                 {cat.label}
               </button>
             ))}
           </div>
       )}

       {isTeamMode && (
         <div className="w-full mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-800/50 text-sm text-blue-200">
            <p>🔒 Modo Corporativo Ativo: Apenas estilos profissionais estão disponíveis para garantir consistência da equipe.</p>
         </div>
       )}

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full animate-fade-in">
        {filteredStyles.length > 0 ? (
          filteredStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleSelect(style)}
              className={`p-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 w-full text-left ${
                selectedStyle?.id === style.id
                  ? (isTeamMode ? 'bg-indigo-600 text-white shadow-md ring-indigo-400' : 'bg-cyan-500 text-white shadow-md ring-cyan-400')
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              <span className="font-semibold">{style.label}</span>
            </button>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-4">Nenhum estilo encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default StyleSelector;
