import React, { useEffect, useRef, useState } from 'react';

interface PigGameWrapperProps {
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  selectedAgency?: string;
  onAgencyChange?: (agency: string) => void;
  onRegisterPauseResume?: (pauseFn: () => Promise<void>, resumeFn: () => Promise<void>) => void;
  children: (props: {
    pauseGame: () => Promise<void>;
    resumeGame: () => Promise<void>;
    isGameActive: boolean;
    setIsGameActive: (active: boolean) => void;
  }) => React.ReactNode;
}

export function PigGameWrapper({
  onNavigateToEvents,
  onNavigateToLeaderboard,
  selectedAgency,
  onAgencyChange,
  onRegisterPauseResume,
  children
}: PigGameWrapperProps) {
  const [isGameActive, setIsGameActive] = useState(false);
  const gameStateRef = useRef<{
    defundingTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
    lawsuitTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
    pigSpawnTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
    startMessageTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  } | null>(null);

  const pauseGame = async () => {
    setIsGameActive(false);
    // Clear timers when pausing - this logic would need to be extracted from PigGame
    // For now, we'll handle the state and let the child component manage timers
  };

  const resumeGame = async () => {
    setIsGameActive(true);
    // Resume timers - this logic would need to be extracted from PigGame
    // For now, we'll handle the state and let the child component manage timers
  };

  // Register pause and resume functions with the parent
  useEffect(() => {
    if (onRegisterPauseResume) {
      onRegisterPauseResume(pauseGame, resumeGame);
    }
  }, [onRegisterPauseResume]);

  return (
    <>
      {children({
        pauseGame,
        resumeGame,
        isGameActive,
        setIsGameActive
      })}
    </>
  );
}