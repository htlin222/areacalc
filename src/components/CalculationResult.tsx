import React from 'react';
import { CalculationResult as CalculationResultType } from '../types';

interface CalculationResultProps {
  calculationResult: CalculationResultType | null;
}

export const CalculationResultPanel: React.FC<CalculationResultProps> = ({ calculationResult }) => {
  if (!calculationResult) return null;
  
  return (
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
  );
};
