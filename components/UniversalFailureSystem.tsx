import React, { useState, useEffect, useCallback } from 'react';
import { CockroachIcon } from './CockroachIcon';



interface UniversalFailureSystemProps {
  isGameActive: boolean;
  isGameWon: boolean;
  defundingAmount: number;
  currentTarget: number;
  money: number;
  difficultyLevel: number;
  soundEnabled: boolean;
  onSessionEnd: (success: boolean) => void;
  audioContextRef?: React.MutableRefObject<AudioContext | null>;
  initializeAudio?: () => Promise<AudioContext | null>;
}

export function UniversalFailureSystem({
  isGameActive,
  isGameWon,
  defundingAmount,
  currentTarget,
  money,
  difficultyLevel,
  soundEnabled,
  onSessionEnd,
  audioContextRef,
  initializeAudio
}: UniversalFailureSystemProps) {
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState(false);

  // Failure messages by difficulty level
  const getFailureMessage = useCallback(() => {
    if (difficultyLevel === 1) return "Try poking more valuable pork!";
    if (difficultyLevel === 2) return "Try poking a piece of pork more than once!";
    if (difficultyLevel === 3) return "Moment of Zen: Poke with all you've learned";
    if (difficultyLevel === 4) return "The pork was too quick for you!";
    if (difficultyLevel === 5) return "The tougher the task the bigger the reward";
    if (difficultyLevel === 6) return "Those pigs are getting smarter!";
    if (difficultyLevel === 7) return "Perhaps try an easier level";
    if (difficultyLevel === 8) return "Another Zen moment: What is chaos?";
    if (difficultyLevel === 9) return "Chaos runs deep!";
    if (difficultyLevel === 10) return "At some point your poking finger will give out!";
    if (difficultyLevel === 11) return "You have only your will left";
    return "It's all perfection from here";
  }, [difficultyLevel]);

  // Create failure sound with iPhone compatibility
  const playFailureSound = useCallback(async () => {
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
      masterGain.gain.setValueAtTime(0.2, audioContext.currentTime); // Slightly louder for impact

      // Failure melody: descending dissonant notes (C-B♭-A♭-F)
      const notes = [
        { freq: 523.25, start: 0, duration: 0.3 },    // C5
        { freq: 466.16, start: 0.25, duration: 0.3 }, // B♭4
        { freq: 415.30, start: 0.5, duration: 0.3 },  // A♭4
        { freq: 349.23, start: 0.75, duration: 0.4 }  // F4
      ];

      notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // Use sawtooth for harsher, more dissonant sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        
        // Add slight detuning for dissonance
        const detune = audioContext.createOscillator();
        const detuneGain = audioContext.createGain();
        detune.frequency.setValueAtTime(note.freq + (index * 3), audioContext.currentTime + note.start); // Slightly detuned
        detune.type = 'square';
        
        // Envelope with slower attack for more dramatic effect
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + note.start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        detuneGain.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        detuneGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + note.start + 0.05);
        detuneGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Low-pass filter that gets progressively darker
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(1000 - (index * 150), audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(400 - (index * 50), audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        detune.connect(filterNode);
        filterNode.connect(gainNode);
        filterNode.connect(detuneGain);
        gainNode.connect(masterGain);
        detuneGain.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
        
        detune.start(audioContext.currentTime + note.start);
        detune.stop(audioContext.currentTime + note.start + note.duration);
      });

      // Add a low, ominous bass drone
      const bassOscillator = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bassOscillator.type = 'sawtooth';
      bassOscillator.frequency.setValueAtTime(87.31, audioContext.currentTime); // F2
      
      bassGain.gain.setValueAtTime(0, audioContext.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
      
      bassOscillator.connect(bassGain);
      bassGain.connect(masterGain);
      
      bassOscillator.start(audioContext.currentTime);
      bassOscillator.stop(audioContext.currentTime + 1.2);

      // Add a harsh noise burst for extra impact
      const noiseGain = audioContext.createGain();
      const noiseFilter = audioContext.createBiquadFilter();
      
      // Create noise using a buffer
      const bufferSize = audioContext.sampleRate * 0.1; // 0.1 second of noise
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5; // White noise
      }
      
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = buffer;
      
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(300, audioContext.currentTime);
      noiseFilter.Q.setValueAtTime(10, audioContext.currentTime);
      
      noiseGain.gain.setValueAtTime(0, audioContext.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      
      noiseSource.start(audioContext.currentTime);

    } catch (error) {
      console.log('Failure sound audio not supported or blocked');
    }
  }, [initializeAudio, soundEnabled]);

  // Check if defunding is complete (failure condition)
  useEffect(() => {
    if (isGameActive && defundingAmount >= currentTarget && !isGameWon) {
      // Defunding complete - end session as failure (only if not already won)
      endSession();
    }
  }, [isGameActive, defundingAmount, currentTarget, isGameWon]);

  // End session function (called when all pigs are poked or defunding complete)
  const endSession = useCallback(() => {
    // Check if session was successful based on money amount
    const success = money >= currentTarget;
    
    setSessionEnded(true);
    setSessionSuccess(success);
    
    // Notify parent component
    onSessionEnd(success);
  }, [money, currentTarget, onSessionEnd]);

  // Play failure sound when mission fails
  useEffect(() => {
    if (sessionEnded && !sessionSuccess && !isGameWon) {
      // Small delay to let the UI render first
      const failureTimer = setTimeout(() => {
        playFailureSound();
      }, 200);

      return () => clearTimeout(failureTimer);
    }
  }, [sessionEnded, sessionSuccess, isGameWon, playFailureSound]);

  // Reset failure state when game state changes
  useEffect(() => {
    if (isGameActive || isGameWon) {
      setSessionEnded(false);
      setSessionSuccess(false);
    }
  }, [isGameActive, isGameWon]);

  // Public methods for external control
  const resetFailure = useCallback(() => {
    setSessionEnded(false);
    setSessionSuccess(false);
  }, []);

  // Expose reset function globally
  useEffect(() => {
    (window as any).resetFailure = resetFailure;
    return () => {
      delete (window as any).resetFailure;
    };
  }, [resetFailure]);

  // Render failure screen if conditions are met
  if (!isGameWon && !isGameActive && sessionEnded && !sessionSuccess) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="flex justify-center mb-4">
            <CockroachIcon size={64} color="#b91c1c" enableScurrying={true} scurryFrequency={0.3} />
          </div>
          <div className="mb-4">
            <span className="text-3xl text-red-700 font-boogaloo">DOGIE defunded you!</span>
          </div>
          <p className="text-xl text-red-800 font-boogaloo">
            {getFailureMessage()}
          </p>
        </div>
      </div>
    );
  }

  // Return null if failure screen should not be shown
  return null;
}

