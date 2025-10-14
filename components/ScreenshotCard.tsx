import React, { useState } from 'react';
import { Screenshot, ScreenshotStatus, UploadStatus } from '../types';
import { Loader } from './Loader';

interface ScreenshotCardProps {
  screenshot: Screenshot;
  onUpload: (screenshotId: string) => void;
  isCloudinaryConfigured: boolean;
}

const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> );
const CloudIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H13a4 4 0 014 4v1.586a1 1 0 01-.293.707l-2.414 2.414a1 1 0 00-.707.293H7z" /></svg> );
const CopyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> );

export const ScreenshotCard: React.FC<ScreenshotCardProps> = ({ screenshot, onUpload, isCloudinaryConfigured }) => {
  const { id, url, status, imageData, error, uploadStatus, cloudinaryUrl, uploadError } = screenshot;
  const [copyText, setCopyText] = useState('Copiar URL');

  const handleDownload = () => {
    if (!imageData) return;
    const link = document.createElement('a');
    link.href = imageData;
    const urlFilename = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    link.download = `captura-${urlFilename}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = () => {
    onUpload(id);
  };
  
  const handleCopy = () => {
    if (!cloudinaryUrl) return;
    navigator.clipboard.writeText(cloudinaryUrl).then(() => {
        setCopyText('Copiado!');
        setTimeout(() => setCopyText('Copiar URL'), 2000);
    });
  };

  const renderContent = () => {
    switch (status) {
      case ScreenshotStatus.PENDING:
        return <div className="flex flex-col items-center justify-center h-full"><Loader /><p className="mt-2 text-slate-400">Capturando...</p></div>;
      case ScreenshotStatus.SUCCESS:
        return imageData ? <img src={imageData} alt={`Captura de tela de ${url}`} className="object-cover w-full h-full rounded-t-lg" /> : null;
      case ScreenshotStatus.ERROR:
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-semibold">Falha na Captura</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderActions = () => {
    if (status !== ScreenshotStatus.SUCCESS) return null;

    if (uploadStatus === UploadStatus.SUCCESS && cloudinaryUrl) {
      return (
        <div className="mt-3 flex flex-col gap-2">
            <div className="bg-slate-700 p-2 rounded-md text-center">
                <p className="text-xs text-green-400 font-bold">Salvo no Cloudinary!</p>
                <input type="text" readOnly value={cloudinaryUrl} className="text-xs bg-slate-800 text-slate-300 w-full p-1 mt-1 rounded border border-slate-600 truncate"/>
            </div>
            <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-teal-500 transition-colors duration-200">
                <CopyIcon/> {copyText}
            </button>
        </div>
      );
    }
    
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={handleDownload} disabled={uploadStatus === UploadStatus.UPLOADING} className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200">
          <DownloadIcon /> Baixar
        </button>
        <button onClick={handleUpload} disabled={!isCloudinaryConfigured || uploadStatus === UploadStatus.UPLOADING} title={!isCloudinaryConfigured ? "Configure o Cloudinary primeiro" : "Salvar no Cloudinary"} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200">
            {uploadStatus === UploadStatus.UPLOADING ? <><Loader/>Enviando...</> : <><CloudIcon/>Salvar</>}
        </button>
        {uploadStatus === UploadStatus.ERROR && <p className="col-span-2 text-xs text-red-400 text-center mt-1">{uploadError}</p>}
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-cyan-500/10">
      <div className="aspect-video bg-slate-900 flex items-center justify-center">
        {renderContent()}
      </div>
      <div className="p-4 bg-slate-800/50 flex-grow flex flex-col justify-between">
        <p className="text-sm text-slate-400 break-all truncate" title={url}>{url}</p>
        {renderActions()}
      </div>
    </div>
  );
};