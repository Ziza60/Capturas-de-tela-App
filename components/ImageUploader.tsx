
import React, { useRef, useState, useCallback } from 'react';
import type { UploadedFile } from '../types';
import { UploadIcon, CameraIcon } from './icons';
import CameraCapture from './CameraCapture';
import { preprocessImage } from '../utils/imageProcessing';

interface ImageUploaderProps {
  onImageUpload: (file: UploadedFile | UploadedFile[]) => void;
  clearImage: () => void;
  uploadedFile: UploadedFile | null;
  isBatchMode?: boolean;
  batchCount?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, clearImage, uploadedFile, isBatchMode, batchCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    setIsProcessing(true);
    
    if (isBatchMode) {
        // Batch Mode: Process all files
        try {
            const uploadedFiles = await Promise.all(fileArray.map(file => preprocessImage(file)));
            onImageUpload(uploadedFiles);
        } catch (error) {
            console.error("Error preprocessing files:", error);
            alert("Erro ao processar algumas imagens. Certifique-se de que são arquivos válidos.");
        } finally {
            setIsProcessing(false);
        }
    } else {
        // Single Mode: Process only the first file
        try {
            const file = await preprocessImage(fileArray[0]);
            onImageUpload(file);
        } catch (error) {
            console.error("Error preprocessing file:", error);
            alert("Erro ao processar a imagem.");
        } finally {
            setIsProcessing(false);
        }
    }
  }, [isBatchMode, onImageUpload]);

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
    onImageUpload(file);
    setIsCameraOpen(false);
  }

  const showSinglePreview = !isBatchMode && uploadedFile;

  if (showSinglePreview) {
    return (
      <div className="w-full max-w-md p-4 bg-gray-800 rounded-xl flex flex-col items-center shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3">
            Sua Foto
        </h3>
        <div className="relative group w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-gray-700">
            <img
                src={`data:${uploadedFile!.mimeType};base64,${uploadedFile!.base64}`}
                alt="Uploaded selfie"
                className="w-full h-full object-cover"
            />
           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
             <button
              onClick={clearImage}
              className="px-4 py-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              Trocar Imagem
            </button>
           </div>
        </div>
      </div>
    );
  }

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
            multiple={isBatchMode}
          />
          <UploadIcon className={`w-10 h-10 mb-2 transition-colors ${dragActive ? 'text-cyan-400' : 'text-gray-400'}`} />
          <p className="text-gray-300">
            {isProcessing ? (
                <span className="text-yellow-400 font-semibold animate-pulse">Otimizando imagens...</span>
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
            {isBatchMode ? 'Arraste todas as fotos da equipe aqui' : 'PNG, JPG ou WEBP'}
          </p>
        </form>

        {!isBatchMode && (
            <>
                <div className="flex items-center w-full my-4">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
                <div className="flex-grow border-t border-gray-600"></div>
                </div>
                
                <button
                onClick={() => setIsCameraOpen(true)}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 text-white rounded-lg transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400"
                >
                <CameraIcon className="w-6 h-6" />
                <span className="font-semibold">Tire uma Foto</span>
                </button>
            </>
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
