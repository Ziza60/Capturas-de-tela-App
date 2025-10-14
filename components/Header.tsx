import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-5 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
          Extrator de Capturas de Tela da Web
        </h1>
        <p className="text-slate-400 mt-2">Capture instantaneamente telas de páginas da web de alta qualidade a partir de URLs.</p>
      </div>
    </header>
  );
};