
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';

interface VictorySystemProps {
  isGameActive: boolean;
  isGameWon: boolean;
  money: number;
  currentTarget: number;
  difficultyLevel: number;
  selectedAgency: string;
  soundEnabled: boolean;
  onSessionEnd: (success: boolean) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  onShare?: () => void;
  audioContextRef?: React.MutableRefObject<AudioContext | null>;
  initializeAudio?: () => Promise<AudioContext | null>;
}

export function VictorySystem({
  isGameActive,
  isGameWon,
  money,
  currentTarget,
  difficultyLevel,
  selectedAgency,
  soundEnabled,
  onSessionEnd,
  onNavigateToLeaderboard,
  onShare,
  audioContextRef,
  initializeAudio
}: VictorySystemProps) {
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState(false);

  // Create victory sound with iPhone compatibility
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
      masterGain.gain.setValueAtTime(0.2, audioContext.currentTime); // Moderate volume

      // Victory melody: Ascending major chord progression (C-E-G-C)
      const notes = [
        { freq: 261.63, start: 0, duration: 0.3 },    // C4
        { freq: 329.63, start: 0.2, duration: 0.3 },  // E4
        { freq: 392.00, start: 0.4, duration: 0.3 },  // G4
        { freq: 523.25, start: 0.6, duration: 0.5 }   // C5
      ];

      notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // Use triangle wave for warm, pleasant sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        
        // Add slight chorus effect
        const chorusOscillator = audioContext.createOscillator();
        const chorusGain = audioContext.createGain();
        chorusOscillator.frequency.setValueAtTime(note.freq + 2, audioContext.currentTime + note.start); // Slightly detuned
        chorusOscillator.type = 'triangle';
        
        // Envelope with smooth attack and decay
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.8, audioContext.currentTime + note.start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        chorusGain.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        chorusGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + note.start + 0.05);
        chorusGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Gentle low-pass filter for warmth
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000 + (index * 200), audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(1500 + (index * 100), audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        chorusOscillator.connect(filterNode);
        filterNode.connect(gainNode);
        filterNode.connect(chorusGain);
        gainNode.connect(masterGain);
        chorusGain.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
        
        chorusOscillator.start(audioContext.currentTime + note.start);
        chorusOscillator.stop(audioContext.currentTime + note.start + note.duration);
      });

      // Add a final celebratory arpeggio
      const arpeggioNotes = [
        { freq: 523.25, start: 1.0, duration: 0.15 }, // C5
        { freq: 659.25, start: 1.1, duration: 0.15 }, // E5
        { freq: 783.99, start: 1.2, duration: 0.15 }, // G5
        { freq: 1046.5, start: 1.3, duration: 0.3 }   // C6
      ];

      arpeggioNotes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + note.start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(3000, audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(2000, audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
      });

    } catch (error) {
      console.log('Victory sound audio not supported or blocked');
    }
  }, [initializeAudio, soundEnabled]);

  // Check if victory conditions are met
  useEffect(() => {
    if (isGameActive && money >= currentTarget && !isGameWon) {
      // Victory achieved - end session as success
      endSession();
    }
  }, [isGameActive, money, currentTarget, isGameWon]);

  // End session function (called when victory is achieved)
  const endSession = useCallback(() => {
    // Check if session was successful based on money amount
    const success = money >= currentTarget;
    
    setSessionEnded(true);
    setSessionSuccess(success);
    
    // Notify parent component
    onSessionEnd(success);
  }, [money, currentTarget, onSessionEnd]);

  // Play victory sound when mission succeeds
  useEffect(() => {
    if (sessionEnded && sessionSuccess && isGameWon) {
      // Small delay to let the UI render first
      const victoryTimer = setTimeout(() => {
        playVictorySound();
      }, 200);

      return () => clearTimeout(victoryTimer);
    }
  }, [sessionEnded, sessionSuccess, isGameWon, playVictorySound]);

  // Reset victory state when game state changes
  useEffect(() => {
    if (isGameActive || !isGameWon) {
      setSessionEnded(false);
      setSessionSuccess(false);
    }
  }, [isGameActive, isGameWon]);

  // Get congratulations message based on difficulty level
  const getCongratulationsMessage = () => {
    if (difficultyLevel === 1) return "Great start! You're getting the hang of it!";
    if (difficultyLevel === 2) return "Nice work! You're becoming a pro!";
    if (difficultyLevel <= 5) return "Excellent! You're really skilled at this!";
    if (difficultyLevel <= 8) return "Outstanding! You're a pork pieces master!";
    if (difficultyLevel <= 11) return "Incredible! You're absolutely unstoppable!";
    return "LEGENDARY! You've conquered the impossible!";
  };

  // Public methods for external control
  const resetVictory = useCallback(() => {
    setSessionEnded(false);
    setSessionSuccess(false);
  }, []);

  // Expose reset function
  useEffect(() => {
    (window as any).resetVictory = resetVictory;
    return () => {
      delete (window as any).resetVictory;
    };
  }, [resetVictory]);

  // Get player profile data
  const getPlayerData = () => {
    try {
      const playerImage = localStorage.getItem('poke-n-pork-player-image') || '👤';
      const playerName = localStorage.getItem('poke-n-pork-player-name') || 'Anonymous';
      return { playerImage, playerName };
    } catch {
      return { playerImage: '👤', playerName: 'Anonymous' };
    }
  };

  // Render victory screen if conditions are met
  if (isGameWon && !isGameActive && sessionEnded && sessionSuccess) {
    const { playerImage, playerName } = getPlayerData();
    
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-yellow-100 to-green-100">
        <div className="text-center text-green-800 p-8 rounded-2xl bg-white shadow-2xl border-4 border-yellow-400">
          <div className="text-6xl mb-4">🎉🏆🎉</div>
          <p className="text-4xl font-bold mb-2 font-boogaloo">VICTORY!</p>
          
          {/* Player Profile Display */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl animate-rock">{playerImage}</span>
            <span className="text-xl font-medium text-green-700 font-boogaloo">{playerName}</span>
          </div>
          
          <p className="text-xl text-green-800 font-medium mb-4 font-boogaloo">
            {getCongratulationsMessage()}
          </p>
          <p className="text-lg text-green-600 mb-6 font-boogaloo">
            You successfully funded your cause with <span className="font-boogaloo">{money.toLocaleString()}</span> points!
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {onShare && (
              <Button
                onClick={onShare}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg"
              >
                📱 Share Your Success
              </Button>
            )}
            {onNavigateToLeaderboard && (
              <Button 
                onClick={() => onNavigateToLeaderboard(selectedAgency)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg"
              >
                🏆 View Leaderboard
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Return null if victory screen should not be shown
  return null;
}