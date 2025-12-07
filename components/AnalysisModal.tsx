
import React from 'react';
import ImageAnalysis from './ImageAnalysis';
import type { ImageAnalysisResult } from '../types';
import { CloseIcon } from './icons';

interface AnalysisModalProps {
  data: ImageAnalysisResult | null;
  isLoading: boolean;
  imageSrc: string;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ data, isLoading, imageSrc, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-gray-700 max-h-[90vh]">
        
        {/* Left: Image Reference */}
        <div className="w-full md:w-1/3 bg-gray-900 relative flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-700">
            <div className="relative max-h-full max-w-full aspect-auto rounded-lg shadow-lg overflow-hidden border border-gray-600">
                <img 
                    src={`data:image/png;base64,${imageSrc}`} 
                    alt="Analyzed Headshot" 
                    className="max-h-[50vh] md:max-h-[70vh] object-contain"
                />
            </div>
        </div>

        {/* Right: Analysis Result */}
        <div className="w-full md:w-2/3 p-6 flex flex-col bg-gray-800 overflow-y-auto">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Relatório de Impacto (IA)</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-full transition-colors">
                  <CloseIcon className="w-6 h-6" />
              </button>
           </div>

           <div className="flex-grow">
               <ImageAnalysis 
                    data={data} 
                    isLoading={isLoading} 
                    onAnalyze={() => {}} // No-op here, triggered on open
               />
           </div>
           
           <div className="mt-4 pt-4 border-t border-gray-700 text-center">
               <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
               >
                   Fechar Relatório
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
