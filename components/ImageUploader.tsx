
import React, { useRef, useState, useCallback } from 'react';
import type { UploadedFile } from '../types';
import { UploadIcon, CameraIcon, CloseIcon, SparklesIcon } from './icons';
import CameraCapture from './CameraCapture';
import { preprocessImage } from '../utils/imageProcessing';

interface ImageUploaderProps {
  onImageUpload: (file: UploadedFile | UploadedFile[]) => void;
  clearImage: () => void;
  uploadedFile: UploadedFile | UploadedFile[] | null; // Supports single or array
  isBatchMode?: boolean;
  batchCount?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, clearImage, uploadedFile, isBatchMode, batchCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Toggle for Multi-Shot Mode
  const [isMultiShotActive, setIsMultiShotActive] = useState(false);

  // Helper to get array of files for display
  const fileList = Array.isArray(uploadedFile) ? uploadedFile : (uploadedFile ? [uploadedFile] : []);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    setIsProcessing(true);
    
    // Logic for Single Mode vs Batch/Multi-Shot
    if (isBatchMode) {
        // Batch Mode: Pass strictly as array for queue processing
        try {
            const uploadedFiles = await Promise.all(fileArray.map(file => preprocessImage(file)));
            onImageUpload(uploadedFiles);
        } catch (error) {
            console.error("Error preprocessing files:", error);
            alert("Erro ao processar imagens. Verifique se são arquivos válidos.");
        } finally {
            setIsProcessing(false);
        }
    } else {
        // Single/Multi-Shot Logic
        try {
            const newFiles = await Promise.all(fileArray.map(file => preprocessImage(file)));
            
            if (isMultiShotActive) {
                 // Multi-Shot: Append to existing
                 onImageUpload([...fileList, ...newFiles]);
            } else {
                 // Standard Mode: Replace existing (Single File logic)
                 // We pass as array for consistency with backend, but it's just 1 item
                 onImageUpload([newFiles[0]]);
            }
        } catch (error) {
            console.error("Error preprocessing file:", error);
            alert("Erro ao processar a imagem.");
        } finally {
            setIsProcessing(false);
        }
    }
  }, [isBatchMode, onImageUpload, fileList, isMultiShotActive]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handlePhotoCapture = (file: UploadedFile) => {
    if (isMultiShotActive) {
        onImageUpload([...fileList, file]);
    } else {
        onImageUpload([file]);
    }
    setIsCameraOpen(false);
  }
  
  const toggleMultiShot = () => {
      setIsMultiShotActive(!isMultiShotActive);
      // If turning off and we have multiple files, maybe warn or trim? 
      // For now, let's keep them but UI will look weird, so usually better to clear or keep list.
      // Let's just toggle the UI mode.
  };

  // --- MULTI-SHOT GALLERY VIEW (PRO MODE) ---
  if (isMultiShotActive && !isBatchMode) {
    return (
      <div className="w-full max-w-md p-4 bg-gray-800 rounded-xl flex flex-col items-center shadow-lg transition-all duration-300 border border-indigo-500/30">
        <div className="flex justify-between w-full items-center mb-3">
             <h3 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Multi-Shot Reference
             </h3>
             <button
                onClick={toggleMultiShot}
                className="text-xs text-gray-400 hover:text-white underline"
             >
                Voltar
             </button>
        </div>

        {/* GUIDANCE BANNER - USER SPECIFIC TEXT */}
        <div className="w-full bg-indigo-900/40 border border-indigo-500/40 rounded-lg p-3 mb-4 flex items-start gap-3">
            <span className="text-xl">💎</span>
            <div>
                <p className="text-xs font-bold text-white uppercase">Referência Multi-Shot Ativa</p>
                <p className="text-[11px] text-indigo-200 leading-tight mt-1">
                    Envie de 3 a 5 fotos (frente, perfil, selfie) para aumentar a semelhança facial em até 200%. A IA criará um modelo 3D do seu rosto.
                </p>
            </div>
        </div>
        
        {/* GRID VIEW */}
        <div className="grid grid-cols-3 gap-2 w-full mb-3">
            {fileList.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-700 border border-gray-600 group">
                    <img
                        src={`data:${file.mimeType};base64,${file.base64}`}
                        alt={`Ref ${idx}`}
                        className="w-full h-full object-cover"
                    />
                    {/* Badge for Primary */}
                    {idx === 0 && <div className="absolute top-0 left-0 bg-cyan-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br">PRINCIPAL</div>}
                    
                    {/* Remove Item Button */}
                    <button 
                        onClick={() => {
                            const newList = fileList.filter((_, i) => i !== idx);
                            onImageUpload(newList);
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <CloseIcon className="w-3 h-3" />
                    </button>
                </div>
            ))}
            
            {/* ADD MORE BUTTON */}
            {fileList.length < 5 && (
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-500 hover:border-cyan-400 hover:bg-gray-700/50 flex flex-col items-center justify-center transition-all group"
                 >
                    <UploadIcon className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 mb-1" />
                    <span className="text-[10px] text-gray-400 group-hover:text-white font-bold">+ Foto</span>
                 </button>
            )}
        </div>

        {/* Hidden Input */}
        <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
            multiple
        />
        
         {/* Camera Option */}
         {fileList.length < 5 && (
             <button
                onClick={() => setIsCameraOpen(true)}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2"
            >
                <CameraIcon className="w-4 h-4" />
                Adicionar Selfie da Câmera
            </button>
        )}

        {isCameraOpen && (
            <CameraCapture 
              onClose={() => setIsCameraOpen(false)}
              onPhotoCapture={handlePhotoCapture}
            />
        )}
      </div>
    );
  }

  // --- DEFAULT SINGLE UPLOAD SCREEN ---
  return (
    <>
      <div className="w-full max-w-md p-4 bg-gray-800 rounded-xl flex flex-col items-center shadow-lg">
        <div className="flex justify-between w-full items-center mb-3">
            <h3 className="text-lg font-semibold text-cyan-300">
                {isBatchMode ? '1. Carregar Fotos da Equipe' : '1. Carregue sua Foto'}
            </h3>
            {isBatchMode && batchCount && batchCount > 0 ? (
                <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full font-bold">
                    {batchCount} fotos na fila
                </span>
            ) : null}
        </div>
        
        {/* SINGLE IMAGE PREVIEW (IF UPLOADED AND NOT BATCH) */}
        {!isBatchMode && fileList.length > 0 ? (
             <div className="w-full mb-4 relative group">
                 <div className="aspect-[4/5] w-full bg-black rounded-lg overflow-hidden border border-gray-600 shadow-inner relative">
                      <img
                        src={`data:${fileList[0].mimeType};base64,${fileList[0].base64}`}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      {/* Change Photo Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                           <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-transform"
                           >
                               Trocar Foto
                           </button>
                           <button 
                                onClick={clearImage}
                                className="text-xs text-red-400 hover:text-white underline"
                           >
                               Remover
                           </button>
                      </div>
                 </div>
             </div>
        ) : (
            /* DROPZONE */
            <form
            className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 transition-all duration-300 cursor-pointer ${
                dragActive 
                ? 'border-cyan-400 bg-gray-700 scale-105' 
                : 'border-gray-500 hover:border-cyan-400 hover:bg-gray-700/50'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
                multiple={isBatchMode || isMultiShotActive} 
            />
            <UploadIcon className={`w-10 h-10 mb-2 transition-colors ${dragActive ? 'text-cyan-400' : 'text-gray-400'}`} />
            <p className="text-gray-300">
                {isProcessing ? (
                    <span className="text-yellow-400 font-semibold animate-pulse">Otimizando imagem...</span>
                ) : (
                    isBatchMode && batchCount && batchCount > 0 ? (
                        <span className="font-semibold text-green-400">Adicionar mais fotos</span>
                    ) : (
                        <>
                            <span className="font-semibold text-cyan-400">Clique para carregar</span> ou arraste
                        </>
                    )
                )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
                {isBatchMode ? 'Arraste todas as fotos da equipe aqui' : 'Selfies com boa iluminação funcionam melhor'}
            </p>
            </form>
        )}

        {/* CONTROLS AREA */}
        {!isBatchMode && (
            <div className="w-full space-y-3 mt-3">
                {/* PRO TOGGLE */}
                {!isMultiShotActive && (
                    <button
                        onClick={toggleMultiShot}
                        className="w-full py-2 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/40 rounded-lg flex items-center justify-center gap-2 hover:from-indigo-800 hover:to-purple-800 transition-all shadow-md group"
                    >
                        <SparklesIcon className="w-4 h-4 text-purple-300 group-hover:text-white animate-pulse" />
                        <span className="text-xs font-bold text-indigo-100 group-hover:text-white">
                            Ativar Multi-Shot Reference (Pro)
                        </span>
                    </button>
                )}

                {/* OR SEPARATOR (Only if no file uploaded yet) */}
                {fileList.length === 0 && (
                     <div className="flex items-center w-full my-2">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs">OU</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>
                )}
                
                {/* CAMERA BUTTON */}
                {fileList.length === 0 && (
                    <button
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 text-white rounded-lg transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400"
                    >
                    <CameraIcon className="w-5 h-5" />
                    <span className="font-semibold text-sm">Tire uma Foto</span>
                    </button>
                )}
            </div>
        )}
        
        {isBatchMode && batchCount && batchCount > 0 && (
            <button 
                onClick={clearImage}
                className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
            >
                Limpar toda a fila ({batchCount})
            </button>
        )}
      </div>

      {isCameraOpen && (
        <CameraCapture 
          onClose={() => setIsCameraOpen(false)}
          onPhotoCapture={handlePhotoCapture}
        />
      )}
    </>
  );
};

export default ImageUploader;
