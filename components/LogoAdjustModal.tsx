
import React, { useState, useEffect } from 'react';
import type { TeamSettings } from '../types';
import { overlayLogo } from '../utils/imageProcessing';
import { LoadingSpinner, CloseIcon, CheckCircleIcon } from './icons';

interface LogoAdjustModalProps {
  rawImage: string;
  currentSettings: TeamSettings;
  onSave: (newImage: string, settingsUsed: TeamSettings) => void;
  onClose: () => void;
}

const LogoAdjustModal: React.FC<LogoAdjustModalProps> = ({ rawImage, currentSettings, onSave, onClose }) => {
  // Local state for this modal only (doesn't affect global yet)
  const [localSettings, setLocalSettings] = useState<TeamSettings>(currentSettings);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update preview whenever sliders change
  useEffect(() => {
    let active = true;
    const update = async () => {
      setIsProcessing(true);
      try {
        if (localSettings.logo) {
            const result = await overlayLogo(rawImage, localSettings.logo.base64, localSettings);
            if (active) setPreviewImage(result);
        } else {
            if (active) setPreviewImage(rawImage);
        }
      } catch (error) {
        console.error("Preview error", error);
      } finally {
        if (active) setIsProcessing(false);
      }
    };
    
    const timer = setTimeout(update, 50); // Debounce
    return () => { active = false; clearTimeout(timer); };
  }, [localSettings, rawImage]);

  const handleSave = () => {
    if (previewImage) {
        onSave(previewImage, localSettings);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-gray-700 max-h-[90vh]">
        
        {/* Left: Image Preview */}
        <div className="w-full md:w-2/3 bg-gray-900 relative flex items-center justify-center p-4">
            {isProcessing && (
                <div className="absolute top-4 right-4 z-10">
                    <LoadingSpinner className="w-6 h-6 text-white" />
                </div>
            )}
            <div className="relative max-h-full max-w-full aspect-auto rounded shadow-lg overflow-hidden">
                <img 
                    src={previewImage ? `data:image/png;base64,${previewImage}` : `data:image/png;base64,${rawImage}`} 
                    alt="Preview" 
                    className="max-h-[70vh] object-contain"
                />
            </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-1/3 p-6 flex flex-col bg-gray-800 border-l border-gray-700 overflow-y-auto">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Ajuste Fino de Logo</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
           </div>

           <div className="space-y-6 flex-grow">
              <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                  <p className="text-sm text-indigo-200 mb-4 font-semibold">Posicionamento Manual</p>
                  
                  {/* Scale */}
                  <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Tamanho</span>
                            <span className="text-white">{localSettings.logoScale}%</span>
                        </div>
                        <input 
                            type="range" min="5" max="40" step="1" 
                            value={localSettings.logoScale}
                            onChange={(e) => setLocalSettings({...localSettings, logoScale: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                   </div>

                   {/* Vertical Y */}
                   <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Posição Vertical (↕)</span>
                            <span className="text-white">{localSettings.logoOffsetY}%</span>
                        </div>
                        <input 
                            type="range" min="-30" max="30" step="1" 
                            value={localSettings.logoOffsetY}
                            onChange={(e) => setLocalSettings({...localSettings, logoOffsetY: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                   </div>

                   {/* Horizontal X */}
                   <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Posição Horizontal (↔)</span>
                            <span className="text-white">{localSettings.logoOffsetX}%</span>
                        </div>
                        <input 
                            type="range" min="-30" max="30" step="1" 
                            value={localSettings.logoOffsetX}
                            onChange={(e) => setLocalSettings({...localSettings, logoOffsetX: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                   </div>
              </div>

              <div className="p-4 bg-gray-700/30 rounded-lg">
                 <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Posição Base</p>
                 <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setLocalSettings({...localSettings, logoPosition: 'chest-left', logoOffsetX: 0, logoOffsetY: 0})}
                        className={`px-3 py-2 text-xs rounded border ${localSettings.logoPosition === 'chest-left' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-400'}`}
                    >
                        Peito Esq.
                    </button>
                    <button 
                        onClick={() => setLocalSettings({...localSettings, logoPosition: 'chest-right', logoOffsetX: 0, logoOffsetY: 0})}
                        className={`px-3 py-2 text-xs rounded border ${localSettings.logoPosition === 'chest-right' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-400'}`}
                    >
                        Peito Dir.
                    </button>
                 </div>
              </div>
           </div>

           <div className="mt-6 pt-6 border-t border-gray-700 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                 <CheckCircleIcon className="w-5 h-5" />
                 Salvar Ajuste
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LogoAdjustModal;
