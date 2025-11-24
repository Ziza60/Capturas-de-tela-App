
import React from 'react';
import type { AspectRatioOption } from '../types';

interface AspectRatioSelectorProps {
  options: AspectRatioOption[];
  selectedOption: AspectRatioOption | null;
  onOptionSelect: (option: AspectRatioOption) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ options, selectedOption, onOptionSelect }) => {
  return (
    <div className="w-full max-w-md p-4 bg-gray-800 rounded-xl flex flex-col items-center shadow-lg">
       <h3 className="text-lg font-semibold text-cyan-300 mb-4 self-start">5. Formato da Imagem</h3>
       <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onOptionSelect(option)}
            className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 text-center ${
              selectedOption?.id === option.id
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            <span className="font-semibold text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;
