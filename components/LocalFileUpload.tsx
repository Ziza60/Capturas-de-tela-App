import React, { useState } from 'react';
import { LocalFile } from '../types';
import { LocalFileCard } from './LocalFileCard';

interface LocalFileUploadProps {
  files: LocalFile[];
  onFileSelect: (files: FileList | null) => void;
  onUpload: () => void;
  isCloudinaryConfigured: boolean;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H13a4 4 0 014 4v1.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 00-.707.293H7z" /></svg>
);

export const LocalFileUpload: React.FC<LocalFileUploadProps> = ({ files, onFileSelect, onUpload, isCloudinaryConfigured }) => {
    const [isDragging, setIsDragging] = useState(false);
    const hasPendingFiles = files.some(f => f.uploadStatus === 'IDLE');
    const isUploading = files.some(f => f.uploadStatus === 'UPLOADING');

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        onFileSelect(e.dataTransfer.files);
    };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg mb-8">
      <h2 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">Upload de Arquivos Locais</h2>
      
      <label 
        htmlFor="file-upload" 
        className={`flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-900 border-2 border-slate-700 border-dashed rounded-md cursor-pointer hover:bg-slate-800/60 ${isDragging ? 'border-indigo-500 bg-slate-800' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon />
        <p className="text-sm text-slate-400">
            <span className="font-semibold text-indigo-400">Clique para selecionar</span> ou arraste e solte
        </p>
        <p className="text-xs text-slate-500">Imagens (JPG, PNG, WEBP, etc.)</p>
        <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={(e) => onFileSelect(e.target.files)} accept="image/*" />
      </label>

      {files.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {files.map(file => <LocalFileCard key={file.id} localFile={file} />)}
            </div>
             <button
                onClick={onUpload}
                disabled={!isCloudinaryConfigured || !hasPendingFiles || isUploading}
                title={!isCloudinaryConfigured ? "Configure o Cloudinary primeiro" : ""}
                className="mt-6 w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
            >
                {isUploading ? 'Enviando...' : `Enviar ${files.filter(f=>f.uploadStatus === 'IDLE').length} Arquivo(s) para o Cloudinary`}
            </button>
          </>
      )}
    </div>
  );
};
