import React from 'react';
import { Info, MousePointer, Layers, Sliders, Calculator, Image, Eraser } from 'lucide-react';

export const Instructions: React.FC = () => {
  return (
    <div className="text-sm text-gray-600 mt-2 bg-white p-4 rounded-lg border border-gray-300">
      <h3 className="font-semibold flex items-center mb-3">
        <Info size={16} className="mr-1" />
        Instructions
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Drawing & Layers</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li className="flex items-start">
              <MousePointer size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Click on the grid to draw with the selected layer</span>
            </li>
            <li className="flex items-start">
              <Eraser size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Use the eraser tool to remove hexagons from visible layers</span>
            </li>
            <li className="flex items-start">
              <Layers size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Add layers using the + button in the Layers panel</span>
            </li>
            <li className="flex items-start">
              <Sliders size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Adjust hexagon and brush size using the controls above</span>
            </li>
            <li className="flex items-start">
              <Calculator size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Click "Calculate Areas" to see the proportion of each layer</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Background & Visibility</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li className="flex items-start">
              <Image size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Upload an image to use as background reference</span>
            </li>
            <li className="flex items-start">
              <Sliders size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Adjust image position, scale and opacity as needed</span>
            </li>
            <li className="flex items-start">
              <Layers size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Toggle layer visibility using the eye icon</span>
            </li>
            <li className="flex items-start">
              <MousePointer size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Hide the grid to view only the background image</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
