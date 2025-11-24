
import React from 'react';
import type { EditingSettings } from '../types';
import { LightbulbIcon, SparklesIcon } from './icons';

interface PhotoEditorProps {
  settings: EditingSettings;
  onUpdate: (settings: EditingSettings) => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ settings, onUpdate }) => {
  
  const handleChange = (key: keyof EditingSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="w-full bg-gray-800 border-t border-gray-700 p-4 space-y-6 animate-fade-in">
       
       <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-cyan-400" />
            Estúdio de Pós-Processamento
          </h3>
          <button 
            onClick={() => onUpdate({
                brightness: 1, contrast: 1, saturation: 1, grayscale: false,
                borderRadius: 0, borderWidth: 0, borderColor: '#ffffff',
                format: 'png', quality: 0.9
            })}
            className="text-xs text-red-400 hover:text-red-300 underline"
          >
            Resetar
          </button>
       </div>

       {/* Color Adjustments */}
       <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ajuste de Imagem</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div>
               <label className="flex justify-between text-xs text-gray-400 mb-1">
                 Brilho <span className="text-cyan-400">{Math.round(settings.brightness * 100)}%</span>
               </label>
               <input 
                 type="range" min="0.5" max="1.5" step="0.05" 
                 value={settings.brightness}
                 onChange={(e) => handleChange('brightness', parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
             </div>
             <div>
               <label className="flex justify-between text-xs text-gray-400 mb-1">
                 Contraste <span className="text-cyan-400">{Math.round(settings.contrast * 100)}%</span>
               </label>
               <input 
                 type="range" min="0.5" max="1.5" step="0.05" 
                 value={settings.contrast}
                 onChange={(e) => handleChange('contrast', parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
             </div>
             <div>
               <label className="flex justify-between text-xs text-gray-400 mb-1">
                 Saturação <span className="text-cyan-400">{Math.round(settings.saturation * 100)}%</span>
               </label>
               <input 
                 type="range" min="0" max="2" step="0.1" 
                 value={settings.saturation}
                 onChange={(e) => handleChange('saturation', parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
             </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleChange('grayscale', !settings.grayscale)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${settings.grayscale ? 'bg-gray-200 text-gray-900 border-white' : 'bg-gray-700 text-gray-400 border-gray-600'}`}
             >
                Preto & Branco (Grayscale)
             </button>
          </div>
       </div>

       {/* Geometry & Borders */}
       <div className="space-y-3 border-t border-gray-700 pt-4">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Geometria & Bordas</p>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="flex justify-between text-xs text-gray-400 mb-1">
                   Arredondar (Radius) <span className="text-indigo-400">{settings.borderRadius}%</span>
                 </label>
                 <input 
                   type="range" min="0" max="50" step="1" 
                   value={settings.borderRadius}
                   onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                   className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
                 <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>Quadrado</span>
                    <span>Círculo</span>
                 </div>
              </div>
              
              <div>
                 <label className="flex justify-between text-xs text-gray-400 mb-1">
                   Borda (Px) <span className="text-indigo-400">{settings.borderWidth}px</span>
                 </label>
                 <div className="flex items-center gap-2">
                    <input 
                      type="range" min="0" max="40" step="1" 
                      value={settings.borderWidth}
                      onChange={(e) => handleChange('borderWidth', parseInt(e.target.value))}
                      className="flex-grow h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <input 
                      type="color"
                      value={settings.borderColor}
                      onChange={(e) => handleChange('borderColor', e.target.value)}
                      className="w-6 h-6 rounded bg-transparent cursor-pointer border-none p-0"
                    />
                 </div>
              </div>
           </div>
       </div>

       {/* Output Format */}
       <div className="space-y-3 border-t border-gray-700 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Formato de Exportação</p>
          <div className="flex gap-2">
             {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleChange('format', fmt)}
                  className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${
                    settings.format === fmt 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {fmt}
                </button>
             ))}
          </div>
          {settings.format === 'jpeg' && (
             <div>
                <label className="flex justify-between text-xs text-gray-400 mb-1">
                   Qualidade de Compressão <span className="text-indigo-400">{Math.round(settings.quality * 100)}%</span>
                </label>
                <input 
                   type="range" min="0.1" max="1.0" step="0.1" 
                   value={settings.quality}
                   onChange={(e) => handleChange('quality', parseFloat(e.target.value))}
                   className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
             </div>
          )}
       </div>

    </div>
  );
};

export default PhotoEditor;
