import React, { useState, useRef, useEffect } from 'react';
import { Layers, Plus, Minus, Trash2, Calculator } from 'lucide-react';

const HexagonGrid = () => {
  const [hexSize, setHexSize] = useState(20);
  const [brushSize, setBrushSize] = useState(1);
  const [layers, setLayers] = useState([
    { id: 1, name: 'Layer 1', color: '#FF5252', cells: {} }
  ]);
  const [activeLayerId, setActiveLayerId] = useState(1);
  const [calculationResult, setCalculationResult] = useState(null);
  const gridRef = useRef(null);

  const canvasWidth = 800;
  const canvasHeight = 600;

  const getHexCoordinates = (size, row, col) => {
    // Reduce gaps by making hexagons closer together
    const width = size * 1.75; // Reduced from 2 to bring hexagons closer horizontally
    const height = Math.sqrt(3) * size * 0.9; // Reduced to bring hexagons closer vertically
    const offset = row % 2 === 0 ? 0 : width / 2;
    
    return {
      x: col * width + offset,
      y: row * height,
      size
    };
  };

  const drawHexagon = (ctx, x, y, size, fill = false, color = '#ccc') => {
    const angle = 2 * Math.PI / 6;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      // Start at the top (not the right) to make proper hexagons
      const rotation = angle * i - Math.PI/2;
      const xPoint = x + size * Math.cos(rotation);
      const yPoint = y + size * Math.sin(rotation);
      
      if (i === 0) {
        ctx.moveTo(xPoint, yPoint);
      } else {
        ctx.lineTo(xPoint, yPoint);
      }
    }
    ctx.closePath();
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    }
    
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  };

  const drawGrid = () => {
    if (!gridRef.current) return;
    
    const canvas = gridRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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
      Object.entries(layer.cells).forEach(([key, value]) => {
        if (value) {
          const [r, c] = key.split(',').map(Number);
          const { x, y, size } = getHexCoordinates(hexSize, r, c);
          drawHexagon(ctx, x, y, size, true, layer.color);
        }
      });
    });
  };

  const [isDrawing, setIsDrawing] = useState(false);
  
  const findClosestHexagon = (x, y) => {
    const hexWidth = hexSize * 1.75;
    const hexHeight = Math.sqrt(3) * hexSize * 0.9;
    
    const rows = Math.ceil(canvasHeight / hexHeight) + 1;
    const cols = Math.ceil(canvasWidth / hexWidth) + 4;
    
    let minDist = Infinity;
    let closestHex = null;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const { x: hexX, y: hexY } = getHexCoordinates(hexSize, r, c);
        const dist = Math.sqrt((x - hexX) ** 2 + (y - hexY) ** 2);
        
        if (dist < minDist && dist <= hexSize * 1.2) { // Small buffer for easier selection
          minDist = dist;
          closestHex = { r, c };
        }
      }
    }
    
    return closestHex;
  };
  
  const drawAtPosition = (x, y) => {
    const closestHex = findClosestHexagon(x, y);
    
    if (closestHex) {
      const hexWidth = hexSize * 1.75;
      const hexHeight = Math.sqrt(3) * hexSize * 0.9;
      
      const rows = Math.ceil(canvasHeight / hexHeight) + 1;
      const cols = Math.ceil(canvasWidth / hexWidth) + 4;
      
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
  };

  const handleCanvasMouseDown = (e) => {
    setIsDrawing(true);
    
    const canvas = gridRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawAtPosition(x, y);
  };
  
  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    
    const canvas = gridRef.current;
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

  const addLayer = () => {
    const newId = layers.length > 0 ? Math.max(...layers.map(l => l.id)) + 1 : 1;
    const newColor = getRandomColor();
    
    setLayers([...layers, {
      id: newId,
      name: `Layer ${newId}`,
      color: newColor,
      cells: {}
    }]);
    
    setActiveLayerId(newId);
  };

  const deleteLayer = (id) => {
    if (layers.length <= 1) return;
    
    const updatedLayers = layers.filter(layer => layer.id !== id);
    setLayers(updatedLayers);
    
    if (activeLayerId === id) {
      setActiveLayerId(updatedLayers[0].id);
    }
  };

  const getRandomColor = () => {
    const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4', '#FF9800', '#607D8B'];
    const usedColors = layers.map(layer => layer.color);
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    if (availableColors.length === 0) {
      // Generate a random color if all predefined colors are used
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    
    return availableColors[Math.floor(Math.random() * availableColors.length)];
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
          percentage: 0
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

  useEffect(() => {
    drawGrid();
  }, [hexSize, layers, brushSize]);

  return (
    <div className="flex flex-col space-y-4 bg-gray-100 p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800">Pathology Area Calculator</h1>
      
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Hexagon Size:</label>
          <div className="flex items-center space-x-2">
            <button 
              className="bg-blue-500 text-white p-1 rounded" 
              onClick={() => setHexSize(Math.max(10, hexSize - 5))}
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center">{hexSize}</span>
            <button 
              className="bg-blue-500 text-white p-1 rounded" 
              onClick={() => setHexSize(Math.min(40, hexSize + 5))}
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
      
      <div className="flex">
        <div className="w-3/4 border border-gray-300 bg-white rounded-lg overflow-hidden">
          <canvas 
            ref={gridRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            className="cursor-crosshair"
          />
        </div>
        
        <div className="w-1/4 ml-4">
          <div className="bg-white p-3 rounded-lg border border-gray-300 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center">
                <Layers size={16} className="mr-1" />
                Layers
              </h3>
              <button 
                className="bg-blue-500 text-white p-1 rounded"
                onClick={addLayer}
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {layers.map(layer => (
                <div 
                  key={layer.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    activeLayerId === layer.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: layer.color }}
                    />
                    <span>{layer.name}</span>
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(layer.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {calculationResult && (
            <div className="bg-white p-3 rounded-lg border border-gray-300">
              <h3 className="font-semibold mb-2">Area Calculation</h3>
              <div className="text-sm">
                <p className="mb-2">Total cells: {calculationResult.totalCells}</p>
                <ul className="space-y-1">
                  {calculationResult.layers.map(layer => (
                    <li key={layer.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: layer.color }}
                        />
                        <span>{layer.name}</span>
                      </div>
                      <div>
                        <span className="font-medium">{layer.percentage}%</span>
                        <span className="text-gray-500 ml-1">({layer.count})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mt-2">
        <p>Instructions:</p>
        <ul className="list-disc pl-5">
          <li>Click on the grid to draw with the selected layer</li>
          <li>Add layers using the + button in the Layers panel</li>
          <li>Adjust hexagon and brush size using the controls above</li>
          <li>Click "Calculate Areas" to see the proportion of each layer</li>
        </ul>
      </div>
    </div>
  );
};

export default HexagonGrid;