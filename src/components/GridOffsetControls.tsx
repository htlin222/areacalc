import React from 'react';
import { Move, Link } from 'lucide-react';

interface GridOffsetControlsProps {
  gridOffsetX: number;
  setGridOffsetX: (offset: number) => void;
  gridOffsetY: number;
  setGridOffsetY: (offset: number) => void;
  linkToImage: boolean;
  setLinkToImage: (linked: boolean) => void;
}

export const GridOffsetControls: React.FC<GridOffsetControlsProps> = ({
  gridOffsetX,
  setGridOffsetX,
  gridOffsetY,
  setGridOffsetY,
  linkToImage,
  setLinkToImage
}) => {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-300 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold flex items-center">
          <Move size={16} className="mr-1" />
          Grid Offset
        </h3>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="linkToImage"
            checked={linkToImage}
            onChange={(e) => setLinkToImage(e.target.checked)}
            className="mr-1"
          />
          <label 
            htmlFor="linkToImage" 
            className="flex items-center text-sm cursor-pointer"
            title="Link grid offset to image position"
          >
            <Link size={14} className="mr-1" />
            Link to Image
          </label>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 flex items-center">
            <Move size={14} className="mr-1" />
            X Offset:
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="-200"
              max="200"
              value={gridOffsetX}
              onChange={(e) => setGridOffsetX(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs ml-2 w-10 text-right">{gridOffsetX}px</div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 flex items-center">
            <Move size={14} className="mr-1" />
            Y Offset:
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="-200"
              max="200"
              value={gridOffsetY}
              onChange={(e) => setGridOffsetY(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs ml-2 w-10 text-right">{gridOffsetY}px</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 italic mb-2">
          Tip: Use WASD keys to adjust grid position (W: up, A: left, S: down, D: right)
        </div>
        
        <button
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 rounded text-sm w-full"
          onClick={() => {
            setGridOffsetX(0);
            setGridOffsetY(0);
          }}
        >
          Reset Offset
        </button>
      </div>
    </div>
  );
};
