

import React, { useState, useEffect, useRef } from 'react';

interface PointsDisplayProps {
  points: number;
  label?: string;
  showChange?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  animated?: boolean;
}

export function PointsDisplay({
  points,
  label = "Points",
  showChange = true,
  size = 'medium',
  variant = 'default',
  animated = true
}: PointsDisplayProps) {
  const [previousPoints, setPreviousPoints] = useState(points);
  const [pointChange, setPointChange] = useState(0);
  const [showChangeAnimation, setShowChangeAnimation] = useState(false);
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track point changes for animation
  useEffect(() => {
    if (points !== previousPoints && showChange) {
      const change = points - previousPoints;
      setPointChange(change);
      setShowChangeAnimation(true);
      setPreviousPoints(points);

      // Clear existing timeout
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }

      // Hide change animation after delay
      changeTimeoutRef.current = setTimeout(() => {
        setShowChangeAnimation(false);
        setPointChange(0);
      }, 2000);
    } else if (points !== previousPoints) {
      setPreviousPoints(points);
    }
  }, [points, previousPoints, showChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  // Format points with commas
  const formatPoints = (value: number) => {
    return value.toLocaleString();
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-3 py-2',
          label: 'text-sm',
          points: 'text-lg font-bold',
          change: 'text-xs'
        };
      case 'large':
        return {
          container: 'px-6 py-4',
          label: 'text-lg',
          points: 'text-3xl font-bold',
          change: 'text-base'
        };
      default: // medium
        return {
          container: 'px-4 py-3',
          label: 'text-base',
          points: 'text-2xl font-bold',
          change: 'text-sm'
        };
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          background: 'bg-green-50 border-green-200',
          label: 'text-green-700',
          points: 'text-green-800',
          change: 'text-green-600'
        };
      case 'warning':
        return {
          background: 'bg-yellow-50 border-yellow-200',
          label: 'text-yellow-700',
          points: 'text-yellow-800',
          change: 'text-yellow-600'
        };
      case 'danger':
        return {
          background: 'bg-red-50 border-red-200',
          label: 'text-red-700',
          points: 'text-red-800',
          change: 'text-red-600'
        };
      default:
        return {
          background: 'bg-blue-50 border-blue-200',
          label: 'text-blue-700',
          points: 'text-blue-800',
          change: 'text-blue-600'
        };
    }
  };

  // Get change animation classes
  const getChangeClasses = () => {
    if (pointChange > 0) {
      return 'text-green-600';
    } else if (pointChange < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <div className={`relative rounded-lg border-2 ${sizeClasses.container} ${variantClasses.background}`}>
      {/* Label */}
      <div className={`${sizeClasses.label} ${variantClasses.label} font-medium`}>
        {label}
      </div>
      
      {/* Points Display */}
      <div className={`${sizeClasses.points} ${variantClasses.points} ${animated ? 'transition-all duration-200' : ''}`}>
        {formatPoints(points)}
      </div>
      
      {/* Change Animation */}
      {showChangeAnimation && pointChange !== 0 && (
        <div 
          className={`
            absolute -top-2 -right-2 
            ${sizeClasses.change} 
            ${getChangeClasses()} 
            font-bold 
            animate-bounce
            bg-white 
            px-2 py-1 
            rounded-full 
            shadow-lg 
            border
          `}
        >
          {pointChange > 0 ? '+' : ''}{formatPoints(pointChange)}
        </div>
      )}
      
      {/* Pulse effect for large changes */}
      {animated && Math.abs(pointChange) >= 1000 && showChangeAnimation && (
        <div className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-ping opacity-75" />
      )}
    </div>
  );
}

// Specialized component for money display
export function MoneyDisplay({ 
  money, 
  showCurrency = false,
  ...props 
}: Omit<PointsDisplayProps, 'points'> & { 
  money: number;
  showCurrency?: boolean;
}) {
  const formatMoney = (value: number) => {
    const formatted = value.toLocaleString();
    return showCurrency ? `$${formatted}` : formatted;
  };

  return (
    <div className={`relative rounded-lg border-2 ${props.size === 'small' ? 'px-3 py-2' : props.size === 'large' ? 'px-6 py-4' : 'px-4 py-3'} ${props.variant === 'success' ? 'bg-green-50 border-green-200' : props.variant === 'warning' ? 'bg-yellow-50 border-yellow-200' : props.variant === 'danger' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
      {/* Label */}
      <div className={`${props.size === 'small' ? 'text-sm' : props.size === 'large' ? 'text-lg' : 'text-base'} ${props.variant === 'success' ? 'text-green-700' : props.variant === 'warning' ? 'text-yellow-700' : props.variant === 'danger' ? 'text-red-700' : 'text-blue-700'} font-medium`}>
        {props.label || "Money"}
      </div>
      
      {/* Money Display */}
      <div className={`${props.size === 'small' ? 'text-lg' : props.size === 'large' ? 'text-3xl' : 'text-2xl'} ${props.variant === 'success' ? 'text-green-800' : props.variant === 'warning' ? 'text-yellow-800' : props.variant === 'danger' ? 'text-red-800' : 'text-blue-800'} font-bold ${props.animated !== false ? 'transition-all duration-200' : ''}`}>
        {formatMoney(money)}
      </div>
    </div>
  );
}

// Specialized component for target display
export function TargetDisplay({ 
  current, 
  target, 
  ...props 
}: Omit<PointsDisplayProps, 'points'> & { 
  current: number;
  target: number;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className={`relative rounded-lg border-2 ${props.size === 'small' ? 'px-3 py-2' : props.size === 'large' ? 'px-6 py-4' : 'px-4 py-3'} ${isComplete ? 'bg-green-50 border-green-200' : props.variant === 'warning' ? 'bg-yellow-50 border-yellow-200' : props.variant === 'danger' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
      {/* Label */}
      <div className={`${props.size === 'small' ? 'text-sm' : props.size === 'large' ? 'text-lg' : 'text-base'} ${isComplete ? 'text-green-700' : props.variant === 'warning' ? 'text-yellow-700' : props.variant === 'danger' ? 'text-red-700' : 'text-blue-700'} font-medium`}>
        {props.label || "Target"}
      </div>
      
      {/* Progress Display */}
      <div className={`${props.size === 'small' ? 'text-lg' : props.size === 'large' ? 'text-3xl' : 'text-2xl'} ${isComplete ? 'text-green-800' : props.variant === 'warning' ? 'text-yellow-800' : props.variant === 'danger' ? 'text-red-800' : 'text-blue-800'} font-bold`}>
        {current.toLocaleString()} / {target.toLocaleString()}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress Percentage */}
      <div className={`text-xs mt-1 ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
        {progress.toFixed(1)}% Complete
      </div>
    </div>
  );
}