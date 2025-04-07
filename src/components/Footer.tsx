import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <div className="text-center text-gray-500 text-sm mt-2 flex items-center justify-center">
      <span>Ⓒ Designed by Hsieh-Ting Lin made with </span>
      <Heart size={14} className="mx-1 text-red-500 fill-current" />
    </div>
  );
};
