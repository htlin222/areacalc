import React, { useState } from 'react';
import { Layers, Plus, Trash2, Eye, EyeOff, Edit2, Check } from 'lucide-react';
import { Layer } from '../types';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: number;
  setActiveLayerId: (id: number) => void;
  addLayer: () => void;
  deleteLayer: (id: number) => void;
  toggleLayerVisibility: (id: number) => void;
  renameLayer: (id: number, newName: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  setActiveLayerId,
  addLayer,
  deleteLayer,
  toggleLayerVisibility,
  renameLayer
}) => {
  const [editingLayerId, setEditingLayerId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const startEditing = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const saveLayerName = (id: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    renameLayer(id, editingName);
    setEditingLayerId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingLayerId(null);
    }
  };

  return (
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
            <div className="flex items-center flex-grow mr-2">
              <div 
                className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
                style={{ backgroundColor: layer.color }}
              />
              
              {editingLayerId === layer.id ? (
                <form onSubmit={(e) => saveLayerName(layer.id, e)} className="flex-grow">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-1 py-0.5 border border-gray-300 rounded text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="submit"
                      className="ml-1 text-green-500 hover:text-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveLayerName(layer.id);
                      }}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center">
                  <span className="flex-grow">{layer.name}</span>
                  <button
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    onClick={(e) => startEditing(layer, e)}
                    title="Edit layer name"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <button 
                className="text-gray-500 hover:text-gray-700 mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
                title={layer.visible ? "Hide layer" : "Show layer"}
              >
                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
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
          </div>
        ))}
      </div>
    </div>
  );
};
