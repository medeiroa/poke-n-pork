import React from 'react';

interface ShowHeaderProps {
  onHeaderToggle: () => void;
  headerMinimized: boolean;
}

export function ShowHeader({ onHeaderToggle, headerMinimized }: ShowHeaderProps) {
  return (
    <div
      className="fixed top-0 left-0 w-full h-[150px] bg-transparent z-[9999] cursor-pointer"
      onClick={onHeaderToggle}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Subtle visual hint that changes based on header state */}
      <div 
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent to-transparent transition-opacity duration-300 ${
          headerMinimized 
            ? 'via-blue-200/20 opacity-30 hover:opacity-60' 
            : 'via-red-200/20 opacity-20 hover:opacity-40'
        }`} 
      />
    </div>
  );
}