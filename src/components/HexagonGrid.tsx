import React, { useRef, useState, useEffect } from 'react';
import { Controls } from './Controls';
import { LayerPanel } from './LayerPanel';
import { CalculationResultPanel } from './CalculationResult';
import { Instructions } from './Instructions';
import { ImageUploader } from './ImageUploader';
import { GridOffsetControls } from './GridOffsetControls';
import { Footer } from './Footer';
import { Eye, EyeOff, Eraser } from 'lucide-react';
import { useHexagonGrid } from '../hooks/useHexagonGrid';
import '../assets/cursor.css';

export const HexagonGrid: React.FC = () => {
  const [canvasWidth, setCanvasWidth] = useState<number>(800);
  const [canvasHeight, setCanvasHeight] = useState<number>(600);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    hexSize,
    setHexSize,
    brushSize,
    setBrushSize,
    gridOffsetX,
    setGridOffsetX,
    gridOffsetY,
    setGridOffsetY,
    linkToImage,
    setLinkToImage,
    layers,
    activeLayerId,
    setActiveLayerId,
    calculationResult,
    backgroundImage,
    setBackgroundImage,
    gridVisible,
    toggleGridVisibility,
    toggleLayerVisibility,
    renameLayer,
    updateLayerOpacity,
    isErasing,
    toggleEraser,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
    addLayer,
    deleteLayer,
    calculateAreaProportions
  } = useHexagonGrid({ gridRef, canvasWidth, canvasHeight });

  // Function to update canvas dimensions based on container size
  const updateCanvasDimensions = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setCanvasWidth(width);
      setCanvasHeight(height);
    }
  };

  // Initialize canvas size and set up resize listener
  useEffect(() => {
    updateCanvasDimensions();
    
    const handleResize = () => {
      updateCanvasDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle keyboard events for grid offset adjustment and layer selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys if not typing in an input field
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const offsetStep = 5; // Pixels to move per keypress
      
      switch (e.key.toLowerCase()) {
        case 'w': // Move grid up
          setGridOffsetY(gridOffsetY - offsetStep);
          break;
        case 's': // Move grid down
          setGridOffsetY(gridOffsetY + offsetStep);
          break;
        case 'a': // Move grid left
          setGridOffsetX(gridOffsetX - offsetStep);
          break;
        case 'd': // Move grid right
          setGridOffsetX(gridOffsetX + offsetStep);
          break;
        case ' ': // Spacebar - toggle through layers
          if (layers.length > 0) {
            // Find the index of the current active layer
            const currentIndex = layers.findIndex(layer => layer.id === activeLayerId);
            // Calculate the next index, wrapping around to the beginning if necessary
            const nextIndex = (currentIndex + 1) % layers.length;
            // Set the next layer as active
            setActiveLayerId(layers[nextIndex].id);
            e.preventDefault(); // Prevent scrolling with spacebar
          }
          break;
        default:
          return; // Exit for other keys
      }
      
      // Prevent default behavior for these keys
      if (e.key !== ' ') {
        e.preventDefault();
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gridOffsetX, gridOffsetY, setGridOffsetX, setGridOffsetY, layers, activeLayerId, setActiveLayerId]);

  return (
    <div className="flex flex-col space-y-4 bg-gray-100 p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800">Pathology Area Calculator</h1>
      
      <div className="flex items-center justify-between">
        <Controls 
          hexSize={hexSize}
          setHexSize={setHexSize}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          calculateAreaProportions={calculateAreaProportions}
        />
        
        <div className="flex space-x-2">
          <button
            className={`flex items-center space-x-1 px-3 py-2 rounded ${
              isErasing 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={toggleEraser}
            title={isErasing ? "Switch to drawing mode" : "Switch to eraser mode"}
          >
            <Eraser size={16} />
            <span>{isErasing ? "Erasing" : "Eraser"}</span>
          </button>
          
          <button
            className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded"
            onClick={toggleGridVisibility}
            title={gridVisible ? "Hide hexagon grid" : "Show hexagon grid"}
          >
            {gridVisible ? (
              <>
                <EyeOff size={16} />
                <span>Hide Grid</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span>Show Grid</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex">
        <div ref={containerRef} className="w-3/4 border border-gray-300 bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <canvas 
            ref={gridRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            className={`w-full h-full ${isErasing ? 'cursor-eraser' : 'cursor-draw'}`}
          />
        </div>
        
        <div className="w-1/4 ml-4">
          <ImageUploader 
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          
          <GridOffsetControls
            gridOffsetX={gridOffsetX}
            setGridOffsetX={setGridOffsetX}
            gridOffsetY={gridOffsetY}
            setGridOffsetY={setGridOffsetY}
            linkToImage={linkToImage}
            setLinkToImage={setLinkToImage}
          />
          
          <LayerPanel 
            layers={layers}
            activeLayerId={activeLayerId}
            setActiveLayerId={setActiveLayerId}
            addLayer={addLayer}
            deleteLayer={deleteLayer}
            toggleLayerVisibility={toggleLayerVisibility}
            renameLayer={renameLayer}
            updateLayerOpacity={updateLayerOpacity}
          />
          
          <CalculationResultPanel calculationResult={calculationResult} />
        </div>
      </div>
      
      <Instructions />
      
      <Footer />
    </div>
  );
};
