import React from 'react';

interface RockingPorkHeadProps {
  onToggle: () => void;
  isMinimized: boolean;
  onUnlockAudio?: () => Promise<void>;
  size?: 'small' | 'medium' | 'large' | 'xl';
  showHint?: boolean;
  className?: string;
  disabled?: boolean;
}

export function RockingPorkHead({
  onToggle,
  isMinimized,
  onUnlockAudio,
  size = 'xl',
  showHint = true,
  className = '',
  disabled = false
}: RockingPorkHeadProps) {
  
  // Handle pork head click/tap
  const handlePorkHeadClick = async () => {
    if (disabled) return;
    
    // Unlock audio on user interaction (for mobile)
    if (onUnlockAudio) {
      await onUnlockAudio();
    }
    
    onToggle();
  };

  // Size mappings
  const sizeClasses = {
    small: 'text-4xl',
    medium: 'text-6xl',
    large: 'text-7xl',
    xl: 'text-8xl'
  };

  const touchTargetSizes = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const paddingSizes = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-3',
    xl: 'p-4'
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`pork-head-container relative inline-block ${disabled ? 'opacity-50' : ''}`}>
        {/* Visual pork head (no interaction) */}
        <div className={`${paddingSizes[size]} rounded-full transition-all duration-200 ${
          disabled 
            ? '' 
            : 'hover:bg-gray-100 hover:bg-opacity-50 active:bg-gray-200 active:bg-opacity-70'
        }`}>
          <span className={`inline-block animate-rock ${sizeClasses[size]} ${
            disabled 
              ? 'grayscale' 
              : 'hover:scale-105 active:scale-95'
          } transition-transform duration-200`}>
            🐷
          </span>
        </div>
        
        {/* Transparent clickable overlay */}
        <div
          className={`absolute inset-0 w-full h-full ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          } z-10`}
          onClick={handlePorkHeadClick}
          onTouchStart={(e) => {
            if (disabled) return;
            // Prevent double-tap zoom on mobile
            e.preventDefault();
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={
            disabled 
              ? "Pork head (disabled)" 
              : isMinimized 
                ? "Tap to expand header" 
                : "Tap to minimize header"
          }
          title={
            disabled 
              ? "Pork head (disabled)" 
              : isMinimized 
                ? "Tap to expand header" 
                : "Tap to minimize header"
          }
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePorkHeadClick();
            }
          }}
        />
        
        {/* Visual indicator for interactivity */}
        {!disabled && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${touchTargetSizes[size]} rounded-full border-2 border-gray-300 border-opacity-0 hover:border-opacity-30 active:border-opacity-50 transition-all duration-200 pointer-events-none`} />
        )}
        
        {/* Tap hint for first-time users */}
        {showHint && !disabled && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-70 pointer-events-none">
            Tap to {isMinimized ? 'expand' : 'collapse'}
          </div>
        )}
      </div>
    </div>
  );
}

// Utility component for inline pork head (no center wrapper)
export function InlineRockingPorkHead({
  onToggle,
  isMinimized,
  onUnlockAudio,
  size = 'medium',
  showHint = false,
  className = '',
  disabled = false
}: RockingPorkHeadProps) {
  
  // Handle pork head click/tap
  const handlePorkHeadClick = async () => {
    if (disabled) return;
    
    // Unlock audio on user interaction (for mobile)
    if (onUnlockAudio) {
      await onUnlockAudio();
    }
    
    onToggle();
  };

  // Size mappings
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-5xl',
    xl: 'text-6xl'
  };

  const touchTargetSizes = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const paddingSizes = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-2',
    xl: 'p-3'
  };

  return (
    <div className={`pork-head-container relative inline-block ${disabled ? 'opacity-50' : ''} ${className}`}>
      {/* Visual pork head (no interaction) */}
      <div className={`${paddingSizes[size]} rounded-full transition-all duration-200 ${
        disabled 
          ? '' 
          : 'hover:bg-gray-100 hover:bg-opacity-50 active:bg-gray-200 active:bg-opacity-70'
      }`}>
        <span className={`inline-block animate-rock ${sizeClasses[size]} ${
          disabled 
            ? 'grayscale' 
            : 'hover:scale-105 active:scale-95'
        } transition-transform duration-200`}>
          🐷
        </span>
      </div>
      
      {/* Transparent clickable overlay */}
      <div
        className={`absolute inset-0 w-full h-full ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } z-10`}
        onClick={handlePorkHeadClick}
        onTouchStart={(e) => {
          if (disabled) return;
          // Prevent double-tap zoom on mobile
          e.preventDefault();
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={
          disabled 
            ? "Pork head (disabled)" 
            : isMinimized 
              ? "Tap to expand" 
              : "Tap to minimize"
        }
        title={
          disabled 
            ? "Pork head (disabled)" 
            : isMinimized 
              ? "Tap to expand" 
              : "Tap to minimize"
        }
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePorkHeadClick();
          }
        }}
      />
      
      {/* Visual indicator for interactivity */}
      {!disabled && (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${touchTargetSizes[size]} rounded-full border-2 border-gray-300 border-opacity-0 hover:border-opacity-30 active:border-opacity-50 transition-all duration-200 pointer-events-none`} />
      )}
      
      {/* Tap hint for first-time users */}
      {showHint && !disabled && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-70 pointer-events-none whitespace-nowrap">
          Tap to {isMinimized ? 'expand' : 'collapse'}
        </div>
      )}
    </div>
  );
}

// Utility component for decorative pork head (no interaction)
export function DecorativeRockingPorkHead({
  size = 'medium',
  className = '',
  animate = true,
  emoji = '🐷'
}: {
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  animate?: boolean;
  emoji?: string;
}) {
  
  // Size mappings
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
    xl: 'text-8xl'
  };

  return (
    <div className={`text-center ${className}`}>
      <span className={`inline-block ${animate ? 'animate-rock' : ''} ${sizeClasses[size]} select-none`}>
        {emoji}
      </span>
    </div>
  );
}

// Custom hook for pork head state management
export function usePorkHeadState(initialMinimized: boolean = true) {
  const [isMinimized, setIsMinimized] = React.useState(initialMinimized);
  
  const toggleMinimized = React.useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const expand = React.useCallback(() => {
    setIsMinimized(false);
  }, []);

  const minimize = React.useCallback(() => {
    setIsMinimized(true);
  }, []);

  return {
    isMinimized,
    toggleMinimized,
    expand,
    minimize,
    setIsMinimized
  };
}

// Utility function for pork head sizing
export function getPorkHeadSizeForContext(context: 'header' | 'sidebar' | 'button' | 'icon') {
  switch (context) {
    case 'header':
      return 'xl';
    case 'sidebar':
      return 'medium';
    case 'button':
      return 'small';
    case 'icon':
      return 'small';
    default:
      return 'medium';
  }
}