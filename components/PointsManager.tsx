import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';

interface PointsManagerProps {
  initialPoints?: number;
  targetAmount: number;
  onTargetReached?: () => void;
  onPointsChange?: (points: number) => void;
  showAnimations?: boolean;
  showTargetProgress?: boolean;
  className?: string;
}

interface PointChange {
  id: string;
  amount: number;
  timestamp: number;
  x: number;
  y: number;
}

export function PointsManager({
  initialPoints = 0,
  targetAmount,
  onTargetReached,
  onPointsChange,
  showAnimations = true,
  showTargetProgress = true,
  className = ''
}: PointsManagerProps) {
  const [points, setPoints] = useState(initialPoints);
  const [pointChanges, setPointChanges] = useState<PointChange[]>([]);
  const [lastChangeAmount, setLastChangeAmount] = useState(0);
  const [showLastChange, setShowLastChange] = useState(false);
  
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress towards target
  const progress = Math.min((points / targetAmount) * 100, 100);
  const isTargetReached = points >= targetAmount;

  // Handle points change effect
  useEffect(() => {
    if (onPointsChange) {
      onPointsChange(points);
    }
    
    if (isTargetReached && onTargetReached) {
      onTargetReached();
    }
  }, [points, isTargetReached, onPointsChange, onTargetReached]);

  // Add points with optional animation
  const addPoints = useCallback((amount: number, animationPosition?: { x: number; y: number }) => {
    setPoints(prev => {
      const newPoints = prev + amount;
      
      // Show change animation if enabled
      if (showAnimations) {
        setLastChangeAmount(amount);
        setShowLastChange(true);
        
        // Clear existing timeout
        if (changeTimeoutRef.current) {
          clearTimeout(changeTimeoutRef.current);
        }
        
        // Hide change animation after delay
        changeTimeoutRef.current = setTimeout(() => {
          setShowLastChange(false);
          setLastChangeAmount(0);
        }, 2000);
        
        // Add floating point change animation
        if (animationPosition) {
          const changeId = `change-${Date.now()}-${Math.random()}`;
          const newChange: PointChange = {
            id: changeId,
            amount,
            timestamp: Date.now(),
            x: animationPosition.x,
            y: animationPosition.y
          };
          
          setPointChanges(prev => [...prev, newChange]);
          
          // Remove floating animation after duration
          setTimeout(() => {
            setPointChanges(prev => prev.filter(change => change.id !== changeId));
          }, 2000);
        }
      }
      
      return newPoints;
    });
  }, [showAnimations]);

  // Subtract points
  const subtractPoints = useCallback((amount: number) => {
    setPoints(prev => {
      const newPoints = Math.max(0, prev - amount);
      
      if (showAnimations) {
        setLastChangeAmount(-amount);
        setShowLastChange(true);
        
        if (changeTimeoutRef.current) {
          clearTimeout(changeTimeoutRef.current);
        }
        
        changeTimeoutRef.current = setTimeout(() => {
          setShowLastChange(false);
          setLastChangeAmount(0);
        }, 2000);
      }
      
      return newPoints;
    });
  }, [showAnimations]);

  // Set points directly
  const setPointsValue = useCallback((newPoints: number) => {
    setPoints(Math.max(0, newPoints));
  }, []);

  // Reset points
  const resetPoints = useCallback(() => {
    setPoints(initialPoints);
    setPointChanges([]);
    setShowLastChange(false);
    setLastChangeAmount(0);
  }, [initialPoints]);

  // Format points with commas
  const formatPoints = (value: number) => {
    return value.toLocaleString();
  };

  // Get progress bar color based on progress
  const getProgressBarColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main Points Display */}
      <Card className="px-4 py-3 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-700 font-medium">Points</span>
          {showLastChange && lastChangeAmount !== 0 && (
            <span 
              className={`text-sm font-bold animate-bounce ${
                lastChangeAmount > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {lastChangeAmount > 0 ? '+' : ''}{formatPoints(lastChangeAmount)}
            </span>
          )}
        </div>
        
        <div className="text-2xl font-bold text-blue-800 transition-all duration-200">
          {formatPoints(points)}
        </div>
        
        {showTargetProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-blue-600">Target: {formatPoints(targetAmount)}</span>
              <span className="text-sm text-blue-600">{progress.toFixed(1)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {isTargetReached && (
              <div className="text-center mt-2">
                <span className="text-green-600 font-bold text-sm animate-pulse">
                  🎉 Target Reached!
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Floating Point Change Animations */}
      {showAnimations && pointChanges.map((change) => (
        <div
          key={change.id}
          className="absolute pointer-events-none z-50 animate-bounce"
          style={{
            left: `${change.x}px`,
            top: `${change.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className={`text-lg font-bold px-2 py-1 rounded-full shadow-lg ${
            change.amount > 0 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {change.amount > 0 ? '+' : ''}{formatPoints(change.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook for using points management
export function usePointsManager(initialPoints: number = 0) {
  const [points, setPoints] = useState(initialPoints);

  const addPoints = useCallback((amount: number) => {
    setPoints(prev => prev + amount);
  }, []);

  const subtractPoints = useCallback((amount: number) => {
    setPoints(prev => Math.max(0, prev - amount));
  }, []);

  const setPointsValue = useCallback((newPoints: number) => {
    setPoints(Math.max(0, newPoints));
  }, []);

  const resetPoints = useCallback(() => {
    setPoints(initialPoints);
  }, [initialPoints]);

  return {
    points,
    addPoints,
    subtractPoints,
    setPointsValue,
    resetPoints,
    formatPoints: (value: number) => value.toLocaleString()
  };
}

// Utility functions for points management
export const PointsUtils = {
  formatPoints: (value: number) => value.toLocaleString(),
  
  calculateProgress: (current: number, target: number) => 
    Math.min((current / target) * 100, 100),
  
  isTargetReached: (current: number, target: number) => 
    current >= target,
    
  getProgressColor: (progress: number) => {
    if (progress >= 100) return 'green';
    if (progress >= 75) return 'blue';
    if (progress >= 50) return 'yellow';
    if (progress >= 25) return 'orange';
    return 'red';
  }
};

export default PointsManager;