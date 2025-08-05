import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from './ui/card';
import { TrendingUp, Target, DollarSign, BarChart3 } from 'lucide-react';
import { HUMANITARIAN_CAUSES, getLevelMultiplier, formatCurrency } from './causes-constants';

interface CausePointData {
  id: string;
  name: string;
  baseValue: number;
  category: string;
}

interface CausePointValuesProps {
  level: number;
  selectedCauseId?: string;
  onValueChange?: (causeId: string, scaledValue: number) => void;
  onLevelMultiplierChange?: (multiplier: number) => void;
  showScalingInfo?: boolean;
  showIndividualValues?: boolean;
  className?: string;
}

// Use shared causes from constants file
const baseCausePoints: CausePointData[] = HUMANITARIAN_CAUSES;

export function CausePointValues({
  level,
  selectedCauseId,
  onValueChange,
  onLevelMultiplierChange,
  showScalingInfo = true,
  showIndividualValues = false,
  className = ''
}: CausePointValuesProps) {
  const [currentLevel, setCurrentLevel] = useState(level);

  // Use shared level multiplier function
  const calculateLevelMultiplier = useCallback(getLevelMultiplier, []);

  // Get current multiplier
  const currentMultiplier = useMemo(() => 
    calculateLevelMultiplier(currentLevel), [currentLevel, calculateLevelMultiplier]
  );

  // Calculate scaled point value for a cause
  const calculateScaledValue = useCallback((baseValue: number, gameLevel: number): number => {
    const multiplier = calculateLevelMultiplier(gameLevel);
    return Math.round(baseValue * multiplier);
  }, [calculateLevelMultiplier]);

  // Get all scaled values for current level
  const scaledValues = useMemo(() => {
    return baseCausePoints.map(cause => ({
      ...cause,
      scaledValue: calculateScaledValue(cause.baseValue, currentLevel)
    }));
  }, [currentLevel, calculateScaledValue]);

  // Get current selected cause value
  const currentCauseValue = useMemo(() => {
    if (!selectedCauseId) return 0;
    const cause = baseCausePoints.find(c => c.id === selectedCauseId);
    return cause ? calculateScaledValue(cause.baseValue, currentLevel) : 0;
  }, [selectedCauseId, currentLevel, calculateScaledValue]);

  // Update level when prop changes
  useEffect(() => {
    setCurrentLevel(level);
  }, [level]);

  // Notify parent of multiplier changes
  useEffect(() => {
    if (onLevelMultiplierChange) {
      onLevelMultiplierChange(currentMultiplier);
    }
  }, [currentMultiplier, onLevelMultiplierChange]);

  // Notify parent of selected cause value changes
  useEffect(() => {
    if (selectedCauseId && onValueChange) {
      onValueChange(selectedCauseId, currentCauseValue);
    }
  }, [selectedCauseId, currentCauseValue, onValueChange]);

  // Use shared format currency function (already imported)

  // Get scaling tier info
  const getScalingTier = useCallback((gameLevel: number) => {
    if (gameLevel <= 1) return { tier: 'Starter', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (gameLevel <= 3) return { tier: 'Beginner', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (gameLevel <= 6) return { tier: 'Intermediate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (gameLevel <= 9) return { tier: 'Advanced', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { tier: 'Expert', color: 'text-red-600', bgColor: 'bg-red-50' };
  }, []);

  const scalingTier = getScalingTier(currentLevel);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Level Scaling Info */}
      {showScalingInfo && (
        <Card className={`p-4 ${scalingTier.bgColor} border-2`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <span className="text-base font-medium text-gray-800">
                Level {currentLevel} Point Scaling
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${scalingTier.color} bg-white border`}>
              {scalingTier.tier}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Multiplier</span>
              </div>
              <div className="text-xl font-bold text-purple-800">
                {currentMultiplier.toFixed(2)}x
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Current Target</span>
              </div>
              <div className="text-xl font-bold text-blue-800">
                {selectedCauseId ? formatCurrency(currentCauseValue) : '--'}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Point values increase by{' '}
              <span className="font-medium text-purple-600">
                {((currentMultiplier - 1) * 100).toFixed(0)}%
              </span>{' '}
              from base level
            </div>
          </div>
        </Card>
      )}

      {/* Individual Cause Values */}
      {showIndividualValues && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-800">Scaled Point Values</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {scaledValues.map((cause) => {
              const isSelected = selectedCauseId === cause.id;
              const increase = ((cause.scaledValue - cause.baseValue) / cause.baseValue) * 100;

              return (
                <div
                  key={cause.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                      {cause.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {cause.category}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                      {formatCurrency(cause.scaledValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Base: {formatCurrency(cause.baseValue)}
                    </div>
                    {increase > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        +{increase.toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Stats Summary */}
      <Card className="p-3 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Min Target</div>
            <div className="text-sm font-medium text-gray-800">
              {formatCurrency(Math.min(...scaledValues.map(c => c.scaledValue)))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Max Target</div>
            <div className="text-sm font-medium text-gray-800">
              {formatCurrency(Math.max(...scaledValues.map(c => c.scaledValue)))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Average</div>
            <div className="text-sm font-medium text-gray-800">
              {formatCurrency(Math.round(scaledValues.reduce((sum, c) => sum + c.scaledValue, 0) / scaledValues.length))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Hook for managing cause point values
export function useCausePointValues(initialLevel: number = 1) {
  const [level, setLevel] = useState(initialLevel);
  const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [currentValue, setCurrentValue] = useState(0);

  const updateLevel = useCallback((newLevel: number) => {
    setLevel(Math.max(1, Math.min(12, newLevel)));
  }, []);

  const selectCause = useCallback((causeId: string) => {
    setSelectedCauseId(causeId);
  }, []);

  const handleValueChange = useCallback((causeId: string, scaledValue: number) => {
    if (causeId === selectedCauseId) {
      setCurrentValue(scaledValue);
    }
  }, [selectedCauseId]);

  const handleMultiplierChange = useCallback((multiplier: number) => {
    setCurrentMultiplier(multiplier);
  }, []);

  return {
    level,
    selectedCauseId,
    currentMultiplier,
    currentValue,
    updateLevel,
    selectCause,
    handleValueChange,
    handleMultiplierChange,
    baseCauses: baseCausePoints
  };
}

// Utility functions for cause point calculations using shared functions
export const CausePointUtils = {
  calculateLevelMultiplier: getLevelMultiplier,

  calculateScaledValue: (baseValue: number, level: number): number => {
    const multiplier = getLevelMultiplier(level);
    return Math.round(baseValue * multiplier);
  },

  formatCurrency: formatCurrency,

  getScalingTier: (level: number): { tier: string; multiplier: number } => {
    const multiplier = getLevelMultiplier(level);
    let tier = 'Starter';
    
    if (level <= 1) tier = 'Starter';
    else if (level <= 3) tier = 'Beginner';
    else if (level <= 6) tier = 'Intermediate';
    else if (level <= 9) tier = 'Advanced';
    else tier = 'Expert';

    return { tier, multiplier };
  },

  getAllScaledValues: (level: number) => {
    return baseCausePoints.map(cause => ({
      ...cause,
      scaledValue: CausePointUtils.calculateScaledValue(cause.baseValue, level),
      increase: ((CausePointUtils.calculateScaledValue(cause.baseValue, level) - cause.baseValue) / cause.baseValue) * 100
    }));
  }
};

export default CausePointValues;