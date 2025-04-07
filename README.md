# Pathology Area Calculator

A specialized tool for calculating proportional areas in pathology images using a hexagonal grid system.

## Features

- **Hexagonal Grid System**: Precisely mark and measure areas using adjustable hexagons
- **Multi-layer Support**: Create multiple layers to mark different tissue types or regions
- **Background Image**: Upload and position reference images with adjustable opacity and scale
- **Area Calculation**: Calculate the proportional area of each layer
- **Interactive Tools**:
  - Adjustable hexagon size (5-40px)
  - Variable brush size for efficient marking
  - Eraser tool for precise corrections
  - Layer visibility toggles
  - Grid visibility toggle
  - Editable layer names

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/htlin/areacalc.git
   cd areacalc
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Basic Operations

1. **Drawing**: Click and drag on the grid to mark areas with the selected layer
2. **Erasing**: Toggle the eraser tool and click/drag to remove marked hexagons
3. **Adjusting Size**: Use the hexagon size controls to change grid precision
4. **Brush Size**: Adjust brush size for faster or more precise drawing

### Working with Layers

1. **Adding Layers**: Click the + button in the Layers panel
2. **Selecting Layers**: Click on a layer to make it active for drawing
3. **Renaming Layers**: Click the edit icon next to a layer name
4. **Toggling Visibility**: Use the eye icon to show/hide layers
5. **Deleting Layers**: Click the trash icon to remove a layer

### Background Images

1. **Uploading**: Click on the Background Image panel to expand it, then select an image
2. **Positioning**: Use the X and Y sliders to position the image
3. **Scaling**: Adjust the scale slider to resize the image
4. **Opacity**: Control transparency with the opacity slider
5. **Hide Grid**: Toggle grid visibility to see only the background image

### Calculating Areas

1. Click the "Calculate Areas" button to compute the proportional area of each layer
2. Results show the percentage and hexagon count for each layer
3. Use these calculations for quantitative analysis of tissue proportions

## Technical Details

Built with:
- React
- TypeScript
- HTML5 Canvas
- Tailwind CSS
- Lucide React icons

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

Ⓒ Designed by Hsieh-Ting Lin made with ❤️
