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
  const [gridOffsetX, setGridOffsetX] = useState<number>(0);
  const [gridOffsetY, setGridOffsetY] = useState<number>(0);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, name: 'Layer 1', color: '#FF5252', cells: {}, visible: true, opacity: 0.3 }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<number>(1);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage | null>(null);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
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
      // Adding extra columns and rows to ensure we cover the entire area even with offsets
      const hexWidth = hexSize * 1.75;
      const hexHeight = Math.sqrt(3) * hexSize * 0.9;
      
      // Calculate extra rows and columns needed based on maximum offset
      const maxOffset = 200; // Maximum offset in pixels
      const extraRows = Math.ceil(maxOffset / hexHeight) * 2; // *2 for both positive and negative offsets
      const extraCols = Math.ceil(maxOffset / hexWidth) * 2;
      
      // Add extra rows and columns to ensure coverage when offset
      const rows = Math.ceil(canvasHeight / hexHeight) + extraRows;
      const cols = Math.ceil(canvasWidth / hexWidth) + extraCols;
      
      // Calculate starting row and column to ensure we cover negative offsets
      const startRow = -Math.ceil(maxOffset / hexHeight);
      const startCol = -Math.ceil(maxOffset / hexWidth);
      
      // Draw base grid with offset
      for (let r = startRow; r < rows + startRow; r++) {
        for (let c = startCol; c < cols + startCol; c++) {
          const { x, y, size } = getHexCoordinates(hexSize, r, c, gridOffsetX, gridOffsetY);
          // Only draw if the hexagon is at least partially within the canvas
          if (x + size > -maxOffset && x - size < canvasWidth + maxOffset && 
              y + size > -maxOffset && y - size < canvasHeight + maxOffset) {
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
              const { x, y, size } = getHexCoordinates(hexSize, r, c, gridOffsetX, gridOffsetY);
              drawHexagon(ctx, x, y, size, true, layer.color, layer.opacity);
            }
          });
        }
      });
    }
  };

  const drawAtPosition = (x: number, y: number) => {
    const closestHex = findClosestHexagon(x, y, hexSize, canvasWidth, canvasHeight, gridOffsetX, gridOffsetY);
    
    if (closestHex) {
      const hexWidth = hexSize * 1.75;
      const hexHeight = Math.sqrt(3) * hexSize * 0.9;
      
      // Use the same grid calculation logic as in drawGrid
      const maxOffset = 200;
      const extraRows = Math.ceil(maxOffset / hexHeight) * 2;
      const extraCols = Math.ceil(maxOffset / hexWidth) * 2;
      
      const rows = Math.ceil(canvasHeight / hexHeight) + extraRows;
      const cols = Math.ceil(canvasWidth / hexWidth) + extraCols;
      
      if (isErasing) {
        // Eraser mode: remove cells from all visible layers
        const updatedLayers = [...layers];
        
        const { r, c } = closestHex;
        
        for (let dr = -brushSize + 1; dr < brushSize; dr++) {
          for (let dc = -brushSize + 1; dc < brushSize; dc++) {
            const newR = r + dr;
            const newC = c + dc;
            
            // No need to check bounds as we're using cell keys
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
              
              // No need to check bounds as we're using cell keys
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
    const newId = Math.max(0, ...layers.map(l => l.id)) + 1;
    const usedColors = layers.map(l => l.color);
    const newLayer: Layer = {
      id: newId,
      name: `Layer ${newId}`,
      color: getRandomColor(usedColors),
      cells: {},
      visible: true,
      opacity: 0.3
    };
    
    setLayers([...layers, newLayer]);
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

  const updateLayerOpacity = (id: number, opacity: number) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, opacity } : layer
    ));
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
  }, [hexSize, layers, brushSize, backgroundImage, gridVisible, gridOffsetX, gridOffsetY]);

  return {
    hexSize,
    setHexSize,
    brushSize,
    setBrushSize,
    gridOffsetX,
    setGridOffsetX,
    gridOffsetY,
    setGridOffsetY,
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
  };
};
