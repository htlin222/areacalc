import { HexCoordinates, HexagonPosition } from "../types";

export const getHexCoordinates = (
  size: number,
  row: number,
  col: number,
  offsetX = 0,
  offsetY = 0
): HexCoordinates => {
  // Reduce gaps by making hexagons closer together
  const width = size * 1.75; // Reduced from 2 to bring hexagons closer horizontally
  const height = Math.sqrt(3) * size * 0.9; // Reduced to bring hexagons closer vertically
  const offset = row % 2 === 0 ? 0 : width / 2;

  return {
    x: col * width + offset + offsetX,
    y: row * height + offsetY,
    size,
  };
};

export const drawHexagon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill = false,
  color = "#ccc",
  opacity = 1.0
): void => {
  const angle = (2 * Math.PI) / 6;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    // Start at the top (not the right) to make proper hexagons
    const rotation = angle * i - Math.PI / 2;
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
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  } else {
    // Set opacity for grid lines
    ctx.globalAlpha = 0.8;
  }

  ctx.strokeStyle = "#888";
  ctx.lineWidth = 0.3;
  ctx.stroke();

  // Reset opacity after drawing
  if (!fill) {
    ctx.globalAlpha = 1.0;
  }
};

export const findClosestHexagon = (
  x: number,
  y: number,
  hexSize: number,
  canvasWidth: number,
  canvasHeight: number,
  offsetX = 0,
  offsetY = 0
): HexagonPosition | null => {
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

  let minDist = Infinity;
  let closestHex = null;

  for (let r = startRow; r < rows + startRow; r++) {
    for (let c = startCol; c < cols + startCol; c++) {
      const { x: hexX, y: hexY } = getHexCoordinates(hexSize, r, c, offsetX, offsetY);
      const dist = Math.sqrt((x - hexX) ** 2 + (y - hexY) ** 2);

      if (dist < minDist && dist <= hexSize * 1.2) {
        // Small buffer for easier selection
        minDist = dist;
        closestHex = { r, c };
      }
    }
  }

  return closestHex;
};

export const getRandomColor = (usedColors: string[]): string => {
  const colors = [
    "#FF5252",
    "#4CAF50",
    "#2196F3",
    "#FFC107",
    "#9C27B0",
    "#00BCD4",
    "#FF9800",
    "#607D8B",
  ];
  const availableColors = colors.filter((color) => !usedColors.includes(color));

  if (availableColors.length === 0) {
    // Generate a random color if all predefined colors are used
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }

  return availableColors[Math.floor(Math.random() * availableColors.length)];
};
