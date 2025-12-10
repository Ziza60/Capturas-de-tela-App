
import React, { useState, useEffect } from 'react';
import type { UploadedFile, StyleOption } from '../types';
import { generateHeadshot } from '../services/geminiService';
import { POLAROID_ERAS, CLOTHING_OPTIONS } from '../constants';
import { LoadingSpinner, CloseIcon, DownloadIcon } from './icons';

interface PolaroidJourneyProps {
  originalImage: UploadedFile;
  onClose: () => void;
}

interface EraResult {
    id: string;
    label: string;
    caption: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    image?: string;
}

const PolaroidJourney: React.FC<PolaroidJourneyProps> = ({ originalImage, onClose }) => {
  const [results, setResults] = useState<EraResult[]>(
      POLAROID_ERAS.map(era => ({
          id: era.id,
          label: era.label,
          caption: era.caption,
          status: 'pending'
      }))
  );
  
  const [started, setStarted] = useState(false);

  // Auto-start journey
  useEffect(() => {
      if (!started) {
          setStarted(true);
          runJourney();
      }
  }, [started]);

  const runJourney = async () => {
      // Process one by one to not hit rate limits easily and create a "journey" feel
      for (let i = 0; i < POLAROID_ERAS.length; i++) {
          const era = POLAROID_ERAS[i];
          
          setResults(prev => prev.map(r => r.id === era.id ? { ...r, status: 'processing' } : r));

          try {
              // Construct a temporary Style Option
              const tempStyle: StyleOption = {
                  id: `polaroid-${era.id}`,
                  label: era.label,
                  category: 'time_travel',
                  prompt: era.prompt
              };

              // Auto-Clothing logic included in prompts, but let's reinforce
              const autoClothing = CLOTHING_OPTIONS.find(c => c.id === 'auto-style') || null;

              const image = await generateHeadshot(
                  originalImage,
                  tempStyle,
                  null, // Glasses default
                  autoClothing,
                  { id: 'square', label: 'SQ', prompt: '--ar 1:1', className: '' }, // Square mandatory for Polaroid
                  undefined, undefined, undefined, undefined, undefined, // Other opts
                  false // 4K off for speed
              );

              setResults(prev => prev.map(r => r.id === era.id ? { ...r, status: 'completed', image } : r));
              
              // Small delay between generations for effect
              await new Promise(r => setTimeout(r, 1000));

          } catch (e) {
              setResults(prev => prev.map(r => r.id === era.id ? { ...r, status: 'error' } : r));
          }
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 overflow-y-auto">
        
        <div className="w-full max-w-5xl flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📸</span> Máquina do Tempo Polaroid
            </h2>
            <button 
                onClick={onClose}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl pb-10">
            {results.map((item, index) => (
                <div 
                    key={item.id} 
                    className="animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {/* POLAROID FRAME CSS */}
                    <div className="bg-white p-4 pb-12 shadow-2xl transform hover:scale-105 transition-transform duration-300 rotate-1 hover:rotate-0 relative group">
                        
                        {/* Tape Effect */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm rotate-[-2deg] z-10"></div>

                        {/* Image Area */}
                        <div className="aspect-square bg-gray-100 mb-4 overflow-hidden relative filter sepia-[0.1] contrast-[1.1]">
                            {item.status === 'completed' && item.image ? (
                                <img 
                                    src={`data:image/jpeg;base64,${item.image}`} 
                                    alt={item.label}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
                                    {item.status === 'processing' ? (
                                        <>
                                            <LoadingSpinner className="w-8 h-8 text-gray-500 mb-2" />
                                            <span className="text-xs font-mono">Revelando...</span>
                                        </>
                                    ) : item.status === 'pending' ? (
                                        <span className="text-xs font-mono">Aguardando...</span>
                                    ) : (
                                        <span className="text-xs font-mono text-red-400">Erro no filme</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Handwritten Caption */}
                        <div className="text-center font-handwriting text-gray-800 transform -rotate-1">
                            <p className="font-bold text-xl" style={{ fontFamily: '"Courier New", Courier, monospace' }}>{item.label}</p>
                            <p className="text-xs text-gray-500">{item.caption}</p>
                        </div>

                        {/* Actions */}
                        {item.status === 'completed' && (
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                    href={`data:image/jpeg;base64,${item.image}`} 
                                    download={`polaroid-${item.id}.jpg`}
                                    className="p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 block"
                                    title="Baixar Foto"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default PolaroidJourney;
