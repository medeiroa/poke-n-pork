import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CausePointValues, CausePointUtils } from './CausePointValues';
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap,
  Star,
  Crown
} from 'lucide-react';

interface LevelControlProps {
  initialLevel?: number;
  selectedCauseId?: string;
  onLevelChange?: (level: number, newTargetValue: number) => void;
  onCauseValueUpdate?: (causeId: string, scaledValue: number) => void;
  showPointValues?: boolean;
  showLevelInfo?: boolean;
  className?: string;
}

interface LevelTier {
  name: string;
  levels: number[];
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
}

const levelTiers: LevelTier[] = [
  {
    name: 'Rookie',
    levels: [1, 2, 3],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: <Star className="w-4 h-4" />,
    description: 'Learning the ropes'
  },
  {
    name: 'Veteran',
    levels: [4, 5, 6],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: <Trophy className="w-4 h-4" />,
    description: 'Getting serious'
  },
  {
    name: 'Expert',
    levels: [7, 8, 9],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: <Zap className="w-4 h-4" />,
    description: 'High stakes action'
  },
  {
    name: 'Master',
    levels: [10, 11, 12],
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: <Crown className="w-4 h-4" />,
    description: 'Ultimate challenge'
  }
];

export function LevelControl({
  initialLevel = 1,
  selectedCauseId,
  onLevelChange,
  onCauseValueUpdate,
  showPointValues = true,
  showLevelInfo = true,
  className = ''
}: LevelControlProps) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [currentTargetValue, setCurrentTargetValue] = useState(0);

  // Get current tier info
  const getCurrentTier = useCallback((level: number): LevelTier => {
    return levelTiers.find(tier => tier.levels.includes(level)) || levelTiers[0];
  }, []);

  const currentTier = getCurrentTier(currentLevel);

  // Handle level change
  const handleLevelChange = useCallback((newLevel: number) => {
    const clampedLevel = Math.max(1, Math.min(12, newLevel));
    setCurrentLevel(clampedLevel);

    // Calculate new target value if cause is selected
    if (selectedCauseId) {
      const baseCause = CausePointUtils.getAllScaledValues(1).find(c => c.id === selectedCauseId);
      if (baseCause) {
        const newTargetValue = CausePointUtils.calculateScaledValue(baseCause.baseValue, clampedLevel);
        setCurrentTargetValue(newTargetValue);
        
        if (onLevelChange) {
          onLevelChange(clampedLevel, newTargetValue);
        }
        
        if (onCauseValueUpdate) {
          onCauseValueUpdate(selectedCauseId, newTargetValue);
        }
      }
    } else {
      if (onLevelChange) {
        onLevelChange(clampedLevel, 0);
      }
    }
  }, [selectedCauseId, onLevelChange, onCauseValueUpdate]);

  // Handle cause value updates from CausePointValues component
  const handleCauseValueChange = useCallback((causeId: string, scaledValue: number) => {
    if (causeId === selectedCauseId) {
      setCurrentTargetValue(scaledValue);
      
      if (onCauseValueUpdate) {
        onCauseValueUpdate(causeId, scaledValue);
      }
    }
  }, [selectedCauseId, onCauseValueUpdate]);

  // Handle multiplier updates
  const handleMultiplierChange = useCallback((multiplier: number) => {
    // This can be used for additional logic if needed
  }, []);

  // Initialize target value when cause changes
  useEffect(() => {
    if (selectedCauseId) {
      const baseCause = CausePointUtils.getAllScaledValues(1).find(c => c.id === selectedCauseId);
      if (baseCause) {
        const targetValue = CausePointUtils.calculateScaledValue(baseCause.baseValue, currentLevel);
        setCurrentTargetValue(targetValue);
        
        if (onCauseValueUpdate) {
          onCauseValueUpdate(selectedCauseId, targetValue);
        }
      }
    }
  }, [selectedCauseId, currentLevel, onCauseValueUpdate]);

  // Get level progress within current tier
  const getTierProgress = useCallback((level: number, tier: LevelTier): number => {
    const tierIndex = tier.levels.indexOf(level);
    return tierIndex >= 0 ? ((tierIndex + 1) / tier.levels.length) * 100 : 0;
  }, []);

  const tierProgress = getTierProgress(currentLevel, currentTier);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level Control Header */}
      <Card className={`p-4 ${currentTier.bgColor} border-2`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white shadow-sm ${currentTier.color}`}>
              {currentTier.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">Level {currentLevel}</h3>
                <Badge variant="secondary" className={`${currentTier.color} bg-white`}>
                  {currentTier.name}
                </Badge>
              </div>
              {showLevelInfo && (
                <div className="text-sm text-gray-600">{currentTier.description}</div>
              )}
            </div>
          </div>

          {/* Level Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLevelChange(currentLevel - 1)}
              disabled={currentLevel <= 1}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold text-gray-800">{currentLevel}</div>
              <div className="text-xs text-gray-500">of 12</div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLevelChange(currentLevel + 1)}
              disabled={currentLevel >= 12}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{currentTier.name} Progress</span>
            <span className="text-sm font-medium text-gray-800">
              {currentTier.levels.indexOf(currentLevel) + 1}/{currentTier.levels.length}
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-2 shadow-inner">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                currentTier.color.replace('text-', 'bg-')
              }`}
              style={{ width: `${tierProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Level Selectors */}
        <div className="grid grid-cols-4 gap-2">
          {levelTiers.map((tier) => (
            <div key={tier.name} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{tier.name}</div>
              <div className="flex gap-1 justify-center">
                {tier.levels.map((level) => (
                  <Button
                    key={level}
                    variant={currentLevel === level ? "default" : "outline"}
                    size="sm"
                    className={`w-8 h-8 p-0 text-xs ${
                      currentLevel === level 
                        ? `${tier.color} bg-white hover:bg-gray-50` 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => handleLevelChange(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Current Level Stats */}
      {showLevelInfo && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Difficulty Multiplier</span>
              </div>
              <div className="text-xl font-bold text-purple-800">
                {CausePointUtils.calculateLevelMultiplier(currentLevel).toFixed(2)}x
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Current Target</span>
              </div>
              <div className="text-xl font-bold text-blue-800">
                {selectedCauseId ? CausePointUtils.formatCurrency(currentTargetValue) : '--'}
              </div>
            </div>
          </div>

          {selectedCauseId && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Point Value Increase</div>
                <div className="text-lg font-bold text-green-600">
                  +{((CausePointUtils.calculateLevelMultiplier(currentLevel) - 1) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Integrated Point Values Display */}
      {showPointValues && (
        <CausePointValues
          level={currentLevel}
          selectedCauseId={selectedCauseId}
          onValueChange={handleCauseValueChange}
          onLevelMultiplierChange={handleMultiplierChange}
          showScalingInfo={false} // We show this info above
          showIndividualValues={true}
        />
      )}
    </div>
  );
}

// Hook for using level control with automatic cause value updates
export function useLevelControl(initialLevel: number = 1, selectedCauseId?: string) {
  const [level, setLevel] = useState(initialLevel);
  const [targetValue, setTargetValue] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);

  const updateLevel = useCallback((newLevel: number) => {
    const clampedLevel = Math.max(1, Math.min(12, newLevel));
    setLevel(clampedLevel);
    
    const newMultiplier = CausePointUtils.calculateLevelMultiplier(clampedLevel);
    setMultiplier(newMultiplier);

    // Update target value if cause is selected
    if (selectedCauseId) {
      const baseCause = CausePointUtils.getAllScaledValues(1).find(c => c.id === selectedCauseId);
      if (baseCause) {
        const newTargetValue = CausePointUtils.calculateScaledValue(baseCause.baseValue, clampedLevel);
        setTargetValue(newTargetValue);
      }
    }
  }, [selectedCauseId]);

  const handleLevelChange = useCallback((newLevel: number, newTargetValue: number) => {
    setLevel(newLevel);
    setTargetValue(newTargetValue);
    setMultiplier(CausePointUtils.calculateLevelMultiplier(newLevel));
  }, []);

  const handleCauseValueUpdate = useCallback((causeId: string, scaledValue: number) => {
    if (causeId === selectedCauseId) {
      setTargetValue(scaledValue);
    }
  }, [selectedCauseId]);

  // Update values when cause changes
  useEffect(() => {
    if (selectedCauseId) {
      const baseCause = CausePointUtils.getAllScaledValues(1).find(c => c.id === selectedCauseId);
      if (baseCause) {
        const newTargetValue = CausePointUtils.calculateScaledValue(baseCause.baseValue, level);
        setTargetValue(newTargetValue);
      }
    } else {
      setTargetValue(0);
    }
  }, [selectedCauseId, level]);

  return {
    level,
    targetValue,
    multiplier,
    updateLevel,
    handleLevelChange,
    handleCauseValueUpdate,
    getCurrentTier: (lvl: number) => levelTiers.find(tier => tier.levels.includes(lvl)) || levelTiers[0]
  };
}

// Utility functions for level management
export const LevelControlUtils = {
  getTierForLevel: (level: number) => {
    return levelTiers.find(tier => tier.levels.includes(level)) || levelTiers[0];
  },

  getAllTiers: () => levelTiers,

  isLevelInTier: (level: number, tierName: string) => {
    const tier = levelTiers.find(t => t.name === tierName);
    return tier ? tier.levels.includes(level) : false;
  },

  getNextLevel: (currentLevel: number) => {
    return Math.min(12, currentLevel + 1);
  },

  getPreviousLevel: (currentLevel: number) => {
    return Math.max(1, currentLevel - 1);
  },

  getTierProgress: (level: number) => {
    const tier = LevelControlUtils.getTierForLevel(level);
    const tierIndex = tier.levels.indexOf(level);
    return tierIndex >= 0 ? ((tierIndex + 1) / tier.levels.length) * 100 : 0;
  }
};

export default LevelControl;