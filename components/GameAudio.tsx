import React, { useEffect, useRef } from 'react';
import { GameAudioManager } from './audio/GameAudioManager';
import { emergencyDisableButtonEnhancement, enhancePauseButton, isPlayButton, isPauseButton, isButton } from './audio/audio-utils';
import { AUDIO_CONSTANTS, CONSOLE_MESSAGES } from './audio/audio-constants';

console.log(CONSOLE_MESSAGES.LOADING);

// Global audio manager instance
export const gameAudio = new GameAudioManager();

// Hook for using game audio
export function useGameAudio() {
  const audioRef = useRef(gameAudio);

  useEffect(() => {
    // Initialize audio on first use
    audioRef.current.initializeAudio();
  }, []);

  return {
    playStartJingle: () => audioRef.current.playStartJingle(),
    setVolume: (volume: number) => audioRef.current.setVolume(volume),
    setEnabled: (enabled: boolean) => audioRef.current.setEnabled(enabled),
    getEnabled: () => audioRef.current.getEnabled(),
    getVolume: () => audioRef.current.getVolume(),
  };
}

// Component for handling game audio events
interface GameAudioProviderProps {
  children: React.ReactNode;
  onGameStart?: () => void;
}

export function GameAudioProvider({ children, onGameStart }: GameAudioProviderProps) {
  const { playStartJingle } = useGameAudio();

  useEffect(() => {
    // Listen for game start events - consolidated to prevent multiple triggers
    const handleGameAudio = (event: CustomEvent) => {
      console.log('Game audio event detected:', event.type, event.detail);
      playStartJingle();
      if (onGameStart) {
        onGameStart();
      }
    };

    // Use a single event listener for all audio-triggering events
    window.addEventListener('gameStart', handleGameAudio as EventListener);
    window.addEventListener('gameResume', handleGameAudio as EventListener);

    return () => {
      window.removeEventListener('gameStart', handleGameAudio as EventListener);
      window.removeEventListener('gameResume', handleGameAudio as EventListener);
    };
  }, [playStartJingle, onGameStart]);

  return <>{children}</>;
}

// Utility function to trigger game start jingle - FIXED to prevent double playing
export function triggerGameStartJingle(reason: string = 'manual') {
  console.log(`🎵 Triggering game start jingle: ${reason}`);
  
  // Only dispatch event - let the provider handle the audio to prevent double playing
  window.dispatchEvent(new CustomEvent('gameStart', {
    detail: { reason, timestamp: Date.now() }
  }));
}

// Universal pause/unpause function that ensures audio consistency - FIXED
export function universalGameResume(reason: string = 'unknown') {
  console.log(`Universal game resume triggered: ${reason}`);
  
  // Only trigger audio once through the standard event system
  window.dispatchEvent(new CustomEvent('gameResume', {
    detail: { reason: `universal-${reason}`, timestamp: Date.now() }
  }));
  
  // Dispatch resume event for game state management
  window.dispatchEvent(new CustomEvent('requestGameResume', {
    detail: { reason: `universal-${reason}`, timestamp: Date.now() }
  }));
}

// Enhanced pause button click handler that can be used anywhere
export function handlePauseButtonClick(isPaused: boolean, reason: string = 'pause-button') {
  if (isPaused) {
    // If currently paused, resume the game
    universalGameResume(reason);
  } else {
    // If currently playing, pause the game
    window.dispatchEvent(new CustomEvent('requestGamePause', {
      detail: { reason, timestamp: Date.now() }
    }));
  }
}

// Component to wrap pause/play buttons and ensure audio triggers
interface AudioEnhancedButtonProps {
  children: React.ReactNode;
  isPaused?: boolean;
  onToggle?: () => void;
  audioReason?: string;
  className?: string;
}

export function AudioEnhancedButton({ 
  children, 
  isPaused = false, 
  onToggle, 
  audioReason = 'enhanced-button',
  className = ''
}: AudioEnhancedButtonProps) {
  const handleClick = () => {
    // Handle audio and events
    handlePauseButtonClick(isPaused, audioReason);
    
    // Call original handler if provided
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
}

// Global click listener for pause/play button detection (SAFE - no CSS selectors)
let globalListenerSetup = false;

export function setupGlobalPauseButtonListener() {
  if (globalListenerSetup) {
    console.log(CONSOLE_MESSAGES.GLOBAL_LISTENER_EXISTS);
    return;
  }
  
  try {
    // SAFE global click listener - NO CSS SELECTORS USED
    document.addEventListener('click', function(event) {
      try {
        const target = event.target as HTMLElement;
        if (!target) return;
        
        // Check if the clicked element or its parent is a pause/play button
        let element = target;
        let depth = 0;
        
        while (element && depth < AUDIO_CONSTANTS.MAX_ELEMENT_DEPTH) {
          try {
            if (isButton(element)) {
              if (isPlayButton(element)) {
                console.log('🎵 Global listener detected play button - triggering audio');
                triggerGameStartJingle('global-play-button');
                break;
              }
              
              if (isPauseButton(element)) {
                console.log('🎵 Global listener detected pause button - triggering audio after delay');
                setTimeout(() => {
                  triggerGameStartJingle('global-pause-toggle');
                }, AUDIO_CONSTANTS.PAUSE_TOGGLE_DELAY);
                break;
              }
            }
          } catch (elementError) {
            // Silently ignore element errors
          }
          
          element = element.parentElement as HTMLElement;
          depth++;
        }
      } catch (error) {
        // Silently ignore all errors to prevent issues
      }
    }, { capture: true });
    
    globalListenerSetup = true;
    console.log(CONSOLE_MESSAGES.GLOBAL_LISTENER_SETUP);
  } catch (error) {
    console.warn('Failed to setup global pause button listener:', error);
  }
}

// Export the manual enhancement function
export { enhancePauseButton };

// Emergency disable and safe initialization
if (typeof document !== 'undefined') {
  console.log(CONSOLE_MESSAGES.SYSTEM_INITIALIZING);
  
  // Run emergency disable first
  emergencyDisableButtonEnhancement();
  
  // Only setup the safe global click listener
  setTimeout(() => {
    try {
      setupGlobalPauseButtonListener();
      console.log(CONSOLE_MESSAGES.SYSTEM_INITIALIZED);
    } catch (error) {
      console.warn('🎵 Failed to setup click listener:', error);
    }
  }, AUDIO_CONSTANTS.SETUP_DELAY);
} else {
  console.log(CONSOLE_MESSAGES.DOCUMENT_UNAVAILABLE);
}

export default GameAudioProvider;