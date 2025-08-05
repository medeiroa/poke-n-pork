// Audio system constants
export const AUDIO_CONSTANTS = {
  SOUND_VOLUME: 0.3,
  JINGLE_DURATION: 1.2,
  DEBOUNCE_TIME: 500,
  BASS_DURATION: 0.8,
  SETUP_DELAY: 250,
  PAUSE_TOGGLE_DELAY: 100,
  MAX_ELEMENT_DEPTH: 5,
  MAX_INTERVAL_CLEAR: 100,
} as const;

// Musical frequencies for the jingle (C5, E5, G5, C6 - Major chord)
export const JINGLE_FREQUENCIES = [523.25, 659.25, 783.99, 1046.5] as const;

// Bass frequency (C3)
export const BASS_FREQUENCY = 130.81;

// Console messages
export const CONSOLE_MESSAGES = {
  LOADING: '🎵 Loading SAFE GameAudio v3.0 - Fixed multiple jingle issue',
  INITIALIZED: '🎵 Game audio initialized successfully',
  PLAYING_JINGLE: '🎵 Playing game start jingle',
  SKIPPING_JINGLE: '🎵 Skipping jingle - already playing or too recent',
  SYSTEM_INITIALIZED: '🎵 SAFE audio system fully initialized',
  GLOBAL_LISTENER_SETUP: '🎵 SAFE global pause button listener setup complete',
  GLOBAL_LISTENER_EXISTS: '🎵 Global pause button listener already setup',
  EMERGENCY_DISABLE: '🚨 Emergency disable of all button enhancement',
  EMERGENCY_COMPLETE: '🚨 Emergency disable complete - all problematic functions blocked',
  DOCUMENT_UNAVAILABLE: '🎵 Document not available - audio system will initialize when available',
  SYSTEM_INITIALIZING: '🎵 Initializing SAFE audio system v3.0',
} as const;