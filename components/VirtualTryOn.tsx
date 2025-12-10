
import React, { useState, useRef } from 'react';
import { VIRTUAL_TRY_ON_CATEGORIES, VIRTUAL_TRY_ON_ITEMS } from '../constants';
import type { ClothingOption } from '../types';
import { SparklesIcon, UploadIcon, CloseIcon } from './icons';
import { preprocessImage } from '../utils/imageProcessing';

interface VirtualTryOnProps {
  selectedClothing: ClothingOption | null;
  onClothingSelect: (clothing: ClothingOption) => void;
}

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ selectedClothing, onClothingSelect }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof VIRTUAL_TRY_ON_ITEMS>('sports');
  const [customPrompt, setCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Checks if the current selection is a reference upload
  const isReferenceActive = selectedClothing?.id === 'custom-ref-image';

  const handleCustomSubmit = () => {
      if (!customPrompt.trim()) return;
      onClothingSelect({
          id: 'custom-try-on',
          label: 'Personalizado',
          prompt: `CLOTHING OVERRIDE: ${customPrompt}. 
          
          [CRITICAL RULES FOR CUSTOM CLOTHING]
          1. IF SPORTS JERSEY: Use the OFFICIAL colors exactly.
          2. LOGOS/SPONSORS: Do NOT generate gibberish text. If the official logo cannot be rendered perfectly due to copyright, output a CLEAN version with the correct colors and patterns only.
          3. TEXT: Avoid random letters. Keep the chest area clean if unsure.
          4. FIT: Ensure the clothing fits the subject's body naturally.
          `
      });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            // Use preprocess to ensure it's not too huge for Gemini
            const processed = await preprocessImage(file);
            
            onClothingSelect({
                id: 'custom-ref-image',
                label: 'Look da Web (Upload)',
                prompt: 'CLOTHING TRANSFER: Use the CLOTHING from the reference image provided.',
                referenceImage: processed.base64
            });
        } catch (err) {
            alert("Erro ao processar imagem de roupa.");
        }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearReference = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Select default or null
      onClothingSelect({ id: 'original', label: 'Manter Original', prompt: '' });
  };

  return (
    <div className="space-y-4 animate-slide-in">
        
        {/* Header / Intro */}
        <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/20">
            <p className="text-xs text-indigo-200">
                Selecione uma peça do catálogo, descreva o que quer ou <strong>suba uma foto de roupa da internet</strong>.
            </p>
        </div>

        {/* --- UPLOAD SECTION (NEW) --- */}
        <div className="mb-4">
            <label className="text-xs font-bold text-gray-400 mb-2 block flex items-center gap-1">
                <span>📸</span> Experimentar Look da Web
            </label>
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                    isReferenceActive 
                    ? 'border-green-500 bg-green-900/20' 
                    : 'border-gray-600 bg-gray-800 hover:border-indigo-400 hover:bg-gray-750'
                }`}
            >
                {isReferenceActive && selectedClothing?.referenceImage ? (
                    <div className="relative w-full h-32 flex items-center justify-center">
                        <img 
                            src={`data:image/jpeg;base64,${selectedClothing.referenceImage}`} 
                            alt="Clothing Ref" 
                            className="max-h-full max-w-full rounded shadow-lg object-contain"
                        />
                        <button 
                            onClick={clearReference}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center rounded-b">
                            Referência Ativa
                        </div>
                    </div>
                ) : (
                    <>
                        <UploadIcon className="w-8 h-8 text-gray-500 group-hover:text-indigo-400 mb-2" />
                        <span className="text-xs font-semibold text-gray-400 group-hover:text-white">
                            Carregar foto da roupa
                        </span>
                        <span className="text-[9px] text-gray-600 mt-1">Print do Instagram, Pinterest, Lojas...</span>
                    </>
                )}
                
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleImageUpload}
                />
            </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 border-t border-gray-700 pt-3">
            {VIRTUAL_TRY_ON_CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    <span>{cat.icon}</span>
                    {cat.label}
                </button>
            ))}
        </div>

        {/* Grid of Items */}
        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {VIRTUAL_TRY_ON_ITEMS[activeCategory]?.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onClothingSelect(item)}
                    className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between h-full ${
                        selectedClothing?.id === item.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-750'
                    }`}
                >
                    <span className="text-xs font-semibold block">{item.label}</span>
                </button>
            ))}
        </div>

        {/* Custom Input */}
        <div className="border-t border-gray-700 pt-3 mt-2">
            <label className="text-xs font-bold text-gray-400 mb-2 block flex items-center gap-1">
                <SparklesIcon className="w-3 h-3 text-yellow-400" />
                Costureiro IA (Texto Livre)
            </label>
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Camisa do Flamengo 2024..."
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                />
                <button 
                    onClick={handleCustomSubmit}
                    disabled={!customPrompt.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
                >
                    Vestir
                </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 italic">
                *Dica: Para times de futebol, a IA prioriza cores oficiais se o logo for complexo.
            </p>
        </div>
    </div>
  );
};

export default VirtualTryOn;
