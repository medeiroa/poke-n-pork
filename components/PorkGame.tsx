import React from 'react';
import { PigGame } from './PigGame';

interface PorkGameProps {
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  selectedAgency?: string;
  onAgencyChange?: (agency: string) => void;
}

// Re-export PigGame as PorkGame with additional props handling
export const PorkGame: React.FC<PorkGameProps> = (props) => {
  return <PigGame {...props} />;
};