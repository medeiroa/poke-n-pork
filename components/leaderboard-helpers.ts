import { Crown, Medal, Award, Trophy } from 'lucide-react';
import { examplePlayerProfiles, AVAILABLE_AGENCIES_FROM_GAME } from './leaderboard-constants';
import { HUMANITARIAN_CAUSES } from './causes-constants';

export interface PlayerProfile {
  name: string;
  image: string;
  isAnonymous?: boolean;
}

export interface LeaderboardEntry {
  score: number;
  player: PlayerProfile;
  timestamp: number;
  cause: string;
  level: number;
}

// Create initial example leaderboard data
export const generateExampleLeaderboard = (): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];
  
  for (let level = 1; level <= 12; level++) {
    // Generate multiple entries per level with varying scores
    const numEntries = Math.floor(Math.random() * 3) + 2; // 2-4 entries per level
    
    for (let i = 0; i < numEntries; i++) {
      const baseScore = level * 1000 + Math.floor(Math.random() * 5000);
      const profile = examplePlayerProfiles[Math.floor(Math.random() * examplePlayerProfiles.length)];
      const cause = AVAILABLE_AGENCIES_FROM_GAME[Math.floor(Math.random() * AVAILABLE_AGENCIES_FROM_GAME.length)];
      
      entries.push({
        score: baseScore,
        player: { ...profile },
        timestamp: Date.now() - Math.floor(Math.random() * 30) * 86400000, // Random time within 30 days
        cause,
        level
      });
    }
  }
  
  return entries.sort((a, b) => b.score - a.score);
};

// Load real player scores from localStorage and merge with example data
export const loadPlayerScores = (): LeaderboardEntry[] => {
  const exampleData = generateExampleLeaderboard();
  
  try {
    // Load real personal bests from localStorage
    const savedPersonalBests = localStorage.getItem('poke-n-pork-personal-bests');
    if (savedPersonalBests) {
      const personalBests = JSON.parse(savedPersonalBests);
      const currentPlayerName = localStorage.getItem('poke-n-pork-player-name') || 'Anonymous';
      const currentPlayerImage = localStorage.getItem('poke-n-pork-player-image') || '👤';
      
      // Convert personal bests to leaderboard entries
      const realEntries: LeaderboardEntry[] = personalBests.map((best: any) => ({
        score: best.score,
        player: {
          name: currentPlayerName,
          image: currentPlayerImage,
          isAnonymous: currentPlayerName === 'Anonymous'
        },
        timestamp: new Date(best.date).getTime(),
        cause: best.agency,
        level: best.level
      }));
      
      // Merge real data with example data and sort by score
      const allEntries = [...exampleData, ...realEntries];
      return allEntries.sort((a, b) => b.score - a.score);
    }
  } catch (error) {
    console.warn('Error loading player scores:', error);
  }
  
  return exampleData;
};

// Generate mock worldwide cause accumulation data using shared causes
const generateMockCauseScores = (): { [key: string]: number } => {
  // Base scores that create realistic distribution from highest to lowest
  const baseScores = [2547892, 2134567, 1893421, 1675234, 1445678, 1298435, 987543, 756829];
  
  return HUMANITARIAN_CAUSES.reduce((acc, cause, index) => {
    // Assign scores in descending order with consistent distribution
    const baseScore = baseScores[index] || 500000;
    // Use cause name for consistent "random" variation based on string hash
    const hash = cause.name.split('').reduce((a, b) => (a + b.charCodeAt(0)) % 100000, 0);
    const variation = (hash - 50000); // ±50K variation based on name
    acc[cause.name] = Math.max(baseScore + variation, 100000); // Minimum 100K points
    return acc;
  }, {} as { [key: string]: number });
};

// Mock worldwide cause accumulation data using shared causes
export const mockWorldwideCauseScores: { [key: string]: number } = generateMockCauseScores();

// Format timestamp to relative time
export const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  
  if (days === 0) {
    if (hours === 0) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  }
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

// Get rank icon based on position
export const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <Trophy className="w-4 h-4 text-gray-500" />;
  }
};

// Get difficulty badge based on level (returns JSX element, should be used in component)
export const getDifficultyLevel = (level: number): 'easy' | 'medium' | 'hard' => {
  if (level <= 4) return 'easy';
  if (level <= 8) return 'medium';
  return 'hard';
};