import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { ResetManager } from './ResetManager';

interface ResetButtonControllerProps {
  onResetApp?: () => void;
  variant?: 'game-only' | 'game-and-full' | 'full-only';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export interface ResetButtonControllerRef {
  triggerGameReset: () => void;
  triggerFullReset: () => void;
}

export const ResetButtonController = forwardRef<ResetButtonControllerRef, ResetButtonControllerProps>(
  ({ onResetApp, variant = 'full-only', size = 'sm', className = '' }, ref) => {
    const gameResetRef = useRef<(() => void) | null>(null);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      triggerGameReset: () => {
        if (gameResetRef.current) {
          gameResetRef.current();
        }
      },
      triggerFullReset: async () => {
        if (gameResetRef.current) {
          gameResetRef.current();
        }
        if (onResetApp) {
          await onResetApp();
        }
      }
    }));

    // Function to register game reset callback from PigGame
    const registerGameReset = (resetFn: () => void) => {
      gameResetRef.current = resetFn;
    };

    const handleGameReset = () => {
      if (gameResetRef.current) {
        gameResetRef.current();
      }
    };

    const handleFullReset = async () => {
      // Reset game state first
      if (gameResetRef.current) {
        gameResetRef.current();
      }
      
      // Then reset app-level state
      if (onResetApp) {
        await onResetApp();
      }
    };

    return (
      <div className={className}>
        <ResetManager
          onResetGameKeepSettings={handleGameReset}
          onResetGame={handleGameReset}
          onResetApp={onResetApp}
          variant={variant}
          size={size}
        />
        
        {/* Hidden interface for game to register its reset function */}
        <div style={{ display: 'none' }} data-register-reset={registerGameReset} />
      </div>
    );
  }
);

ResetButtonController.displayName = 'ResetButtonController';