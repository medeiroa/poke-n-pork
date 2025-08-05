import React from 'react';
import { Button } from './ui/button';
import { triggerGameStartJingle } from './GameAudio';

interface ResetButtonProps {
  onResetGame?: () => void;
  onFullReset?: () => void;
  variant?: 'single' | 'double';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ResetButton({ 
  onResetGame, 
  onFullReset, 
  variant = 'single',
  size = 'sm',
  className = ''
}: ResetButtonProps) {
  
  const handleReset = async () => {
    if (onResetGame) {
      await onResetGame();
    }
    // Play start jingle after game reset
    triggerGameStartJingle('reset-button-game');
  };

  const handleFullReset = async () => {
    if (onFullReset) {
      await onFullReset();
    }
    // Play start jingle after full reset
    triggerGameStartJingle('reset-button-full');
  };

  if (variant === 'double') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button 
          onClick={handleReset}
          variant="outline"
          size={size}
          className="bg-white hover:bg-gray-50"
          title="Reset game but keep current cause and settings"
        >
          Reset Game
        </Button>
        <Button 
          onClick={handleFullReset}
          variant="outline"
          size={size}
          className="bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300"
          title="Reset everything including cause selection and all settings"
        >
          Full Reset
        </Button>
      </div>
    );
  }

  // Single button variant - uses full reset if available, otherwise game reset
  const resetFunction = () => {
    if (onFullReset) {
      handleFullReset();
    } else if (onResetGame) {
      handleReset();
    }
  };
  const buttonText = onFullReset ? "Reset" : "Reset Game";
  const buttonTitle = onFullReset 
    ? "Reset everything including cause selection and all settings"
    : "Reset game but keep current cause and settings";

  return (
    <Button 
      onClick={resetFunction}
      variant="outline"
      size={size}
      className={`bg-white hover:bg-gray-50 ${className}`}
      title={buttonTitle}
    >
      {buttonText}
    </Button>
  );
}