
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraIcon, CompareIcon, LoadingSpinner, ShareIcon, DownloadIcon, SparklesIcon } from './icons';
import type { UploadedFile, EditingSettings, ImageAnalysisResult } from '../types';
import { applyPostProcessing } from '../utils/imageProcessing';
import { analyzeHeadshot } from '../services/geminiService';
import PhotoEditor from './PhotoEditor';
import MagicEditor from './MagicEditor';
import BrushEditor from './BrushEditor';
import ImageAnalysis from './ImageAnalysis';

// Helper to convert base64 to a Blob for sharing
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

interface ResultDisplayProps {
  isLoading: boolean;
  generatedImage: string | null;
  error: string | null;
  aspectRatioClassName: string;
  originalImage: UploadedFile | null;
}

const loadingMessages = [
  "Aquecendo os processadores de IA...",
  "Analisando os pixels da sua selfie...",
  "Encontrando o seu melhor ângulo...",
  "Aplicando o estilo selecionado...",
  "Adicionando um toque de magia...",
  "Polindo os detalhes finais...",
  "Quase pronto!",
];

const LoadingState: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 500);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-full max-w-xs">
        <p className="text-lg text-gray-300 mb-4 animate-fade-in h-6" key={messageIndex}>
          {loadingMessages[messageIndex]}
        </p>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-500">Isso pode levar um momento. Por favor, aguarde.</p>
      </div>
    </div>
  );
};

const ImageComparator: React.FC<{ 
    before: UploadedFile, 
    after: string, 
    onShare: () => void,
    mimeType: string 
}> = ({ before, after, onShare, mimeType }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    }, [isDragging]);

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
    
    const handleTouchStart = () => setIsDragging(true);
    const handleTouchEnd = () => setIsDragging(false);
    const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

    useEffect(() => {
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
      }
    }, []);

    const beforeSrc = `data:${before.mimeType};base64,${before.base64}`;
    const afterSrc = `data:${mimeType};base64,${after}`;

    // Extract file extension for download
    const ext = mimeType.split('/')[1] || 'png';

    return (
        <div 
          ref={containerRef}
          className="relative w-full h-full select-none overflow-hidden rounded-lg group bg-gray-900 shadow-2xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
            {/* Helper text overlay */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                Antes
            </div>
             <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                Depois
            </div>

            <img src={beforeSrc} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`}}>
                <img src={afterSrc} alt="Generated" className="w-full h-full object-contain" />
            </div>
            
            {/* Slider Handle */}
            <div className="absolute inset-y-0 bg-white w-0.5 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `calc(${sliderPosition}%)` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white w-8 h-8 rounded-full shadow-xl flex items-center justify-center text-gray-700 cursor-grab active:cursor-grabbing pointer-events-auto border-2 border-gray-200">
                  <CompareIcon className="w-5 h-5 transform -rotate-90"/>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-3 z-10 pointer-events-auto">
                <button
                    onClick={(e) => { e.stopPropagation(); onShare(); }}
                    className="px-3 py-1.5 bg-gray-800/90 text-white rounded-lg shadow-lg border border-gray-600 hover:bg-gray-700 flex items-center gap-2 text-xs backdrop-blur-sm"
                    title="Share"
                >
                    <ShareIcon className="w-4 h-4" />
                    <span>Compartilhar</span>
                </button>
                <a
                    href={afterSrc}
                    download={`ai-headshot.${ext}`}
                    className="px-3 py-1.5 bg-cyan-500/90 text-white rounded-lg shadow-lg hover:bg-cyan-600 flex items-center gap-2 text-xs backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DownloadIcon className="w-4 h-4" />
                    Baixar
                </a>
            </div>
        </div>
    )
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, generatedImage, error, aspectRatioClassName, originalImage }) => {
  // State for Post Processing
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // UI Toggles
  const [activeEditor, setActiveEditor] = useState<'none' | 'filters' | 'magic_global' | 'brush_local'>('none');
  const resultRef = useRef<HTMLDivElement>(null);

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [editorSettings, setEditorSettings] = useState<EditingSettings>({
      brightness: 1,
      contrast: 1,
      saturation: 1,
      grayscale: false,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#ffffff',
      format: 'png',
      quality: 0.9
  });

  // Reset state when a new AI image comes in
  useEffect(() => {
    if (generatedImage) {
        setProcessedImage(generatedImage);
        // Reset editor defaults
        setEditorSettings({
            brightness: 1, contrast: 1, saturation: 1, grayscale: false,
            borderRadius: 0, borderWidth: 0, borderColor: '#ffffff',
            format: 'png', quality: 0.9
        });
        setActiveEditor('none');
        setAnalysisResult(null); // Reset analysis
        
        // Auto scroll to result
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [generatedImage]);

  // Apply filters when settings change
  useEffect(() => {
    const apply = async () => {
        if (!generatedImage && !processedImage) return;
        const source = processedImage || generatedImage;
        if (!source) return;

        setIsProcessing(true);
        try {
            const result = await applyPostProcessing(source, editorSettings);
        } catch (e) {
            console.error("Editor error", e);
        } finally {
            setIsProcessing(false);
        }
    };
  }, [editorSettings]);

  // --- BETTER FILTER LOGIC ---
  const [magicImage, setMagicImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);

  useEffect(() => {
      setMagicImage(null);
      setFinalImage(null);
  }, [generatedImage]);

  const activeBaseImage = magicImage || generatedImage;

  useEffect(() => {
      const apply = async () => {
          if (!activeBaseImage) return;
          setIsProcessing(true);
          try {
              const res = await applyPostProcessing(activeBaseImage, editorSettings);
              setFinalImage(res);
          } finally {
              setIsProcessing(false);
          }
      };
      const timer = setTimeout(apply, 100);
      return () => clearTimeout(timer);
  }, [activeBaseImage, editorSettings]);

  const handleMagicUpdate = (newImg: string) => {
      setMagicImage(newImg);
  };

  const handleRunAnalysis = async () => {
      const imageToAnalyze = finalImage || activeBaseImage;
      if (!imageToAnalyze) return;

      setIsAnalyzing(true);
      try {
          const result = await analyzeHeadshot(imageToAnalyze);
          setAnalysisResult(result);
      } catch (err) {
          alert("Não foi possível analisar a imagem no momento.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleShareImage = useCallback(async () => {
    if (!finalImage || !navigator.share) {
      alert('A função de compartilhar não é suportada neste navegador.');
      return;
    }
    try {
      const mime = `image/${editorSettings.format}`;
      const ext = editorSettings.format === 'jpeg' ? 'jpg' : editorSettings.format;
      const blob = base64ToBlob(finalImage, mime);
      const file = new File([blob], `ai-headshot.${ext}`, { type: mime });
      await navigator.share({
        title: 'Meu Retrato de IA',
        text: 'Veja o novo retrato que criei com IA!',
        files: [file],
      });
    } catch (error) {
      console.error('Error sharing image:', error);
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        alert('Não foi possível compartilhar a imagem.');
      }
    }
  }, [finalImage, editorSettings.format]);

  if (isLoading) return <div className="w-full bg-gray-800 rounded-xl shadow-lg min-h-[300px] flex items-center justify-center"><LoadingState /></div>;
  
  if (error) {
    return (
      <div className="w-full bg-gray-800 rounded-xl shadow-lg p-6 border border-red-500/30 flex flex-col items-center justify-center min-h-[200px]">
         <p className="text-red-400 font-semibold mb-2">Falha na Geração</p>
         <p className="text-gray-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (!generatedImage || !originalImage) {
    return (
      <div className="w-full bg-gray-800 rounded-xl shadow-lg min-h-[400px] flex flex-col items-center justify-center text-gray-500 p-8 border border-gray-700 border-dashed">
        <CameraIcon className="w-20 h-20 mb-4 opacity-50" />
        <p className="text-lg font-medium">Seu novo retrato aparecerá aqui</p>
        <p className="text-sm mt-2">Carregue uma foto e escolha um estilo para começar.</p>
      </div>
    );
  }

  return (
    <div ref={resultRef} className="w-full flex flex-col gap-4">
        
       {/* 1. MAIN RESULT CARD */}
       <div className="w-full bg-gray-800 rounded-xl flex flex-col shadow-lg border border-gray-700 overflow-hidden">
            
            {/* Conditional Rendering: If Brush Editor is active, it takes over the view for better UX */}
            {activeEditor === 'brush_local' && activeBaseImage ? (
                <BrushEditor
                    currentImage={activeBaseImage}
                    onImageUpdate={handleMagicUpdate}
                    onClose={() => setActiveEditor('none')}
                />
            ) : (
                <div className={`w-full ${aspectRatioClassName} bg-gray-900 relative transition-all duration-300`}>
                    {isProcessing && (
                        <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center">
                            <LoadingSpinner className="w-8 h-8 text-white" />
                        </div>
                    )}
                    <ImageComparator 
                        before={originalImage} 
                        after={finalImage || activeBaseImage || generatedImage} 
                        onShare={handleShareImage} 
                        mimeType={`image/${editorSettings.format}`}
                    />
                </div>
            )}

            {/* Editor Toggle Bar - Only show if Brush Editor is NOT active */}
            {activeEditor !== 'brush_local' && (
                <div className="bg-gray-900/50 p-4 border-t border-gray-700">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            {/* GLOBAL MAGIC BUTTON */}
                            <button 
                                onClick={() => setActiveEditor(activeEditor === 'magic_global' ? 'none' : 'magic_global')}
                                className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                    activeEditor === 'magic_global'
                                    ? 'bg-purple-700 text-white ring-2 ring-purple-300' 
                                    : 'bg-gray-800 text-purple-200 hover:bg-purple-900/30 border border-purple-500/30'
                                }`}
                            >
                                <span className="text-lg">✨</span>
                                <span>Edição Global</span>
                                <span className="text-[9px] opacity-60 font-normal hidden sm:block">Fundo, Estilo, Vibe</span>
                            </button>

                             {/* LOCAL BRUSH BUTTON */}
                             <button 
                                onClick={() => setActiveEditor('brush_local')}
                                className="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl text-xs font-bold transition-all shadow-sm bg-gray-800 text-indigo-200 hover:bg-indigo-900/30 border border-indigo-500/30"
                            >
                                <span className="text-lg">🖌️</span>
                                <span>Retoque Local</span>
                                <span className="text-[9px] opacity-60 font-normal hidden sm:block">Corrigir Detalhes</span>
                            </button>

                            {/* FILTERS BUTTON */}
                            <button 
                                onClick={() => setActiveEditor(activeEditor === 'filters' ? 'none' : 'filters')}
                                className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                    activeEditor === 'filters' 
                                    ? 'bg-cyan-700 text-white ring-2 ring-cyan-400' 
                                    : 'bg-gray-800 text-cyan-200 hover:bg-gray-700 border border-cyan-500/30'
                                }`}
                            >
                                <span className="text-lg">🎨</span>
                                <span>Filtros & Cor</span>
                                <span className="text-[9px] opacity-60 font-normal hidden sm:block">Brilho, Contraste</span>
                            </button>
                    </div>
                </div>
            )}

            {/* Magic Editor Panel (Global) */}
            {activeEditor === 'magic_global' && activeBaseImage && (
                <div className="p-4 bg-indigo-950/30 border-t border-indigo-500/20">
                    <MagicEditor 
                            currentImage={activeBaseImage}
                            onImageUpdate={handleMagicUpdate}
                            onClose={() => setActiveEditor('none')}
                    />
                </div>
            )}

            {/* Photo Editor Panel (Filters) */}
            {activeEditor === 'filters' && (
                <PhotoEditor 
                    settings={editorSettings}
                    onUpdate={setEditorSettings}
                />
            )}
       </div>

       {/* 2. AI ANALYSIS CARD (NEW) */}
       {activeEditor !== 'brush_local' && (
           <ImageAnalysis 
                data={analysisResult} 
                isLoading={isAnalyzing} 
                onAnalyze={handleRunAnalysis} 
           />
       )}
    </div>
  );
};

export default ResultDisplay;
