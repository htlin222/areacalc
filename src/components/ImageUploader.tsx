import React, { useRef, useState } from 'react';
import { Upload, Move, Sliders, ChevronDown, ChevronRight } from 'lucide-react';
import { BackgroundImage } from '../types';

interface ImageUploaderProps {
  backgroundImage: BackgroundImage | null;
  setBackgroundImage: (image: BackgroundImage | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  backgroundImage,
  setBackgroundImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBackgroundImage({
          image: img,
          x: 0,
          y: 0,
          opacity: 1.0,
          scale: 1.0
        });
        setIsExpanded(true); // Auto-expand when image is uploaded
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsExpanded(false);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!backgroundImage) return;
    setBackgroundImage({
      ...backgroundImage,
      [axis]: value
    });
  };

  const handleOpacityChange = (value: number) => {
    if (!backgroundImage) return;
    setBackgroundImage({
      ...backgroundImage,
      opacity: value
    });
  };

  const handleScaleChange = (value: number) => {
    if (!backgroundImage) return;
    setBackgroundImage({
      ...backgroundImage,
      scale: value
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-300 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={toggleExpanded}
      >
        <h3 className="font-semibold flex items-center">
          <Upload size={16} className="mr-1" />
          Background Image
          {backgroundImage && <span className="ml-2 text-xs text-green-600">(Loaded)</span>}
        </h3>
        <div className="text-gray-500">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="space-y-3 mt-3">
          <div className="flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm w-full"
            />
          </div>
          
          {backgroundImage && (
            <>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 flex items-center">
                    <Move size={14} className="mr-1" />
                    X Position:
                  </label>
                  <input
                    type="range"
                    min="-500"
                    max="500"
                    value={backgroundImage.x}
                    onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-right">{backgroundImage.x}px</div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 flex items-center">
                    <Move size={14} className="mr-1" />
                    Y Position:
                  </label>
                  <input
                    type="range"
                    min="-500"
                    max="500"
                    value={backgroundImage.y}
                    onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-right">{backgroundImage.y}px</div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 flex items-center">
                    <Sliders size={14} className="mr-1" />
                    Opacity:
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={backgroundImage.opacity}
                    onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-right">{Math.round(backgroundImage.opacity * 100)}%</div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 flex items-center">
                    <Sliders size={14} className="mr-1" />
                    Scale:
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={backgroundImage.scale}
                    onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-right">{backgroundImage.scale.toFixed(1)}x</div>
                </div>
              </div>
              
              <button
                className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full"
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
            </>
          )}
        </div>
      )}
      
      {!isExpanded && backgroundImage && (
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>Position: ({backgroundImage.x}, {backgroundImage.y})</span>
          <span>Opacity: {Math.round(backgroundImage.opacity * 100)}%</span>
          <span>Scale: {backgroundImage.scale.toFixed(1)}x</span>
        </div>
      )}
    </div>
  );
};
