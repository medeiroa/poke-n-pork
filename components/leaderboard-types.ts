export interface HighScoreEntry {
  level: number;
  score: number;
  cause: string;
  playerName: string;
  playerImage: string;
  timestamp: number;
}

export interface CauseScoreEntry {
  cause: string;
  score: number;
  rank: number;
  timestamp: number;
}

export interface LeaderboardPageProps {
  onBackToGame: () => void;
  selectedAgency: string;
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToComments?: (highScoreEntry: HighScoreEntry) => void;
  onNavigateToCauseComments?: (causeScoreEntry: CauseScoreEntry) => void;
}