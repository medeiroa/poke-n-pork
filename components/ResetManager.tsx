import React from 'react';
import { ResetButton } from './ResetButton';

interface ResetManagerProps {
  // Game reset function - resets game state but keeps settings
  onResetGameKeepSettings?: () => void;
  
  // Full game reset - resets game state and all settings except cause
  onResetGame?: () => void;
  
  // App-level reset - resets cause selection and localStorage
  onResetApp?: () => void;
  
  // Variant determines what reset options to show
  variant?: 'game-only' | 'game-and-full' | 'full-only';
  
  // Size and styling
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ResetManager({
  onResetGameKeepSettings,
  onResetGame,
  onResetApp,
  variant = 'full-only',
  size = 'sm',
  className = ''
}: ResetManagerProps) {

  const handleFullReset = async () => {
    // Reset game first (if function provided)
    if (onResetGame) {
      await onResetGame();
    }
    
    // Then reset app-level state (cause selection)
    if (onResetApp) {
      await onResetApp();
    }
  };

  const handleGameReset = async () => {
    if (onResetGameKeepSettings) {
      await onResetGameKeepSettings();
    }
  };

  if (variant === 'game-only') {
    return (
      <ResetButton
        onResetGame={handleGameReset}
        variant="single"
        size={size}
        className={className}
      />
    );
  }

  if (variant === 'game-and-full') {
    return (
      <ResetButton
        onResetGame={handleGameReset}
        onFullReset={handleFullReset}
        variant="double"
        size={size}
        className={className}
      />
    );
  }

  // Default: full-only
  return (
    <ResetButton
      onFullReset={handleFullReset}
      variant="single"
      size={size}
      className={className}
    />
  );
}