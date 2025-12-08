
import React, { useRef, useState, useEffect } from 'react';
import { LoadingSpinner, SparklesIcon } from './icons';
import { editGeneratedImage } from '../services/geminiService';

interface BrushEditorProps {
  currentImage: string;
  onImageUpdate: (newImage: string) => void;
  onClose: () => void;
}

const BrushEditor: React.FC<BrushEditorProps> = ({ currentImage, onImageUpdate, onClose }) => {
  const [brushSize, setBrushSize] = useState(20);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize Canvas Size to match Image
  useEffect(() => {
    if (imageRef.current && canvasRef.current && containerRef.current) {
        const img = imageRef.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;

        const resizeCanvas = () => {
             canvas.width = img.clientWidth;
             canvas.height = img.clientHeight;
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 ctx.clearRect(0, 0, canvas.width, canvas.height);
             }
        };

        // Wait for image load
        img.onload = resizeCanvas;
        // Also resize on window resize
        window.addEventListener('resize', resizeCanvas);
        
        // Initial check if already loaded
        if (img.complete) resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [currentImage]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDrawing(true);
      draw(e);
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
          // Check if canvas has any content
          const ctx = canvas.getContext('2d');
          // Simple check: set hasMask to true if we drew anything
          setHasMask(true); 
      }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);

      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Inpainting Mask Standard: White = Selected, Black/Transparent = Protected
      // We draw White on Transparent for UI, then composite later
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; 
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'white';

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
  };

  // Reset path on mouse up
  useEffect(() => {
     const handleUp = () => {
         if (isDrawing && canvasRef.current) {
             const ctx = canvasRef.current.getContext('2d');
             ctx?.beginPath();
         }
         setIsDrawing(false);
     }
     window.addEventListener('mouseup', handleUp);
     window.addEventListener('touchend', handleUp);
     return () => {
         window.removeEventListener('mouseup', handleUp);
         window.removeEventListener('touchend', handleUp);
     }
  }, [isDrawing]);


  const clearMask = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setHasMask(false);
      }
  };

  const handleExecute = async () => {
      if (!prompt.trim() || !hasMask || !imageRef.current || !canvasRef.current) return;

      setIsProcessing(true);

      try {
          // 1. Prepare Mask Image
          // Gemini needs a mask where White is edit area, Black is protected
          // Our canvas is White lines on Transparent.
          // Create a temp canvas to composite standard black/white mask
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = imageRef.current.naturalWidth;
          tempCanvas.height = imageRef.current.naturalHeight;
          const tCtx = tempCanvas.getContext('2d');
          
          if (tCtx) {
             // Fill Black (Protected)
             tCtx.fillStyle = 'black';
             tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
             
             // Draw the mask from the UI canvas scaled to natural size
             tCtx.drawImage(canvasRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
          }

          const maskBase64 = tempCanvas.toDataURL('image/png').split(',')[1];
          
          // 2. Execute
          const newImage = await editGeneratedImage(currentImage, prompt, maskBase64);
          onImageUpdate(newImage);
          onClose();

      } catch (err) {
          alert("Erro ao realizar o retoque. Tente novamente.");
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-t border-gray-700 animate-fade-in">
        
        {/* HELP HEADER */}
        <div className="bg-indigo-900/30 p-4 border-b border-indigo-500/20 flex justify-between items-center">
            <div>
                 <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🖌️</span> Retoque Local (Inpainting)
                 </h3>
                 <p className="text-xs text-indigo-200 mt-1">
                    Pinte a área que deseja alterar e descreva a mudança.
                 </p>
            </div>
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-white">Fechar</button>
        </div>

        {/* WORKSPACE */}
        <div ref={containerRef} className="relative w-full bg-black/50 flex-grow flex items-center justify-center overflow-hidden p-4 min-h-[300px]">
            <div className="relative shadow-2xl">
                 <img 
                    ref={imageRef}
                    src={`data:image/png;base64,${currentImage}`}
                    alt="Target"
                    className="max-h-[50vh] object-contain pointer-events-none select-none"
                 />
                 <canvas
                    ref={canvasRef}
                    className="absolute inset-0 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                 />
            </div>
            
            {/* Floating Brush Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-4 shadow-xl border border-gray-600">
                <span className="text-xs text-gray-300 font-bold">Tamanho</span>
                <input 
                    type="range" min="5" max="50" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
                <div 
                    className="w-4 h-4 rounded-full bg-white border border-gray-400"
                    style={{ width: brushSize / 2, height: brushSize / 2 }}
                ></div>
                <div className="w-px h-4 bg-gray-600"></div>
                <button onClick={clearMask} className="text-xs text-red-400 hover:text-white font-medium">Limpar</button>
            </div>
        </div>

        {/* INPUT FOOTER */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={hasMask ? "Ex: Corrigir gravata, remover mancha..." : "Pinte uma área primeiro..."}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-500"
                    disabled={!hasMask || isProcessing}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                 />
                 <button 
                    onClick={handleExecute}
                    disabled={!hasMask || !prompt.trim() || isProcessing}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                 >
                    {isProcessing ? <LoadingSpinner className="w-4 h-4 text-white" /> : <SparklesIcon className="w-4 h-4" />}
                    {isProcessing ? 'Processando...' : 'Aplicar'}
                 </button>
             </div>
             {!hasMask && (
                 <p className="text-[10px] text-yellow-500 mt-2 text-center animate-pulse">
                     ⚠️ Use o pincel na imagem acima para selecionar o que mudar.
                 </p>
             )}
        </div>

    </div>
  );
};

export default BrushEditor;
