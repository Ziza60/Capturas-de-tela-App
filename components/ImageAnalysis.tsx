
import React from 'react';
import type { ImageAnalysisResult } from '../types';
import { SparklesIcon } from './icons';

interface ImageAnalysisProps {
  data: ImageAnalysisResult | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

const ScoreBar: React.FC<{ label: string; score: number; colorClass: string }> = ({ label, score, colorClass }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-gray-300">{label}</span>
            <span className="text-white">{score}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
                className={`h-2 rounded-full transition-all duration-1000 ${colorClass}`} 
                style={{ width: `${score}%` }}
            ></div>
        </div>
    </div>
);

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ data, isLoading, onAnalyze }) => {
  if (!data && !isLoading) {
      return (
          <button 
            onClick={onAnalyze}
            className="w-full py-3 bg-gradient-to-r from-purple-800 to-indigo-900 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 hover:from-purple-700 hover:to-indigo-800 transition-all shadow-lg group"
          >
              <SparklesIcon className="w-5 h-5 text-purple-300 group-hover:text-white" />
              <span className="text-sm font-bold text-purple-100 group-hover:text-white">Analisar Impacto Profissional (IA)</span>
          </button>
      );
  }

  if (isLoading) {
      return (
        <div className="w-full py-6 bg-gray-800 rounded-xl border border-gray-700 flex flex-col items-center justify-center animate-pulse">
            <SparklesIcon className="w-6 h-6 text-purple-400 animate-spin mb-2" />
            <p className="text-sm text-gray-400">Consultando especialista de imagem...</p>
        </div>
      );
  }

  if (data) {
      return (
          <div className="w-full bg-gray-800 rounded-xl border border-purple-500/30 p-4 animate-fade-in shadow-xl">
              <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">Consultoria de Imagem</h3>
                    <p className="text-lg font-extrabold text-white mt-1">"{data.archetype}"</p>
                  </div>
                  <div className="bg-purple-900/50 p-2 rounded-lg">
                      <span className="text-2xl">🧐</span>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                      <h4 className="text-xs text-gray-500 font-bold uppercase mb-3">Scorecard Psicológico</h4>
                      <ScoreBar label="Profissionalismo" score={data.scores.professionalism} colorClass="bg-blue-500" />
                      <ScoreBar label="Acessibilidade / Simpatia" score={data.scores.approachability} colorClass="bg-green-500" />
                      <ScoreBar label="Confiança" score={data.scores.confidence} colorClass="bg-red-500" />
                      <ScoreBar label="Criatividade" score={data.scores.creativity} colorClass="bg-purple-500" />
                  </div>
                  
                  <div className="flex flex-col h-full">
                       <h4 className="text-xs text-gray-500 font-bold uppercase mb-2">Feedback Visual</h4>
                       <ul className="space-y-2 mb-4">
                           {data.feedback.map((fb, idx) => (
                               <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                                   <span className="text-purple-400 mt-0.5">•</span>
                                   {fb}
                               </li>
                           ))}
                       </ul>
                       
                       <div className="bg-gray-700/50 p-3 rounded-lg flex-grow">
                           <h4 className="text-[10px] text-gray-500 font-bold uppercase mb-1">Sugestão de Bio (LinkedIn)</h4>
                           <p className="text-xs text-gray-300 italic leading-relaxed">
                               "{data.linkedinBio}"
                           </p>
                           <button 
                                onClick={() => navigator.clipboard.writeText(data.linkedinBio)}
                                className="mt-2 text-[10px] text-purple-300 hover:text-white underline"
                           >
                               Copiar Bio
                           </button>
                       </div>
                  </div>
              </div>
          </div>
      );
  }

  return null;
};

export default ImageAnalysis;
