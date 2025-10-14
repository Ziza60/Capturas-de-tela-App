import React, { useState, useEffect } from 'react';
import { CloudinaryConfig } from '../types';

interface CloudinaryFormProps {
  onSave: (config: CloudinaryConfig) => void;
  initialConfig: CloudinaryConfig | null;
}

export const CloudinaryForm: React.FC<CloudinaryFormProps> = ({ onSave, initialConfig }) => {
  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setCloudName(initialConfig.cloudName);
      setUploadPreset(initialConfig.uploadPreset);
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cloudName.trim() && uploadPreset.trim()) {
      onSave({ cloudName, uploadPreset });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000); // Reset after 2s
    }
  };

  return (
    <details className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-lg mb-6 group" open>
        <summary className="text-lg font-medium text-slate-300 cursor-pointer list-image-none group-open:mb-4">
            <span className="group-open:hidden">▶</span>
            <span className="hidden group-open:inline">▼</span>
            Configuração do Cloudinary
        </summary>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label htmlFor="cloudName" className="block text-sm font-medium text-slate-400 mb-1">
                    Cloud Name
                </label>
                <input
                    id="cloudName"
                    type="text"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    placeholder="Seu cloud_name do Cloudinary"
                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>
            <div>
                 <label htmlFor="uploadPreset" className="block text-sm font-medium text-slate-400 mb-1">
                    Upload Preset Name
                </label>
                <input
                    id="uploadPreset"
                    type="text"
                    value={uploadPreset}
                    onChange={(e) => setUploadPreset(e.target.value)}
                    placeholder="Seu upload_preset (não assinado)"
                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>
            <button
                type="submit"
                className={`w-full font-bold py-2 px-4 rounded-md transition-colors duration-200 ${isSaved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
                {isSaved ? 'Salvo com Sucesso!' : 'Salvar Configuração'}
            </button>
        </form>
    </details>
  );
};