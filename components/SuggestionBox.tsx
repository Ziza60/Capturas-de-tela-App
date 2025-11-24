import React from 'react';
import { LightbulbIcon, LoadingSpinner } from './icons';

interface SuggestionBoxProps {
  isLoading: boolean;
  suggestions: string[];
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ isLoading, suggestions }) => {
  const hasSuggestions = suggestions && suggestions.length > 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-md p-4 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
        <LoadingSpinner className="w-5 h-5 text-cyan-400 mr-3" />
        <span className="text-gray-400">Analisando sua foto para dar dicas...</span>
      </div>
    );
  }

  if (!hasSuggestions) {
    return null; // Don't render anything if there are no suggestions or it's not loading
  }

  return (
    <div className="w-full max-w-md p-4 bg-gray-800 rounded-xl flex flex-col items-center shadow-lg">
      <div className="w-full">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
          <LightbulbIcon className="w-6 h-6 mr-2 text-yellow-300" />
          Dicas para um Retrato Melhor
        </h3>
        <ul className="space-y-2 list-disc list-inside text-gray-300">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="text-sm">{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SuggestionBox;