import React from 'react';
import { ScreenshotCard } from './ScreenshotCard';
import { Screenshot } from '../types';

interface ScreenshotGridProps {
  screenshots: Screenshot[];
  onUpload: (screenshotId: string) => void;
  isCloudinaryConfigured: boolean;
}

export const ScreenshotGrid: React.FC<ScreenshotGridProps> = ({ screenshots, onUpload, isCloudinaryConfigured }) => {
  if (screenshots.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl mt-8">
        <h3 className="text-xl font-semibold text-slate-300">Pronto para Capturar</h3>
        <p className="text-slate-400 mt-2">Suas capturas de tela geradas aparecerão aqui.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {screenshots.map((screenshot) => (
        <ScreenshotCard 
          key={screenshot.id} 
          screenshot={screenshot} 
          onUpload={onUpload}
          isCloudinaryConfigured={isCloudinaryConfigured}
        />
      ))}
    </div>
  );
};