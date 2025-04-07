import { useState, useEffect, RefObject } from 'react';
import { Layer, CalculationResult, BackgroundImage } from '../types';
import { getHexCoordinates, drawHexagon, findClosestHexagon, getRandomColor } from '../utils/hexagonUtils';

interface UseHexagonGridProps {
  gridRef: RefObject<HTMLCanvasElement>;
  canvasWidth: number;
  canvasHeight: number;
}

export const useHexagonGrid = ({ gridRef, canvasWidth, canvasHeight }: UseHexagonGridProps) => {
  const [hexSize, setHexSize] = useState<number>(20);
  const [brushSize, setBrushSize] = useState<number>(1);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, name: 'Layer 1', color: '#FF5252', cells: {}, visible: true }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<number>(1);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage | null>(null);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [isErasing, setIsErasing] = useState<boolean>(false);

  const drawGrid = () => {
    if (!gridRef.current) return;
    
    const canvas = gridRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if available
    if (backgroundImage) {
      ctx.save();
      ctx.globalAlpha = backgroundImage.opacity;
      
      // Calculate scaled dimensions
      const scaledWidth = backgroundImage.image.width * backgroundImage.scale;
      const scaledHeight = backgroundImage.image.height * backgroundImage.scale;
      
      // Draw the image at the specified position with scaling
      ctx.drawImage(
        backgroundImage.image,
        backgroundImage.x,
        backgroundImage.y,
        scaledWidth,
        scaledHeight
      );
      
      ctx.restore();
    }
    
    if (gridVisible) {
      // Calculate how many hexagons we need to cover the entire canvas
      // Adding extra columns to ensure we cover the entire width
      const hexWidth = hexSize * 1.75;
      const hexHeight = Math.sqrt(3) * hexSize * 0.9;
      
      const rows = Math.ceil(canvasHeight / hexHeight) + 1;
      const cols = Math.ceil(canvasWidth / hexWidth) + 4; // Add extra columns to fill the right side
      
      // Draw base grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const { x, y, size } = getHexCoordinates(hexSize, r, c);
          // Only draw if the hexagon is at least partially within the canvas
          if (x + size > 0 && x - size < canvasWidth && y + size > 0 && y - size < canvasHeight) {
            drawHexagon(ctx, x, y, size);
          }
        }
      }
      
      // Draw filled cells for each layer - draw in reverse order so earlier layers are on top
      [...layers].reverse().forEach(layer => {
        if (layer.visible) {
          Object.entries(layer.cells).forEach(([key, value]) => {
            if (value) {
              const [r, c] = key.split(',').map(Number);
              const { x, y, size } = getHexCoordinates(hexSize, r, c);
              drawHexagon(ctx, x, y, size, true, layer.color);
            }
          });
        }
      });
    }
  };

  const drawAtPosition = (x: number, y: number) => {
    const closestHex = findClosestHexagon(x, y, hexSize, canvasWidth, canvasHeight);
    
    if (closestHex) {
      const hexWidth = hexSize * 1.75;
      const hexHeight = Math.sqrt(3) * hexSize * 0.9;
      
      const rows = Math.ceil(canvasHeight / hexHeight) + 1;
      const cols = Math.ceil(canvasWidth / hexWidth) + 4;
      
      if (isErasing) {
        // Eraser mode: remove cells from all visible layers
        const updatedLayers = [...layers];
        
        const { r, c } = closestHex;
        
        for (let dr = -brushSize + 1; dr < brushSize; dr++) {
          for (let dc = -brushSize + 1; dc < brushSize; dc++) {
            const newR = r + dr;
            const newC = c + dc;
            
            if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
              const hexDist = Math.sqrt(dr * dr + dc * dc);
              
              if (hexDist < brushSize) {
                const cellKey = `${newR},${newC}`;
                // Remove this cell from all layers
                updatedLayers.forEach(layer => {
                  if (layer.visible) { // Only erase from visible layers
                    delete layer.cells[cellKey];
                  }
                });
              }
            }
          }
        }
        
        setLayers(updatedLayers);
      } else {
        // Normal drawing mode
        // Fill hexagons within brush size
        const updatedLayers = [...layers];
        const activeLayer = updatedLayers.find(l => l.id === activeLayerId);
        
        if (activeLayer) {
          const { r, c } = closestHex;
          
          for (let dr = -brushSize + 1; dr < brushSize; dr++) {
            for (let dc = -brushSize + 1; dc < brushSize; dc++) {
              const newR = r + dr;
              const newC = c + dc;
              
              if (newR >= 0 && newR < rows && newC >= 0 && newC < cols) {
                const hexDist = Math.sqrt(dr * dr + dc * dc);
                
                if (hexDist < brushSize) {
                  const cellKey = `${newR},${newC}`;
                  // Remove this cell from other layers to prevent overwriting
                  updatedLayers.forEach(layer => {
                    if (layer.id !== activeLayerId) {
                      delete layer.cells[cellKey];
                    }
                  });
                  // Add to current layer
                  activeLayer.cells[cellKey] = true;
                }
              }
            }
          }
          
          setLayers(updatedLayers);
        }
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gridVisible) return; // Don't allow drawing when grid is hidden
    setIsDrawing(true);
    
    const canvas = gridRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawAtPosition(x, y);
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !gridVisible) return;
    
    const canvas = gridRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawAtPosition(x, y);
  };
  
  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };
  
  const handleCanvasMouseLeave = () => {
    setIsDrawing(false);
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const addLayer = () => {
    const newId = layers.length > 0 ? Math.max(...layers.map(l => l.id)) + 1 : 1;
    const usedColors = layers.map(layer => layer.color);
    const newColor = getRandomColor(usedColors);
    
    setLayers([...layers, {
      id: newId,
      name: `Layer ${newId}`,
      color: newColor,
      cells: {},
      visible: true
    }]);
    
    setActiveLayerId(newId);
  };

  const deleteLayer = (id: number) => {
    if (layers.length <= 1) return;
    
    const updatedLayers = layers.filter(layer => layer.id !== id);
    setLayers(updatedLayers);
    
    if (activeLayerId === id) {
      setActiveLayerId(updatedLayers[0].id);
    }
  };

  const toggleLayerVisibility = (id: number) => {
    const updatedLayers = layers.map(layer => {
      if (layer.id === id) {
        return { ...layer, visible: !layer.visible };
      }
      return layer;
    });
    setLayers(updatedLayers);
  };

  const renameLayer = (id: number, newName: string) => {
    if (!newName.trim()) return; // Don't allow empty names
    
    const updatedLayers = layers.map(layer => {
      if (layer.id === id) {
        return { ...layer, name: newName.trim() };
      }
      return layer;
    });
    setLayers(updatedLayers);
  };

  const toggleGridVisibility = () => {
    setGridVisible(!gridVisible);
  };

  const calculateAreaProportions = () => {
    // Count total cells per layer
    const layerCounts = layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      color: layer.color,
      count: Object.values(layer.cells).filter(Boolean).length
    }));
    
    // Calculate total cells
    const totalCells = layerCounts.reduce((sum, layer) => sum + layer.count, 0);
    
    if (totalCells === 0) {
      setCalculationResult({
        totalCells: 0,
        layers: layerCounts.map(layer => ({
          ...layer,
          percentage: '0'
        }))
      });
      return;
    }
    
    // Calculate percentages
    const layersWithPercentages = layerCounts.map(layer => ({
      ...layer,
      percentage: ((layer.count / totalCells) * 100).toFixed(2)
    }));
    
    setCalculationResult({
      totalCells,
      layers: layersWithPercentages
    });
  };

  // Effect to update canvas dimensions
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.width = canvasWidth;
      gridRef.current.height = canvasHeight;
      drawGrid();
    }
  }, [canvasWidth, canvasHeight]);

  // Effect to redraw grid when relevant state changes
  useEffect(() => {
    drawGrid();
  }, [hexSize, layers, brushSize, backgroundImage, gridVisible]);

  return {
    hexSize,
    setHexSize,
    brushSize,
    setBrushSize,
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
    isErasing,
    toggleEraser,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
    addLayer,
    deleteLayer,
    calculateAreaProportions
  };
};
