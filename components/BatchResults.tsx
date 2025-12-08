
import React from 'react';
import type { BatchItem, AspectRatioOption } from '../types';
import { LoadingSpinner, CheckCircleIcon, DownloadIcon, SparklesIcon } from './icons';

interface BatchResultsProps {
  queue: BatchItem[];
  aspectRatio: AspectRatioOption | null;
  onEditItem?: (item: BatchItem) => void;
  onRetryItem?: (itemId: string) => void;
  onDownloadZip?: () => void;
  onAnalyzeItem?: (item: BatchItem) => void;
}

const BatchResults: React.FC<BatchResultsProps> = ({ queue, aspectRatio, onEditItem, onRetryItem, onDownloadZip, onAnalyzeItem }) => {
  // Determine the CSS aspect class based on selection, default to square
  const aspectClass = aspectRatio?.className || 'aspect-square';
  const completedCount = queue.filter(i => i.status === 'completed').length;
  const hasErrors = queue.some(i => i.status === 'error');

  return (
    <div className="w-full bg-gray-800 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
            <div>
                <h3 className="text-lg font-semibold text-cyan-300">Resultados da Equipe</h3>
                <span className="text-sm text-gray-400">
                    {completedCount} de {queue.length} concluídos
                </span>
            </div>
            
            {onDownloadZip && completedCount > 0 && (
                <button 
                    onClick={onDownloadZip}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" />
                    Baixar Tudo (ZIP)
                </button>
            )}
        </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {queue.map((item) => (
          <div key={item.id} className={`relative bg-gray-700 rounded-lg overflow-hidden group border transition-colors ${item.status === 'error' ? 'border-red-500' : 'border-gray-600 hover:border-indigo-400'}`}>
            
            {/* Dynamic Aspect Ratio Container */}
            <div className={`${aspectClass} relative w-full`}>
                {item.resultImage ? (
                     <img 
                        src={`data:image/png;base64,${item.resultImage}`} 
                        alt={item.file.name} 
                        className="w-full h-full object-cover"
                     />
                ) : (
                    <img 
                        src={`data:${item.file.mimeType};base64,${item.file.base64}`} 
                        alt={item.file.name} 
                        className="w-full h-full object-cover opacity-50 grayscale"
                    />
                )}

                {/* Status Overlays */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {item.status === 'pending' && (
                        <span className="px-2 py-1 bg-gray-900/70 text-white text-xs rounded">Pendente...</span>
                    )}
                    {item.status === 'processing' && (
                        <LoadingSpinner className="w-8 h-8 text-cyan-400" />
                    )}
                </div>
                
                {/* Error Overlay with Retry */}
                {item.status === 'error' && (
                     <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center p-2 text-center pointer-events-auto">
                        <p className="text-white text-xs font-bold mb-2">Erro na geração</p>
                        {onRetryItem && (
                            <button 
                                onClick={() => onRetryItem(item.id)}
                                className="px-3 py-1 bg-white text-red-900 text-xs font-bold rounded-full shadow hover:bg-gray-100 flex items-center gap-1"
                            >
                                <span>🔄</span> Tentar Novamente
                            </button>
                        )}
                    </div>
                )}
                
                {/* Actions Overlay (Hover) for Completed */}
                {item.status === 'completed' && item.resultImage && (
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        {onAnalyzeItem && (
                            <button
                                onClick={() => onAnalyzeItem(item)}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full shadow hover:from-purple-500 hover:to-indigo-500 w-full flex items-center justify-center gap-1 transform hover:scale-105 transition-all font-bold"
                            >
                                <SparklesIcon className="w-3 h-3" /> 
                                {item.analysis ? 'Ver Análise' : 'Analisar (IA)'}
                            </button>
                        )}
                        
                        {onEditItem && (
                            <button 
                                onClick={() => onEditItem(item)}
                                className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded-full shadow hover:bg-gray-600 w-full flex items-center justify-center gap-1 border border-gray-600"
                            >
                                <span>✏️</span> Ajustar Logo
                            </button>
                        )}
                        
                        <a 
                            href={`data:image/png;base64,${item.resultImage}`} 
                            download={item.finalFileName || `headshot-${item.file.name}`}
                            className="px-3 py-1.5 bg-cyan-600 text-white text-xs rounded-full shadow hover:bg-cyan-500 w-full flex items-center justify-center gap-1 border border-cyan-500/50"
                        >
                            <DownloadIcon className="w-3 h-3" /> Baixar
                        </a>
                    </div>
                )}

                {item.status === 'completed' && !onEditItem && (
                     <div className="absolute top-2 right-2 text-green-400 bg-gray-900/50 rounded-full p-1">
                        <CheckCircleIcon className="w-5 h-5" />
                     </div>
                )}
            </div>
            
            <div className="p-2 flex justify-between items-center bg-gray-750">
                <div className="overflow-hidden w-full">
                     <p className="text-xs text-white font-medium truncate" title={item.finalFileName || item.file.name}>
                         {item.finalFileName || item.file.name}
                     </p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchResults;
