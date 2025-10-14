import React, { useState } from 'react';

interface UrlInputFormProps {
  onSubmit: (urlsText: string) => void;
  isProcessing: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isProcessing }) => {
  const [urlsText, setUrlsText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(urlsText);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="urls" className="block text-lg font-medium text-slate-300 mb-2">
        Insira as URLs (uma por linha)
      </label>
      <textarea
        id="urls"
        value={urlsText}
        onChange={(e) => setUrlsText(e.target.value)}
        placeholder="https://example.com\nhttps://google.com\nhttps://react.dev"
        rows={6}
        className="w-full p-3 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-y"
        disabled={isProcessing}
      />
      <button
        type="submit"
        disabled={isProcessing || !urlsText.trim()}
        className="mt-4 w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
          </>
        ) : (
          'Gerar Capturas de Tela'
        )}
      </button>
    </form>
  );
};