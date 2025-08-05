import React, { useState, useEffect } from 'react';

interface PersonalBestData {
  level: number;
  score: number;
  timestamp: number;
  cause: string;
}

interface PersonalBestTrackerProps {
  currentScore: number;
  currentLevel: number;
  currentCause: string;
  isGameWon: boolean;
  onPersonalBestAchieved?: (isNewBest: boolean, previousBest?: number) => void;
}

const STORAGE_KEY = 'poke-n-pork-personal-bests';

// Personal Best Tracker Hook for game integration
export function usePersonalBestTracker(
  currentScore: number,
  currentLevel: number,
  currentCause: string,
  isGameWon: boolean
) {
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [previousBestScore, setPreviousBestScore] = useState<number | null>(null);
  const [personalBestData, setPersonalBestData] = useState<PersonalBestData | null>(null);

  // Load personal best data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const personalBests: PersonalBestData[] = JSON.parse(storedData);
        
        // Find the best score for current level and cause combination
        const levelCauseBest = personalBests
          .filter(pb => pb.level === currentLevel && pb.cause === currentCause)
          .sort((a, b) => b.score - a.score)[0];
        
        setPersonalBestData(levelCauseBest || null);
      }
    } catch (error) {
      console.warn('Failed to load personal best data:', error);
    }
  }, [currentLevel, currentCause]);

  // Check for new personal best when game is won
  useEffect(() => {
    if (isGameWon && currentScore > 0) {
      const isNewBest = !personalBestData || currentScore > personalBestData.score;
      
      if (isNewBest) {
        const previousBest = personalBestData?.score || null;
        setPreviousBestScore(previousBest);
        setIsNewPersonalBest(true);
        
        // Update localStorage with new personal best
        try {
          const storedData = localStorage.getItem(STORAGE_KEY);
          let personalBests: PersonalBestData[] = storedData ? JSON.parse(storedData) : [];
          
          // Remove any existing record for this level+cause combination
          personalBests = personalBests.filter(
            pb => !(pb.level === currentLevel && pb.cause === currentCause)
          );
          
          // Add new personal best
          personalBests.push({
            level: currentLevel,
            score: currentScore,
            timestamp: Date.now(),
            cause: currentCause
          });
          
          // Keep only the latest 100 records to prevent storage bloat
          personalBests.sort((a, b) => b.timestamp - a.timestamp);
          personalBests = personalBests.slice(0, 100);
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(personalBests));
          
          // Update local state
          setPersonalBestData({
            level: currentLevel,
            score: currentScore,
            timestamp: Date.now(),
            cause: currentCause
          });
          
        } catch (error) {
          console.warn('Failed to save personal best data:', error);
        }
      } else {
        setIsNewPersonalBest(false);
        setPreviousBestScore(null);
      }
    }
  }, [isGameWon, currentScore, currentLevel, currentCause, personalBestData]);

  // Reset achievement state when game starts again
  useEffect(() => {
    if (!isGameWon) {
      setIsNewPersonalBest(false);
      setPreviousBestScore(null);
    }
  }, [isGameWon]);

  return {
    isNewPersonalBest,
    previousBestScore,
    currentPersonalBest: personalBestData?.score || null,
    personalBestData
  };
}

// Utility functions for managing personal bests
export const PersonalBestUtils = {
  // Get all personal bests
  getAllPersonalBests: (): PersonalBestData[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch {
      return [];
    }
  },

  // Get personal best for specific level and cause
  getPersonalBest: (level: number, cause: string): PersonalBestData | null => {
    const allBests = PersonalBestUtils.getAllPersonalBests();
    const levelCauseBest = allBests
      .filter(pb => pb.level === level && pb.cause === cause)
      .sort((a, b) => b.score - a.score)[0];
    
    return levelCauseBest || null;
  },

  // Get overall personal best (highest score across all levels/causes)
  getOverallPersonalBest: (): PersonalBestData | null => {
    const allBests = PersonalBestUtils.getAllPersonalBests();
    return allBests.sort((a, b) => b.score - a.score)[0] || null;
  },

  // Clear all personal best data
  clearAllPersonalBests: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear personal best data:', error);
    }
  },

  // Get personal bests by level
  getPersonalBestsByLevel: (level: number): PersonalBestData[] => {
    const allBests = PersonalBestUtils.getAllPersonalBests();
    return allBests
      .filter(pb => pb.level === level)
      .sort((a, b) => b.score - a.score);
  },

  // Get personal bests by cause
  getPersonalBestsByCause: (cause: string): PersonalBestData[] => {
    const allBests = PersonalBestUtils.getAllPersonalBests();
    return allBests
      .filter(pb => pb.cause === cause)
      .sort((a, b) => b.score - a.score);
  }
};

// Personal Best Tracker component (for display/debugging purposes)
export function PersonalBestTracker({
  currentScore,
  currentLevel,
  currentCause,
  isGameWon,
  onPersonalBestAchieved
}: PersonalBestTrackerProps) {
  const { 
    isNewPersonalBest, 
    previousBestScore, 
    currentPersonalBest 
  } = usePersonalBestTracker(currentScore, currentLevel, currentCause, isGameWon);

  // Notify parent component of personal best achievement
  useEffect(() => {
    if (onPersonalBestAchieved) {
      onPersonalBestAchieved(isNewPersonalBest, previousBestScore || undefined);
    }
  }, [isNewPersonalBest, previousBestScore, onPersonalBestAchieved]);

  // This component doesn't render anything - it's purely for tracking logic
  return null;
}

export default PersonalBestTracker;