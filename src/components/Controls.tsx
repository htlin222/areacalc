import React from 'react';
import { Plus, Minus, Calculator } from 'lucide-react';

interface ControlsProps {
  hexSize: number;
  setHexSize: (size: number) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  calculateAreaProportions: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  hexSize,
  setHexSize,
  brushSize,
  setBrushSize,
  calculateAreaProportions
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Hexagon Size:</label>
        <div className="flex items-center space-x-2">
          <button 
            className="bg-blue-500 text-white p-1 rounded" 
            onClick={() => setHexSize(Math.max(5, hexSize - 1))}
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center">{hexSize}</span>
          <button 
            className="bg-blue-500 text-white p-1 rounded" 
            onClick={() => setHexSize(Math.min(40, hexSize + 1))}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Brush Size:</label>
        <div className="flex items-center space-x-2">
          <button 
            className="bg-blue-500 text-white p-1 rounded" 
            onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center">{brushSize}</span>
          <button 
            className="bg-blue-500 text-white p-1 rounded" 
            onClick={() => setBrushSize(Math.min(5, brushSize + 1))}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <button 
        className="bg-green-500 text-white px-3 py-2 rounded flex items-center space-x-1"
        onClick={calculateAreaProportions}
      >
        <Calculator size={16} />
        <span>Calculate Areas</span>
      </button>
    </div>
  );
};
