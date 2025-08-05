import React from 'react';
import { Button } from './ui/button';
import { triggerGameStartJingle } from './GameAudio';

interface GameResetButtonProps {
  // Callback to reset game state (called from PigGame)
  onResetGameState?: () => void;
  
  // Callback to reset app state (cause selection, etc.)
  onResetAppState?: () => void;
  
  // Display variant
  variant?: 'game-only' | 'app-only' | 'both' | 'combined';
  
  // Button styling
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  
  // Labels
  gameResetLabel?: string;
  appResetLabel?: string;
  combinedResetLabel?: string;
}

export function GameResetButton({
  onResetGameState,
  onResetAppState,
  variant = 'combined',
  size = 'sm',
  className = '',
  gameResetLabel = 'Reset Game',
  appResetLabel = 'Reset All',
  combinedResetLabel = 'Reset'
}: GameResetButtonProps) {

  const handleGameReset = async () => {
    if (onResetGameState) {
      await onResetGameState();
    }
    // Play start jingle after game reset
    triggerGameStartJingle('game-reset');
  };

  const handleAppReset = async () => {
    if (onResetAppState) {
      await onResetAppState();
    }
  };

  const handleCombinedReset = async () => {
    // Reset game state first, then app state
    if (onResetGameState) {
      await onResetGameState();
    }
    if (onResetAppState) {
      await onResetAppState();
    }
    // Play start jingle after combined reset
    triggerGameStartJingle('combined-reset');
  };

  if (variant === 'game-only') {
    return (
      <Button 
        onClick={handleGameReset}
        variant="outline"
        size={size}
        className={`bg-white hover:bg-gray-50 ${className}`}
        title="Reset game session (keeps your selected cause)"
      >
        {gameResetLabel}
      </Button>
    );
  }

  if (variant === 'app-only') {
    return (
      <Button 
        onClick={handleAppReset}
        variant="outline"
        size={size}
        className={`bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 ${className}`}
        title="Reset your cause selection and all settings"
      >
        {appResetLabel}
      </Button>
    );
  }

  if (variant === 'both') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button 
          onClick={handleGameReset}
          variant="outline"
          size={size}
          className="bg-white hover:bg-gray-50"
          title="Reset game session (keeps your selected cause)"
        >
          {gameResetLabel}
        </Button>
        <Button 
          onClick={handleCombinedReset}
          variant="outline"
          size={size}
          className="bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300"
          title="Reset everything including cause selection and all settings"
        >
          {appResetLabel}
        </Button>
      </div>
    );
  }

  // Default: combined reset
  return (
    <Button 
      onClick={handleCombinedReset}
      variant="outline"
      size={size}
      className={`bg-white hover:bg-gray-50 ${className}`}
      title="Reset everything including game, cause selection, and settings"
    >
      {combinedResetLabel}
    </Button>
  );
}