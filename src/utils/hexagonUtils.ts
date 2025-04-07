import { HexCoordinates, HexagonPosition } from '../types';

export const getHexCoordinates = (size: number, row: number, col: number): HexCoordinates => {
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

export const drawHexagon = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number, 
  fill = false, 
  color = '#ccc'
): void => {
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

export const findClosestHexagon = (
  x: number, 
  y: number, 
  hexSize: number, 
  canvasWidth: number, 
  canvasHeight: number
): HexagonPosition | null => {
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

export const getRandomColor = (usedColors: string[]): string => {
  const colors = [
    '#FF5252', '#4CAF50', '#2196F3', '#FFC107', 
    '#9C27B0', '#00BCD4', '#FF9800', '#607D8B'
  ];
  const availableColors = colors.filter(color => !usedColors.includes(color));
  
  if (availableColors.length === 0) {
    // Generate a random color if all predefined colors are used
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }
  
  return availableColors[Math.floor(Math.random() * availableColors.length)];
};
