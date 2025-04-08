export interface Layer {
  id: number;
  name: string;
  color: string;
  cells: Record<string, boolean>;
  visible: boolean;
  opacity: number;
}

export interface HexCoordinates {
  x: number;
  y: number;
  size: number;
}

export interface CalculationResult {
  totalCells: number;
  layers: LayerCalculation[];
}

export interface LayerCalculation {
  id: number;
  name: string;
  color: string;
  count: number;
  percentage: string;
}

export interface HexagonPosition {
  r: number;
  c: number;
}

export interface BackgroundImage {
  image: HTMLImageElement;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}
