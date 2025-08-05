import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { HUMANITARIAN_CAUSES, getLevelMultiplier as sharedGetLevelMultiplier, formatCurrency as sharedFormatCurrency } from './causes-constants';
import { Trophy, Target, TrendingUp, DollarSign } from 'lucide-react';

interface CauseData {
  id: string;
  name: string;
  description: string;
  baseTarget: number;
  category: 'humanitarian' | 'environmental' | 'education' | 'health' | 'social';
  icon: string;
  color: string;
}

interface CauseValueManagerProps {
  currentLevel: number;
  selectedCauseId?: string;
  onCauseSelect?: (causeId: string, targetValue: number) => void;
  onTargetChange?: (targetValue: number) => void;
  showLevelInfo?: boolean;
  className?: string;
}

// Enhanced cause data with UI elements, using shared base values
const baseCauses: CauseData[] = HUMANITARIAN_CAUSES.map(cause => {
  // Add UI-specific data to shared cause data
  const uiData = {
    'clean_water': { icon: '💧', color: 'bg-blue-500', description: 'Provide clean drinking water to communities in need' },
    'education_fund': { icon: '📚', color: 'bg-green-500', description: 'Support educational programs and school supplies' },
    'medical_aid': { icon: '🏥', color: 'bg-red-500', description: 'Provide medical supplies and healthcare support' },
    'food_security': { icon: '🍽️', color: 'bg-orange-500', description: 'Combat hunger and malnutrition globally' },
    'renewable_energy': { icon: '⚡', color: 'bg-yellow-500', description: 'Support clean energy initiatives and solar projects' },
    'wildlife_conservation': { icon: '🦎', color: 'bg-emerald-500', description: 'Protect endangered species and natural habitats' },
    'housing_assistance': { icon: '🏠', color: 'bg-purple-500', description: 'Provide shelter and housing support for families' },
    'disaster_relief': { icon: '🆘', color: 'bg-pink-500', description: 'Emergency aid for natural disaster victims' }
  };
  
  const ui = uiData[cause.id as keyof typeof uiData] || { icon: '💰', color: 'bg-gray-500', description: cause.name };
  
  return {
    id: cause.id,
    name: cause.name,
    description: ui.description,
    baseTarget: cause.baseValue,
    category: cause.category,
    icon: ui.icon,
    color: ui.color
  };
});

export function CauseValueManager({
  currentLevel,
  selectedCauseId,
  onCauseSelect,
  onTargetChange,
  showLevelInfo = true,
  className = ''
}: CauseValueManagerProps) {
  const [selectedCause, setSelectedCause] = useState<CauseData | null>(
    selectedCauseId ? baseCauses.find(c => c.id === selectedCauseId) || baseCauses[0] : baseCauses[0]
  );

  // Use shared level multiplier for consistency
  const getLevelMultiplier = useCallback(sharedGetLevelMultiplier, []);

  // Calculate scaled target value for current level
  const getScaledTarget = useCallback((baseCause: CauseData, level: number): number => {
    const multiplier = getLevelMultiplier(level);
    return Math.round(baseCause.baseTarget * multiplier);
  }, [getLevelMultiplier]);

  // Get current target value
  const getCurrentTarget = useCallback((): number => {
    if (!selectedCause) return 10000;
    return getScaledTarget(selectedCause, currentLevel);
  }, [selectedCause, currentLevel, getScaledTarget]);

  // Handle cause selection
  const handleCauseSelect = useCallback((cause: CauseData) => {
    setSelectedCause(cause);
    const targetValue = getScaledTarget(cause, currentLevel);
    
    if (onCauseSelect) {
      onCauseSelect(cause.id, targetValue);
    }
    
    if (onTargetChange) {
      onTargetChange(targetValue);
    }
  }, [currentLevel, getScaledTarget, onCauseSelect, onTargetChange]);

  // Update target when level changes
  useEffect(() => {
    if (selectedCause && onTargetChange) {
      const newTarget = getScaledTarget(selectedCause, currentLevel);
      onTargetChange(newTarget);
    }
  }, [currentLevel, selectedCause, getScaledTarget, onTargetChange]);

  // Use shared format currency function
  const formatCurrency = sharedFormatCurrency;

  // Get difficulty indicator
  const getDifficultyInfo = () => {
    const multiplier = getLevelMultiplier(currentLevel);
    let difficulty = 'Easy';
    let color = 'text-green-600';
    
    if (multiplier >= 3.0) {
      difficulty = 'Extreme';
      color = 'text-red-600';
    } else if (multiplier >= 2.0) {
      difficulty = 'Hard';
      color = 'text-orange-600';
    } else if (multiplier >= 1.5) {
      difficulty = 'Medium';
      color = 'text-yellow-600';
    }
    
    return { difficulty, color, multiplier };
  };

  const difficultyInfo = getDifficultyInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level and Difficulty Info */}
      {showLevelInfo && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-base font-medium text-gray-800">Level {currentLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <span className={`text-sm font-medium ${difficultyInfo.color}`}>
                {difficultyInfo.difficulty}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Funding targets increased by{' '}
            <span className="font-bold text-purple-600">
              {((difficultyInfo.multiplier - 1) * 100).toFixed(0)}%
            </span>
          </div>
        </Card>
      )}

      {/* Selected Cause Display */}
      {selectedCause && (
        <Card className="p-4 border-2 border-blue-300 bg-blue-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{selectedCause.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedCause.name}</h3>
                <p className="text-sm text-gray-600">{selectedCause.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">Target</span>
              </div>
              <div className="text-xl font-bold text-blue-800">
                {formatCurrency(getCurrentTarget())}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Base: {formatCurrency(selectedCause.baseTarget)}</span>
            <span>Multiplier: {difficultyInfo.multiplier.toFixed(2)}x</span>
          </div>
        </Card>
      )}

      {/* Cause Selection Grid */}
      <div className="grid grid-cols-2 gap-3">
        {baseCauses.map((cause) => {
          const isSelected = selectedCause?.id === cause.id;
          const scaledTarget = getScaledTarget(cause, currentLevel);
          
          return (
            <Button
              key={cause.id}
              variant={isSelected ? "default" : "outline"}
              className={`h-auto p-3 justify-start text-left transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-100 border-blue-300 hover:bg-blue-200' 
                  : 'hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => handleCauseSelect(cause)}
            >
              <div className="flex items-start gap-2 w-full">
                <div className="text-lg">{cause.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-gray-800">
                    {cause.name}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {formatCurrency(scaledTarget)}
                    </span>
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// Hook for managing cause values
export function useCauseValues(initialLevel: number = 1) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [selectedCauseId, setSelectedCauseId] = useState(baseCauses[0].id);

  const getLevelMultiplier = useCallback(sharedGetLevelMultiplier, []);

  const getCurrentTarget = useCallback((): number => {
    const cause = baseCauses.find(c => c.id === selectedCauseId) || baseCauses[0];
    const multiplier = getLevelMultiplier(currentLevel);
    return Math.round(cause.baseTarget * multiplier);
  }, [selectedCauseId, currentLevel, getLevelMultiplier]);

  const setLevel = useCallback((level: number) => {
    setCurrentLevel(Math.max(1, Math.min(12, level)));
  }, []);

  const setCause = useCallback((causeId: string) => {
    if (baseCauses.find(c => c.id === causeId)) {
      setSelectedCauseId(causeId);
    }
  }, []);

  return {
    currentLevel,
    selectedCauseId,
    currentTarget: getCurrentTarget(),
    levelMultiplier: getLevelMultiplier(currentLevel),
    setLevel,
    setCause,
    baseCauses
  };
}

// Utility functions using shared constants
export const CauseUtils = {
  formatCurrency: sharedFormatCurrency,
  
  getLevelMultiplier: sharedGetLevelMultiplier,

  calculateScaledTarget: (baseTarget: number, level: number): number => {
    const multiplier = sharedGetLevelMultiplier(level);
    return Math.round(baseTarget * multiplier);
  },

  getDifficultyName: (level: number): string => {
    const multiplier = sharedGetLevelMultiplier(level);
    if (multiplier >= 3.0) return 'Extreme';
    if (multiplier >= 2.0) return 'Hard';
    if (multiplier >= 1.5) return 'Medium';
    return 'Easy';
  }
};

export default CauseValueManager;