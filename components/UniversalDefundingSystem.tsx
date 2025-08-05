import React, { useState, useEffect, useCallback } from 'react';
import { CockroachIcon } from './CockroachIcon';

interface UniversalDefundingSystemProps {
  isGameActive: boolean;
  defundingAmount: number;
  currentTarget: number;
  difficultyLevel: number;
  onDefundingComplete?: () => void;
}

export function UniversalDefundingSystem({
  isGameActive,
  defundingAmount,
  currentTarget,
  difficultyLevel,
  onDefundingComplete
}: UniversalDefundingSystemProps) {
  const [defundingProgress, setDefundingProgress] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Calculate defunding progress percentage
  useEffect(() => {
    const progress = Math.min((defundingAmount / currentTarget) * 100, 100);
    setDefundingProgress(progress);
    
    // Show warning when defunding reaches 70%
    setShowWarning(progress >= 70);
    
    // Trigger completion callback when fully defunded
    if (progress >= 100 && onDefundingComplete) {
      onDefundingComplete();
    }
  }, [defundingAmount, currentTarget, onDefundingComplete]);

  // Get urgency message based on progress
  const getUrgencyMessage = useCallback(() => {
    if (defundingProgress >= 90) return "CRITICAL: Funding almost depleted!";
    if (defundingProgress >= 70) return "WARNING: Funding running low!";
    if (defundingProgress >= 40) return "NOTICE: Defunding in progress";
    return "Current funding status";
  }, [defundingProgress]);

  // Get main game instruction
  const getGameInstruction = () => {
    return "Beat the DOGIE virtual defunding bug to save your cause!";
  };

  if (!isGameActive) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Main game instruction */}
      <div className="text-center mb-4">
        <p className="text-lg font-boogaloo text-gray-800">
          {getGameInstruction()}
        </p>
      </div>

      {/* Defunding progress display */}
      <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
        showWarning ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <CockroachIcon 
            size={18} 
            color={showWarning ? '#dc2626' : '#d97706'} 
            className="flex-shrink-0"
            enableScurrying={true}
            scurryFrequency={showWarning ? 0.5 : 1.5}
          />
          <span className={`text-sm font-boogaloo ${
            showWarning ? 'text-red-700' : 'text-yellow-700'
          }`}>
            DOGIE Defunding System
          </span>
        </div>
        
        <div className="mb-2">
          <div className={`text-xs font-boogaloo ${
            showWarning ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {getUrgencyMessage()}
          </div>
          <div className={`w-full rounded-full h-2 ${
            showWarning ? 'bg-red-200' : 'bg-yellow-200'
          }`}>
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                showWarning ? 'bg-red-600' : 'bg-yellow-600'
              }`}
              style={{ width: `${defundingProgress}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-xs font-boogaloo ${
            showWarning ? 'text-red-600' : 'text-yellow-600'
          }`}>
            Progress: {defundingProgress.toFixed(1)}%
          </span>
          <span className={`text-xs font-boogaloo ${
            showWarning ? 'text-red-600' : 'text-yellow-600'
          }`}>
            ${defundingAmount.toLocaleString()} / ${currentTarget.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}