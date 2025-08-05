import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Globe, Share2 } from 'lucide-react';
import { usePersonalBestTracker } from './PersonalBestTracker';

interface UniversalVictorySystemProps {
  // Core game state
  isGameActive: boolean;
  isGameWon: boolean;
  money: number;
  currentTarget: number;
  difficultyLevel: number;
  selectedAgency: string;
  
  // Audio settings
  soundEnabled: boolean;
  audioContextRef?: React.MutableRefObject<AudioContext | null>;
  initializeAudio?: () => Promise<AudioContext | null>;
  
  // Event handlers
  onSessionEnd: (success: boolean) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  onShare?: () => void;
  
  // Optional customization
  customVictoryMessage?: string;
  showPlayerProfile?: boolean;
  showShareButton?: boolean;
  showLeaderboardButton?: boolean;
  
  // Victory animation settings
  enableConfetti?: boolean;
  victoryEmojis?: string[];
  customBackgroundGradient?: string;
}

export function UniversalVictorySystem({
  isGameActive,
  isGameWon,
  money,
  currentTarget,
  difficultyLevel,
  selectedAgency,
  soundEnabled = true,
  audioContextRef,
  initializeAudio,
  onSessionEnd,
  onNavigateToLeaderboard,
  onShare,
  customVictoryMessage,
  showPlayerProfile = true,
  showShareButton = true,
  showLeaderboardButton = true,
  enableConfetti = true,
  victoryEmojis = ['🎉', '🏆', '🎊', '⭐', '🌟'],
  customBackgroundGradient = 'from-yellow-100 to-green-100'
}: UniversalVictorySystemProps) {
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [achievementLevel, setAchievementLevel] = useState<string>('');

  // Personal Best Tracking
  const { 
    isNewPersonalBest, 
    previousBestScore, 
    currentPersonalBest 
  } = usePersonalBestTracker(money, difficultyLevel, selectedAgency, isGameWon && sessionSuccess);

  // Enhanced victory sound with multiple celebration tones
  const playVictorySound = useCallback(async () => {
    if (!soundEnabled || !initializeAudio) return;
    
    try {
      const audioContext = await initializeAudio();
      if (!audioContext) return;
      
      // Ensure context is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      if (audioContext.state !== 'running') return;
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.25, audioContext.currentTime);

      // Enhanced victory melody based on difficulty level
      const getVictoryMelody = () => {
        if (difficultyLevel <= 3) {
          // Simple celebration for beginners
          return [
            { freq: 261.63, start: 0, duration: 0.3 },    // C4
            { freq: 329.63, start: 0.2, duration: 0.3 },  // E4
            { freq: 392.00, start: 0.4, duration: 0.5 }   // G4
          ];
        } else if (difficultyLevel <= 6) {
          // Medium celebration
          return [
            { freq: 261.63, start: 0, duration: 0.3 },    // C4
            { freq: 329.63, start: 0.2, duration: 0.3 },  // E4
            { freq: 392.00, start: 0.4, duration: 0.3 },  // G4
            { freq: 523.25, start: 0.6, duration: 0.4 }   // C5
          ];
        } else if (difficultyLevel <= 9) {
          // Advanced celebration
          return [
            { freq: 261.63, start: 0, duration: 0.25 },   // C4
            { freq: 329.63, start: 0.15, duration: 0.25 }, // E4
            { freq: 392.00, start: 0.3, duration: 0.25 },  // G4
            { freq: 523.25, start: 0.45, duration: 0.25 }, // C5
            { freq: 659.25, start: 0.6, duration: 0.25 },  // E5
            { freq: 783.99, start: 0.75, duration: 0.4 }   // G5
          ];
        } else {
          // Legendary celebration for masters
          return [
            { freq: 261.63, start: 0, duration: 0.2 },     // C4
            { freq: 329.63, start: 0.1, duration: 0.2 },   // E4
            { freq: 392.00, start: 0.2, duration: 0.2 },   // G4
            { freq: 523.25, start: 0.3, duration: 0.2 },   // C5
            { freq: 659.25, start: 0.4, duration: 0.2 },   // E5
            { freq: 783.99, start: 0.5, duration: 0.2 },   // G5
            { freq: 1046.5, start: 0.6, duration: 0.3 },   // C6
            { freq: 1318.5, start: 0.8, duration: 0.4 }    // E6
          ];
        }
      };

      const notes = getVictoryMelody();

      notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        
        // Enhanced envelope with dynamic attack based on position
        const attackTime = 0.02 + (index * 0.01);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.8, audioContext.currentTime + note.start + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Dynamic filter sweep
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000 + (index * 300), audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(1500 + (index * 150), audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
      });

    } catch (error) {
      console.log('Victory sound audio not supported or blocked');
    }
  }, [initializeAudio, soundEnabled, difficultyLevel]);

  // Check victory conditions and trigger celebrations
  useEffect(() => {
    if (isGameActive && money >= currentTarget && !isGameWon) {
      endSession();
    }
  }, [isGameActive, money, currentTarget, isGameWon]);

  // End session and determine achievement level
  const endSession = useCallback(() => {
    const success = money >= currentTarget;
    const overagePercentage = ((money - currentTarget) / currentTarget) * 100;
    
    setSessionEnded(true);
    setSessionSuccess(success);
    
    // Determine achievement level based on performance
    if (success) {
      if (overagePercentage >= 200) {
        setAchievementLevel('LEGENDARY');
      } else if (overagePercentage >= 100) {
        setAchievementLevel('OUTSTANDING');
      } else if (overagePercentage >= 50) {
        setAchievementLevel('EXCELLENT');
      } else if (overagePercentage >= 25) {
        setAchievementLevel('GREAT');
      } else {
        setAchievementLevel('GOOD');
      }
    }
    
    onSessionEnd(success);
  }, [money, currentTarget, onSessionEnd]);

  // Trigger victory effects
  useEffect(() => {
    if (sessionEnded && sessionSuccess && isGameWon) {
      const victoryTimer = setTimeout(() => {
        playVictorySound();
        if (enableConfetti) {
          setConfettiActive(true);
          // Stop confetti after animation
          setTimeout(() => setConfettiActive(false), 3000);
        }
      }, 200);

      return () => clearTimeout(victoryTimer);
    }
  }, [sessionEnded, sessionSuccess, isGameWon, playVictorySound, enableConfetti]);

  // Reset victory state
  useEffect(() => {
    if (isGameActive || !isGameWon) {
      setSessionEnded(false);
      setSessionSuccess(false);
      setConfettiActive(false);
      setAchievementLevel('');
    }
  }, [isGameActive, isGameWon]);

  // Get dynamic congratulations message
  const getCongratulationsMessage = () => {
    if (customVictoryMessage) return customVictoryMessage;
    
    // Special messages for personal bests
    if (isNewPersonalBest) {
      const personalBestMessages = {
        'LEGENDARY': `👑 NEW PERSONAL BEST! LEGENDARY ACHIEVEMENT on Level ${difficultyLevel}!`,
        'OUTSTANDING': `🥇 NEW PERSONAL BEST! OUTSTANDING performance on Level ${difficultyLevel}!`,
        'EXCELLENT': `🏅 NEW PERSONAL BEST! EXCELLENT mastery of Level ${difficultyLevel}!`,
        'GREAT': `🎖️ NEW PERSONAL BEST! GREAT achievement on Level ${difficultyLevel}!`,
        'GOOD': `🏆 NEW PERSONAL BEST! You've achieved your best score on Level ${difficultyLevel}!`
      };
      
      return personalBestMessages[achievementLevel as keyof typeof personalBestMessages] || 
             `🏆 NEW PERSONAL BEST! Victory achieved on Level ${difficultyLevel}!`;
    }
    
    const messages = {
      'LEGENDARY': `🌟 LEGENDARY ACHIEVEMENT! You've transcended the impossible on Level ${difficultyLevel}!`,
      'OUTSTANDING': `🚀 OUTSTANDING PERFORMANCE! Level ${difficultyLevel} mastery achieved!`,
      'EXCELLENT': `⭐ EXCELLENT WORK! You've conquered Level ${difficultyLevel} with style!`,
      'GREAT': `🎯 GREAT JOB! Level ${difficultyLevel} completed successfully!`,
      'GOOD': `🎉 GOOD! You've completed Level ${difficultyLevel}!`
    };
    
    return messages[achievementLevel as keyof typeof messages] || `Victory achieved on Level ${difficultyLevel}!`;
  };

  // Get level-specific praise subtext
  const getLevelPraise = () => {
    // Special praise for personal bests
    if (isNewPersonalBest) {
      const personalBestPraise = {
        1: "New personal best! You're building a strong foundation for change.",
        2: "Personal record achieved! Your commitment to helping others is growing.",
        3: "Best score yet! Your dedication to the cause is truly remarkable.",
        4: "New high score! You're becoming an unstoppable force for good.",
        5: "Personal best achieved! Your midpoint mastery is inspiring others.",
        6: "Record-breaking performance! You've surpassed your previous limits.",
        7: "New personal peak! Your elite skills are making extraordinary impact.",
        8: "Personal best mastery! You've set a new standard for yourself.",
        9: "Legendary personal record! Your expertise reaches new heights.",
        10: "Champion-level personal best! You've achieved peak performance.",
        11: "Beyond your previous best! You've redefined your own excellence.",
        12: "Ultimate personal achievement! You've transcended your own records."
      };
      
      const improvement = previousBestScore ? 
        ` (Improved by ${(money - previousBestScore).toLocaleString()} points!)` : '';
      
      return (personalBestPraise[difficultyLevel as keyof typeof personalBestPraise] || 
              "New personal best achieved!") + improvement;
    }

    const levelPraise = {
      1: "Welcome to the movement! Your first step toward making a difference.",
      2: "Building momentum! You're getting the hang of helping others.",
      3: "Gaining confidence! Your commitment to the cause is showing.",
      4: "Finding your rhythm! You're becoming a true champion of change.",
      5: "Halfway milestone! Your dedication is truly inspiring others.",
      6: "Rising above! You've proven your commitment goes beyond the ordinary.",
      7: "Elite territory! Your skills are helping causes in extraordinary ways.",
      8: "Master level! You're setting the standard for compassionate action.",
      9: "Legendary status! Your expertise is transforming lives around the world.",
      10: "Champion tier! You've reached the pinnacle of humanitarian excellence.",
      11: "Beyond mastery! Your achievements will inspire generations of helpers.",
      12: "Ultimate legend! You've transcended all expectations and changed the world."
    };
    
    return levelPraise[difficultyLevel as keyof typeof levelPraise] || "Incredible achievement unlocked!";
  };

  // Get player profile data
  const getPlayerData = () => {
    try {
      const playerImage = localStorage.getItem('poke-n-pork-player-image') || '👤';
      const playerName = localStorage.getItem('poke-n-pork-player-name') || 'Anonymous Champion';
      return { playerImage, playerName };
    } catch {
      return { playerImage: '👤', playerName: 'Anonymous Champion' };
    }
  };

  // Get achievement color scheme
  const getAchievementColors = () => {
    const colorSchemes = {
      'LEGENDARY': { 
        bg: 'from-purple-200 via-pink-200 to-yellow-200',
        border: 'border-purple-500',
        text: 'text-purple-800',
        badge: 'bg-purple-500'
      },
      'OUTSTANDING': { 
        bg: 'from-blue-200 via-indigo-200 to-purple-200',
        border: 'border-blue-500',
        text: 'text-blue-800',
        badge: 'bg-blue-500'
      },
      'EXCELLENT': { 
        bg: 'from-green-200 via-emerald-200 to-teal-200',
        border: 'border-green-500',
        text: 'text-green-800',
        badge: 'bg-green-500'
      },
      'GREAT': { 
        bg: 'from-yellow-200 via-orange-200 to-red-200',
        border: 'border-yellow-500',
        text: 'text-yellow-800',
        badge: 'bg-yellow-500'
      },
      'GOOD': { 
        bg: customBackgroundGradient,
        border: 'border-green-400',
        text: 'text-green-800',
        badge: 'bg-green-500'
      }
    };
    
    return colorSchemes[achievementLevel as keyof typeof colorSchemes] || colorSchemes.GOOD;
  };

  // Get personal best badge colors
  const getPersonalBestColors = () => {
    return {
      bg: 'from-amber-200 via-yellow-200 to-orange-200',
      border: 'border-amber-500',
      text: 'text-amber-800',
      badge: 'bg-amber-500'
    };
  };

  // Public reset method
  const resetVictory = useCallback(() => {
    setSessionEnded(false);
    setSessionSuccess(false);
    setConfettiActive(false);
    setAchievementLevel('');
  }, []);

  // Expose reset function globally
  useEffect(() => {
    (window as any).resetUniversalVictory = resetVictory;
    return () => {
      delete (window as any).resetUniversalVictory;
    };
  }, [resetVictory]);

  // Render victory screen
  if (isGameWon && !isGameActive && sessionEnded && sessionSuccess) {
    const { playerImage, playerName } = getPlayerData();
    const colors = isNewPersonalBest ? getPersonalBestColors() : getAchievementColors();
    const overage = money - currentTarget;
    const overagePercentage = Math.round((overage / currentTarget) * 100);
    
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${colors.bg} ${confettiActive ? 'animate-pulse' : ''}`}>
        {/* Floating celebration emojis */}
        {confettiActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <span className="text-3xl">
                  {victoryEmojis[Math.floor(Math.random() * victoryEmojis.length)]}
                </span>
              </div>
            ))}
          </div>
        )}

        <Card className={`text-center p-1 rounded-2xl shadow-xl border-2 ${colors.border} bg-white/95 backdrop-blur-sm max-w-2xl mx-4`}>
          {/* Centered Victory Title */}
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <div className="text-4xl">
              {isNewPersonalBest ? '🥇' : achievementLevel === 'LEGENDARY' ? '👑' : '🏆'}
            </div>
            <p className={`text-3xl font-bold font-boogaloo ${colors.text}`}>
              {isNewPersonalBest ? 'PERSONAL BEST!' : 'VICTORY!'}
            </p>
          </div>
          
          {/* Cause Name Subtext */}
          <div className="text-center mb-0.5">
            <p className="text-lg text-gray-600 font-boogaloo">
              Supporting: {selectedAgency}
            </p>
          </div>
          
          {/* Full-Width Player Profile */}
          {showPlayerProfile && (
            <div className="flex items-center justify-center gap-1 p-0.5 bg-gray-50 rounded-lg mb-0.5 -mx-1">
              <span className="text-2xl animate-rock">{playerImage}</span>
              <div className="text-left">
                <p className="text-base font-medium text-gray-700 font-boogaloo">{playerName}</p>
                <p className="text-sm text-gray-500">Level {difficultyLevel}</p>
              </div>
            </div>
          )}
          
          {/* Full-Width Statistics Section */}
          <div className="bg-gray-50 rounded-lg p-0.5 mb-0.5 -mx-1">
            <div className="flex items-center justify-center gap-3">
              <div className="text-center rounded-lg p-0.5">
                <span className="text-sm font-boogaloo text-gray-600">💰 Achieved</span>
                <p className="text-xl font-bold text-green-600 font-boogaloo">{money.toLocaleString()}</p>
              </div>
              
              {/* New Personal Best Label - Positioned to the right */}
              {isNewPersonalBest && (
                <div className="bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-boogaloo font-bold shadow-lg">
                  🆕 NEW PERSONAL BEST!
                </div>
              )}
            </div>
          </div>
          
          {/* Centered Praise Text */}
          <div className="mb-0.5 text-center">
            <p className="text-sm text-gray-600 font-boogaloo leading-tight max-w-sm mx-auto">
              {getLevelPraise()}
            </p>
          </div>
          
          {/* Compact Action Buttons */}
          <div className="flex flex-wrap justify-center gap-1 pt-2 pb-3">
            {showShareButton && onShare && (
              <Button
                onClick={onShare}
                variant="outline"
                className="h-7 px-2 hover:bg-pink-50 border-pink-200 flex items-center gap-1 font-boogaloo"
                title="Share Your Victory"
              >
                <Share2 className="w-4 h-4 text-pink-600" />
                <span className="text-sm">Share Victory</span>
              </Button>
            )}
            
            {showLeaderboardButton && onNavigateToLeaderboard && (
              <Button 
                onClick={() => onNavigateToLeaderboard(selectedAgency)}
                variant="outline"
                className="h-7 px-2 hover:bg-blue-50 border-blue-200 flex items-center gap-1 font-boogaloo"
                title="View Global Leaderboard"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Leaderboard</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

// Export utility functions for external use
export const useVictorySystem = () => {
  const resetVictory = useCallback(() => {
    if ((window as any).resetUniversalVictory) {
      (window as any).resetUniversalVictory();
    }
  }, []);

  return { resetVictory };
};