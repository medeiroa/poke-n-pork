import { AUDIO_CONSTANTS, JINGLE_FREQUENCIES, BASS_FREQUENCY, CONSOLE_MESSAGES } from './audio-constants';

// Audio system for game sounds with mobile compatibility
export class GameAudioManager {
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private soundVolume = AUDIO_CONSTANTS.SOUND_VOLUME;
  private isEnabled = true;
  private isPlaying = false; // Prevent multiple simultaneous jingles
  private lastPlayTime = 0; // Debounce rapid calls

  // Create an audio context for mobile compatibility
  async initializeAudio() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
      console.log(CONSOLE_MESSAGES.INITIALIZED);
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  // Play game start jingle using Web Audio API
  async playStartJingle() {
    if (!this.isEnabled) return;
    
    // Prevent multiple jingles playing simultaneously
    const now = Date.now();
    if (this.isPlaying || (now - this.lastPlayTime < AUDIO_CONSTANTS.DEBOUNCE_TIME)) {
      console.log(CONSOLE_MESSAGES.SKIPPING_JINGLE);
      return;
    }
    
    this.isPlaying = true;
    this.lastPlayTime = now;
    
    if (!this.audioContext) {
      await this.initializeAudio();
    }

    if (!this.audioContext) {
      this.isPlaying = false;
      return;
    }

    try {
      // Resume audio context if suspended (required for mobile)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create a simple uplifting jingle using oscillators
      const contextNow = this.audioContext.currentTime;
      const duration = AUDIO_CONSTANTS.JINGLE_DURATION;

      // Create a gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.connect(this.audioContext.destination);
      gainNode.gain.setValueAtTime(0, contextNow);
      gainNode.gain.linearRampToValueAtTime(this.soundVolume, contextNow + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, contextNow + duration);

      // Create multiple oscillators for a rich sound
      const oscillators: OscillatorNode[] = [];

      JINGLE_FREQUENCIES.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const oscGain = this.audioContext!.createGain();
        
        oscillator.connect(oscGain);
        oscGain.connect(gainNode);
        
        oscillator.frequency.setValueAtTime(freq, contextNow);
        oscillator.type = 'triangle'; // Warmer sound than sine wave
        
        // Stagger the notes slightly for a musical effect
        const startTime = contextNow + (index * 0.1);
        const endTime = startTime + 0.6;
        
        oscGain.gain.setValueAtTime(0, startTime);
        oscGain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
        oscGain.gain.exponentialRampToValueAtTime(0.001, endTime);
        
        oscillator.start(startTime);
        oscillator.stop(endTime);
        
        oscillators.push(oscillator);
      });

      // Add a subtle bass note for richness
      const bassOscillator = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      
      bassOscillator.connect(bassGain);
      bassGain.connect(gainNode);
      
      bassOscillator.frequency.setValueAtTime(BASS_FREQUENCY, contextNow);
      bassOscillator.type = 'sine';
      
      bassGain.gain.setValueAtTime(0, contextNow);
      bassGain.gain.linearRampToValueAtTime(0.15, contextNow + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, contextNow + AUDIO_CONSTANTS.BASS_DURATION);
      
      bassOscillator.start(contextNow);
      bassOscillator.stop(contextNow + AUDIO_CONSTANTS.BASS_DURATION);

      console.log(CONSOLE_MESSAGES.PLAYING_JINGLE);

      // Reset playing flag after jingle completes
      setTimeout(() => {
        this.isPlaying = false;
      }, duration * 1000);

    } catch (error) {
      console.warn('Failed to play start jingle:', error);
      this.isPlaying = false;
    }
  }

  setVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  getVolume(): number {
    return this.soundVolume;
  }
}