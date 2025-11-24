import React from 'react';

interface CreationsGalleryProps {
  creations: string[];
  onSelectCreation: (image: string) => void;
  currentImage: string | null;
}

const CreationsGallery: React.FC<CreationsGalleryProps> = ({ creations, onSelectCreation, currentImage }) => {
  if (creations.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-800 rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-cyan-300 mb-4">Suas Últimas Criações</h3>
      <div className="grid grid-cols-5 gap-3">
        {creations.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelectCreation(image)}
            className={`aspect-square rounded-md overflow-hidden transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400 ${
              currentImage === image ? 'ring-2 ring-cyan-400' : 'ring-1 ring-gray-700'
            }`}
          >
            <img
              src={`data:image/png;base64,${image}`}
              alt={`Creation ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CreationsGallery;