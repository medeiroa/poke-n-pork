import React, { useState, useEffect } from 'react';
import { CockroachIcon } from './CockroachIcon';

interface DefundingBugProps {
  currentTarget: number;
  defundingAmount: number;
  difficultyLevel: number;
  isGameActive: boolean;
  className?: string;
}

/**
 * DefundingBug - Visual indicator for virtual defunding bug activity
 * 
 * Replaces the old "DefundingTicker" component - all references to 
 * "virtual defunding ticker" have been updated to "virtual defunding bug" 
 * to maintain consistent terminology throughout the game.
 */
export function DefundingBug({
  currentTarget,
  defundingAmount,
  difficultyLevel,
  isGameActive,
  className = ""
}: DefundingBugProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show the defunding bug when game is active and there's defunding progress
  useEffect(() => {
    setIsVisible(isGameActive && defundingAmount > 0);
  }, [isGameActive, defundingAmount]);

  // Calculate defunding progress percentage
  const defundingProgress = Math.min((defundingAmount / currentTarget) * 100, 100);
  
  // Determine bug urgency based on progress
  const getUrgencyLevel = () => {
    if (defundingProgress >= 90) return 'critical';
    if (defundingProgress >= 70) return 'high';
    if (defundingProgress >= 40) return 'medium';
    return 'low';
  };

  const urgencyLevel = getUrgencyLevel();

  // Bug movement intensity based on urgency
  const getBugAnimationClass = () => {
    switch (urgencyLevel) {
      case 'critical': return 'animate-pulse';
      case 'high': return 'animate-bounce';
      case 'medium': return 'animate-pulse';
      default: return '';
    }
  };

  // Color coding based on urgency
  const getBugColor = () => {
    switch (urgencyLevel) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ea580c'; // orange-600
      case 'medium': return '#d97706'; // amber-600
      default: return '#65a30d'; // lime-600
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg bg-red-50 border-2 border-red-200 ${className}`}>
      <div className={`flex items-center gap-1 ${getBugAnimationClass()}`}>
        <CockroachIcon 
          size={16} 
          color={getBugColor()} 
          className="flex-shrink-0"
          enableScurrying={true}
          scurryFrequency={urgencyLevel === 'critical' ? 0.3 : urgencyLevel === 'high' ? 0.5 : 1}
        />
        <span className="text-xs font-boogaloo text-red-700">
          DOGIE Bug
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs text-red-600 font-boogaloo">
          Defunding: {defundingProgress.toFixed(1)}%
        </div>
        <div className="w-full bg-red-200 rounded-full h-1.5">
          <div 
            className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${defundingProgress}%` }}
          />
        </div>
      </div>
      
      {urgencyLevel === 'critical' && (
        <div className="text-xs text-red-700 font-boogaloo animate-pulse">
          URGENT!
        </div>
      )}
    </div>
  );
}