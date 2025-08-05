import React, { useEffect, useRef, useCallback } from 'react';
import { PigGame } from './PigGame';

interface GameWithPauseControlProps {
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  selectedAgency?: string;
  onAgencyChange?: (agency: string) => void;
  isCurrentPage: boolean;
}

export function GameWithPauseControl({
  onNavigateToEvents,
  onNavigateToLeaderboard,
  selectedAgency,
  onAgencyChange,
  isCurrentPage
}: GameWithPauseControlProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const wasOnGamePageRef = useRef(isCurrentPage);
  const isPausedRef = useRef(false);

  // Function to pause the game using DOM manipulation
  const pauseGameViaDOM = useCallback(() => {
    if (gameContainerRef.current && !isPausedRef.current) {
      console.log('GameWithPauseControl: Pausing game via DOM manipulation');
      
      // Add pointer-events: none to prevent interactions
      gameContainerRef.current.style.pointerEvents = 'none';
      
      // Add a semi-transparent overlay to indicate paused state
      const overlay = document.createElement('div');
      overlay.id = 'game-pause-overlay';
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.1);
        z-index: 1000;
        pointer-events: none;
      `;
      
      gameContainerRef.current.appendChild(overlay);
      isPausedRef.current = true;
      
      // Dispatch custom pause event that PigGame could potentially listen for
      window.dispatchEvent(new CustomEvent('requestGamePause', {
        detail: { 
          reason: 'navigation_pause',
          timestamp: Date.now()
        }
      }));
    }
  }, []);

  // Function to resume the game
  const resumeGameViaDOM = useCallback(() => {
    if (gameContainerRef.current && isPausedRef.current) {
      console.log('GameWithPauseControl: Resuming game via DOM manipulation');
      
      // Remove pointer-events restriction
      gameContainerRef.current.style.pointerEvents = '';
      
      // Remove pause overlay
      const overlay = document.getElementById('game-pause-overlay');
      if (overlay) {
        overlay.remove();
      }
      
      isPausedRef.current = false;
      
      // Dispatch custom resume event
      window.dispatchEvent(new CustomEvent('requestGameResume', {
        detail: { 
          reason: 'navigation_resume',
          timestamp: Date.now()
        }
      }));
    }
  }, []);

  // Monitor page visibility changes and handle pause/resume
  useEffect(() => {
    const wasOnGamePage = wasOnGamePageRef.current;
    const isNowOnGamePage = isCurrentPage;

    // If we're leaving the game page, pause the game
    if (wasOnGamePage && !isNowOnGamePage) {
      console.log('GameWithPauseControl: Leaving game page - pausing');
      setTimeout(pauseGameViaDOM, 100); // Small delay to ensure DOM is ready
    }

    // If we're returning to the game page, resume the game
    if (!wasOnGamePage && isNowOnGamePage) {
      console.log('GameWithPauseControl: Returning to game page - resuming');
      setTimeout(resumeGameViaDOM, 200); // Delay to ensure page is visible
    }

    // Update the ref for next comparison
    wasOnGamePageRef.current = isNowOnGamePage;
  }, [isCurrentPage, pauseGameViaDOM, resumeGameViaDOM]);

  // Handle navigation with pause
  const handleNavigateToEvents = useCallback((agency: string) => {
    console.log('GameWithPauseControl: Navigation to events requested');
    
    // Pause the game first
    pauseGameViaDOM();
    
    // Navigate after a brief delay
    setTimeout(() => {
      if (onNavigateToEvents) {
        onNavigateToEvents(agency);
      }
    }, 200);
  }, [pauseGameViaDOM, onNavigateToEvents]);

  const handleNavigateToLeaderboard = useCallback((agency: string) => {
    console.log('GameWithPauseControl: Navigation to leaderboard requested');
    
    // Pause the game first
    pauseGameViaDOM();
    
    // Navigate after a brief delay
    setTimeout(() => {
      if (onNavigateToLeaderboard) {
        onNavigateToLeaderboard(agency);
      }
    }, 200);
  }, [pauseGameViaDOM, onNavigateToLeaderboard]);

  return (
    <div ref={gameContainerRef} className="relative">
      <PigGame
        onNavigateToEvents={handleNavigateToEvents}
        onNavigateToLeaderboard={handleNavigateToLeaderboard}
        selectedAgency={selectedAgency}
        onAgencyChange={onAgencyChange}
      />
    </div>
  );
}