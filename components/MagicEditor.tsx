
import React, { useState } from 'react';
import { SparklesIcon, LoadingSpinner } from './icons';
import { editGeneratedImage } from '../services/geminiService';

interface MagicEditorProps {
  currentImage: string;
  onImageUpdate: (newImage: string) => void;
  onClose: () => void;
}

const QUICK_ACTIONS = [
    "Mudar fundo para escritório moderno",
    "Estilo preto e branco cinematográfico",
    "Adicionar óculos de sol em todos",
    "Transformar em pintura a óleo",
    "Iluminação de estúdio neon",
    "Fazer sorrir"
];

const MagicEditor: React.FC<MagicEditorProps> = ({ currentImage, onImageUpdate, onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
        // Global edit -> No Mask passed
        const newImage = await editGeneratedImage(currentImage, prompt);
        onImageUpdate(newImage);
        setPrompt(""); // Clear after success
    } catch (err) {
        setError("Não foi possível realizar essa edição. Tente algo diferente.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-purple-900/20 border-t border-purple-500/30 p-4 space-y-4 animate-fade-in">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                    Edição Global (Mágica)
                </h3>
                <p className="text-xs text-purple-200/70 mt-1 max-w-md">
                    Altera a imagem inteira baseada no seu texto. Ideal para mudar o estilo, o fundo ou a atmosfera.
                </p>
            </div>
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-white">Fechar</button>
        </div>

        <div className="flex gap-2">
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Transformar em desenho, mudar fundo para praia..."
                className="flex-grow bg-gray-900 border border-purple-500/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600"
                onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleEdit()}
            />
            <button 
                onClick={handleEdit}
                disabled={!prompt.trim() || isProcessing}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center gap-2"
            >
                {isProcessing ? <LoadingSpinner className="w-4 h-4 text-white" /> : <SparklesIcon className="w-4 h-4" />}
                {isProcessing ? 'Gerando...' : 'Criar'}
            </button>
        </div>

        {error && (
            <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded">{error}</p>
        )}

        <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Sugestões (Afeta toda a foto)</p>
            <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => setPrompt(action)}
                        className="text-[10px] bg-gray-800 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-500/50 text-gray-300 px-2 py-1 rounded-full transition-all"
                    >
                        {action}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

export default MagicEditor;
