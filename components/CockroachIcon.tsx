import React, { useState, useEffect, useCallback } from 'react';

interface CockroachIconProps {
  className?: string;
  size?: number;
  color?: string;
  enableScurrying?: boolean;
  scurryFrequency?: number; // Minutes between scurries (default: 2-5 minutes)
}

function CockroachIcon({ 
  className = "", 
  size = 24, 
  color = "currentColor",
  enableScurrying = false,
  scurryFrequency = 3
}: CockroachIconProps) {
  const [isScurrying, setIsScurrying] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  // Different scurrying path patterns
  const scurryPaths = [
    'scurry-zigzag',
    'scurry-circle',
    'scurry-diagonal',
    'scurry-square',
    'scurry-figure-eight',
    'scurry-random-walk',
    'scurry-spiral',
    'scurry-bounce'
  ];

  // Handle entrance animation
  useEffect(() => {
    if (enableScurrying && !hasEntered) {
      setIsEntering(true);
      
      // Start entrance animation
      const entranceTimer = setTimeout(() => {
        setIsEntering(false);
        setHasEntered(true);
      }, 2000); // 2 second entrance
      
      return () => clearTimeout(entranceTimer);
    }
  }, [enableScurrying, hasEntered]);

  // Function to start a random scurrying animation
  const startScurrying = useCallback(() => {
    if (isScurrying || isEntering || !hasEntered) return; // Don't start if already scurrying, entering, or hasn't entered yet
    
    // Pick a random path
    const randomPath = scurryPaths[Math.floor(Math.random() * scurryPaths.length)];
    setCurrentPath(randomPath);
    setIsScurrying(true);
    
    // Stop scurrying after 3-6 seconds
    const scurryDuration = 3000 + Math.random() * 3000;
    setTimeout(() => {
      setIsScurrying(false);
      setCurrentPath('');
    }, scurryDuration);
  }, [isScurrying, isEntering, hasEntered]);

  // Set up random scurrying intervals (only after entrance is complete)
  useEffect(() => {
    if (!enableScurrying || !hasEntered) return;
    
    const scheduleNextScurry = () => {
      // Random interval between scurries (scurryFrequency ± 50%)
      const baseInterval = scurryFrequency * 60 * 1000; // Convert minutes to milliseconds
      const randomVariation = baseInterval * 0.5 * (Math.random() - 0.5);
      const interval = baseInterval + randomVariation;
      
      return setTimeout(() => {
        startScurrying();
        scheduleNextScurry(); // Schedule the next one
      }, interval);
    };
    
    const timeoutId = scheduleNextScurry();
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [enableScurrying, scurryFrequency, startScurrying, hasEntered]);

  const scurryClasses = isScurrying ? `scurrying ${currentPath}` : '';
  const entranceClass = isEntering ? 'entering' : '';

  return (
    <div className={`cockroach-container ${scurryClasses} ${entranceClass} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cockroach-icon"
      >
        {/* Cockroach body */}
        <ellipse
          cx="12"
          cy="14"
          rx="3.5"
          ry="6"
          fill={color}
          opacity="0.9"
        />
        
        {/* Head */}
        <ellipse
          cx="12"
          cy="8"
          rx="2.5"
          ry="2"
          fill={color}
        />
        
        {/* Antennae */}
        <path
          d="M10.5 6.5c-1-1.5-2-2-3-2.5M13.5 6.5c1-1.5 2-2 3-2.5"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          className="cockroach-antennae"
        />
        
        {/* Legs - Left side with individual animation classes */}
        <path
          d="M8.5 11L6 9.5"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="cockroach-leg-left-1"
          style={{ transformOrigin: '8.5px 11px' }}
        />
        <path
          d="M8.5 14L5.5 13"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="cockroach-leg-left-2"
          style={{ transformOrigin: '8.5px 14px' }}
        />
        <path
          d="M8.5 17L6 18.5"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="cockroach-leg-left-3"
          style={{ transformOrigin: '8.5px 17px' }}
        />
        
        {/* Legs - Right side with individual animation classes */}
        <path
          d="M15.5 11L18 9.5"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="cockroach-leg-right-1"
          style={{ transformOrigin: '15.5px 11px' }}
        />
        <path
          d="M15.5 14L18.5 13"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="cockroach-leg-right-2"
          style={{ transformOrigin: '15.5px 14px' }}
        />
        <path
          d="M15.5 17L18 18.5"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="cockroach-leg-right-3"
          style={{ transformOrigin: '15.5px 17px' }}
        />
        
        {/* Body segments */}
        <line
          x1="9"
          y1="12"
          x2="15"
          y2="12"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.6"
        />
        <line
          x1="9.5"
          y1="15"
          x2="14.5"
          y2="15"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.6"
        />
        
        {/* Eyes */}
        <circle cx="10.5" cy="7.5" r="0.5" fill="white" />
        <circle cx="13.5" cy="7.5" r="0.5" fill="white" />
        <circle cx="10.5" cy="7.5" r="0.2" fill="black" />
        <circle cx="13.5" cy="7.5" r="0.2" fill="black" />
        
        {/* Wing covers (elytra) */}
        <ellipse
          cx="11"
          cy="13"
          rx="1.5"
          ry="4"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.7"
        />
        <ellipse
          cx="13"
          cy="13"
          rx="1.5"
          ry="4"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

// Re-export from this file for backward compatibility
export { CockroachIcon };