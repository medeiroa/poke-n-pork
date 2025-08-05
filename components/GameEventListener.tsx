import { useEffect } from 'react';

interface GameEventListenerProps {
  onPauseRequest?: () => void;
  onResumeRequest?: () => void;
  pauseGame?: () => Promise<void>;
  resumeGame?: () => Promise<void>;
}

export function GameEventListener({
  onPauseRequest,
  onResumeRequest,
  pauseGame,
  resumeGame
}: GameEventListenerProps) {
  
  useEffect(() => {
    const handlePauseRequest = async (event: CustomEvent) => {
      console.log('GameEventListener: Received pause request', event.detail);
      
      if (pauseGame) {
        await pauseGame();
      }
      
      if (onPauseRequest) {
        onPauseRequest();
      }
    };

    const handleResumeRequest = async (event: CustomEvent) => {
      console.log('GameEventListener: Received resume request', event.detail);
      
      if (resumeGame) {
        await resumeGame();
      }
      
      if (onResumeRequest) {
        onResumeRequest();
      }
    };

    // Add event listeners for custom game events
    window.addEventListener('requestGamePause', handlePauseRequest as EventListener);
    window.addEventListener('requestGameResume', handleResumeRequest as EventListener);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('requestGamePause', handlePauseRequest as EventListener);
      window.removeEventListener('requestGameResume', handleResumeRequest as EventListener);
    };
  }, [onPauseRequest, onResumeRequest, pauseGame, resumeGame]);

  // This component doesn't render anything
  return null;
}

// Hook version for easier integration
export function useGameEventListener({
  onPauseRequest,
  onResumeRequest,
  pauseGame,
  resumeGame
}: GameEventListenerProps) {
  useEffect(() => {
    const handlePauseRequest = async (event: CustomEvent) => {
      console.log('useGameEventListener: Received pause request', event.detail);
      
      if (pauseGame) {
        await pauseGame();
      }
      
      if (onPauseRequest) {
        onPauseRequest();
      }
    };

    const handleResumeRequest = async (event: CustomEvent) => {
      console.log('useGameEventListener: Received resume request', event.detail);
      
      if (resumeGame) {
        await resumeGame();
      }
      
      if (onResumeRequest) {
        onResumeRequest();
      }
    };

    // Add event listeners for custom game events
    window.addEventListener('requestGamePause', handlePauseRequest as EventListener);
    window.addEventListener('requestGameResume', handleResumeRequest as EventListener);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('requestGamePause', handlePauseRequest as EventListener);
      window.removeEventListener('requestGameResume', handleResumeRequest as EventListener);
    };
  }, [onPauseRequest, onResumeRequest, pauseGame, resumeGame]);
}