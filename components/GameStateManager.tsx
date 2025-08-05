import React, { useEffect, useRef } from 'react';
import { PigGame } from './PigGame';

interface GameStateManagerProps {
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  selectedAgency?: string;
  onAgencyChange?: (agency: string) => void;
  isCurrentPage: boolean; // Track if we're currently on the game page
}

export function GameStateManager({
  onNavigateToEvents,
  onNavigateToLeaderboard,
  selectedAgency,
  onAgencyChange,
  isCurrentPage
}: GameStateManagerProps) {
  const pauseGameRef = useRef<(() => Promise<void>) | null>(null);
  const resumeGameRef = useRef<(() => Promise<void>) | null>(null);
  const wasOnGamePageRef = useRef(isCurrentPage);

  // Monitor page changes and handle pause/resume
  useEffect(() => {
    const wasOnGamePage = wasOnGamePageRef.current;
    const isNowOnGamePage = isCurrentPage;

    // If we're leaving the game page, pause the game
    if (wasOnGamePage && !isNowOnGamePage && pauseGameRef.current) {
      console.log('Pausing game - navigating away from game page');
      pauseGameRef.current();
    }

    // If we're returning to the game page, resume the game  
    if (!wasOnGamePage && isNowOnGamePage && resumeGameRef.current) {
      console.log('Resuming game - returning to game page');
      resumeGameRef.current();
    }

    // Update the ref for next comparison
    wasOnGamePageRef.current = isNowOnGamePage;
  }, [isCurrentPage]);

  // Handle navigation to events - pause game before navigating
  const handleNavigateToEvents = async (agency: string) => {
    console.log('Navigating to events page');
    if (pauseGameRef.current) {
      await pauseGameRef.current();
    }
    if (onNavigateToEvents) {
      onNavigateToEvents(agency);
    }
  };

  // Handle navigation to leaderboard - pause game before navigating
  const handleNavigateToLeaderboard = async (agency: string) => {
    console.log('Navigating to leaderboard page');
    if (pauseGameRef.current) {
      await pauseGameRef.current();
    }
    if (onNavigateToLeaderboard) {
      onNavigateToLeaderboard(agency);
    }
  };

  // Handle registration of pause and resume functions from PigGame
  const handlePauseGameCallback = (pauseFn: () => Promise<void>) => {
    pauseGameRef.current = pauseFn;
  };

  const handleResumeGameCallback = (resumeFn: () => Promise<void>) => {
    resumeGameRef.current = resumeFn;
  };

  return (
    <PigGame
      onNavigateToEvents={handleNavigateToEvents}
      onNavigateToLeaderboard={handleNavigateToLeaderboard}
      selectedAgency={selectedAgency}
      onAgencyChange={onAgencyChange}
      onPauseGameCallback={handlePauseGameCallback}
      onResumeGameCallback={handleResumeGameCallback}
    />
  );
}