import React, { useEffect, useRef } from 'react';
import { PigGame } from './PigGame';
import { triggerGameStartJingle } from './GameAudio';

interface SimpleGamePauserProps {
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  onNavigateToProfile?: () => void;
  selectedAgency?: string;
  onAgencyChange?: (agency: string) => void;
  isCurrentPage: boolean;
}

export function SimpleGamePauser({
  onNavigateToEvents,
  onNavigateToLeaderboard,
  onNavigateToProfile,
  selectedAgency,
  onAgencyChange,
  isCurrentPage
}: SimpleGamePauserProps) {
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const wasVisibleRef = useRef(isCurrentPage);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    const isNowVisible = isCurrentPage;

    if (gameWrapperRef.current) {
      if (!isNowVisible && wasVisible) {
        // Game is being hidden - add pause effects
        console.log('SimpleGamePauser: Adding pause effects');
        
        // Disable all interactions
        gameWrapperRef.current.style.pointerEvents = 'none';
        
        // Add visual pause overlay
        const overlay = document.createElement('div');
        overlay.id = 'simple-game-pause-overlay';
        overlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(2px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: #333;
          pointer-events: none;
        `;
        overlay.innerHTML = `
          <div style="
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <span style="font-size: 32px;">⏸️</span>
            <span>Game Paused</span>
          </div>
        `;
        
        gameWrapperRef.current.appendChild(overlay);
        
        // Try to dispatch pause events for PigGame to potentially listen to
        window.dispatchEvent(new CustomEvent('gamePause', {
          detail: { reason: 'navigation', timestamp: Date.now() }
        }));
        
      } else if (isNowVisible && !wasVisible) {
        // Game is being shown - remove pause effects
        console.log('SimpleGamePauser: Removing pause effects');
        
        // Re-enable interactions
        gameWrapperRef.current.style.pointerEvents = '';
        
        // Remove pause overlay
        const overlay = document.getElementById('simple-game-pause-overlay');
        if (overlay) {
          overlay.remove();
        }
        
        // Try to dispatch resume events and trigger start jingle
        window.dispatchEvent(new CustomEvent('gameResume', {
          detail: { reason: 'navigation', timestamp: Date.now() }
        }));
        
        // Trigger start jingle when returning to game
        triggerGameStartJingle('resume-from-navigation');
      }
    }

    wasVisibleRef.current = isNowVisible;
  }, [isCurrentPage]);

  // Handle navigation with pause indication
  const handleNavigateToEvents = (agency: string) => {
    if (onNavigateToEvents) {
      onNavigateToEvents(agency);
    }
  };

  const handleNavigateToLeaderboard = (agency: string) => {
    if (onNavigateToLeaderboard) {
      onNavigateToLeaderboard(agency);
    }
  };

  return (
    <div ref={gameWrapperRef} className="relative w-full h-full">
      <PigGame
        onNavigateToEvents={handleNavigateToEvents}
        onNavigateToLeaderboard={handleNavigateToLeaderboard}
        onNavigateToProfile={onNavigateToProfile}
        selectedAgency={selectedAgency}
        onAgencyChange={onAgencyChange}
      />
    </div>
  );
}