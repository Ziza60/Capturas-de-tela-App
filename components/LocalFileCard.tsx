import React, { useState } from 'react';
import { LocalFile, UploadStatus } from '../types';
import { Loader } from './Loader';

interface LocalFileCardProps {
    localFile: LocalFile;
}

const CopyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> );

export const LocalFileCard: React.FC<LocalFileCardProps> = ({ localFile }) => {
    const { file, previewUrl, uploadStatus, cloudinaryUrl, uploadError } = localFile;
    const [copyText, setCopyText] = useState('Copiar');

    const handleCopy = () => {
        if (!cloudinaryUrl) return;
        navigator.clipboard.writeText(cloudinaryUrl).then(() => {
            setCopyText('Copiado!');
            setTimeout(() => setCopyText('Copiar'), 2000);
        });
    };
    
    const renderOverlay = () => {
        switch (uploadStatus) {
            case UploadStatus.UPLOADING:
                return (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-xs">
                        <Loader />
                        <span className="mt-1">Enviando...</span>
                    </div>
                );
            case UploadStatus.SUCCESS:
                 return (
                    <div className="absolute inset-0 bg-green-900/80 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                );
            case UploadStatus.ERROR:
                 return (
                    <div className="absolute inset-0 bg-red-900/80 flex flex-col text-center items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         <p className="text-xs text-red-300 mt-1 truncate">{uploadError}</p>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-sm flex flex-col">
            <div className="aspect-video bg-slate-900 relative">
                <img src={previewUrl} alt={file.name} className="object-cover w-full h-full" />
                {renderOverlay()}
            </div>
            <div className="p-2 text-xs flex-grow flex flex-col justify-between">
                <p className="text-slate-400 break-all truncate" title={file.name}>{file.name}</p>
                {uploadStatus === UploadStatus.SUCCESS && cloudinaryUrl && (
                     <button onClick={handleCopy} className="mt-2 w-full flex items-center justify-center gap-1.5 bg-teal-600 text-white font-semibold py-1.5 px-2 rounded-md hover:bg-teal-500 transition-colors duration-200 text-xs">
                        <CopyIcon/> {copyText}
                    </button>
                )}
            </div>
        </div>
    );
};
