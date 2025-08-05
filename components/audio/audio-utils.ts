import { AUDIO_CONSTANTS, CONSOLE_MESSAGES } from './audio-constants';

// Emergency function to disable all problematic enhancement code
export function emergencyDisableButtonEnhancement() {
  console.log(CONSOLE_MESSAGES.EMERGENCY_DISABLE);
  
  // Override potentially problematic global functions
  if (typeof window !== 'undefined') {
    // Disable any potentially problematic functions that might exist
    (window as any).enhanceExistingPauseButtons = function() {
      console.log('🚨 enhanceExistingPauseButtons disabled to prevent CSS selector errors');
    };
    
    (window as any).enhanceGamePauseButtons = function() {
      console.log('🚨 enhanceGamePauseButtons disabled to prevent CSS selector errors');
    };
    
    (window as any).usePauseButtonEnhancement = function() {
      console.log('🚨 usePauseButtonEnhancement disabled to prevent CSS selector errors');
    };
    
    // Override document.querySelectorAll for problematic selectors
    const originalQuerySelectorAll = document.querySelectorAll;
    document.querySelectorAll = function(selector: string) {
      if (selector.includes(':contains(') || selector.includes('button:contains')) {
        console.warn('🚨 Blocked problematic CSS selector:', selector);
        return document.createDocumentFragment().querySelectorAll('nothingwillmatchthis');
      }
      return originalQuerySelectorAll.call(this, selector);
    };
    
    // Clear any running intervals that might contain problematic code
    for (let i = 1; i < AUDIO_CONSTANTS.MAX_INTERVAL_CLEAR; i++) {
      try {
        clearInterval(i);
        clearTimeout(i);
      } catch (e) {
        // Ignore errors
      }
    }
    
    console.log(CONSOLE_MESSAGES.EMERGENCY_COMPLETE);
  }
}

// Manual button enhancement function (SAFE - no CSS selectors)
export function enhancePauseButton(buttonElement: HTMLElement, reason: string = 'manual-enhance') {
  if (!buttonElement || buttonElement.hasAttribute('data-manual-audio-enhanced')) {
    return;
  }
  
  try {
    buttonElement.setAttribute('data-manual-audio-enhanced', 'true');
    
    buttonElement.addEventListener('click', function(event) {
      try {
        // Check if this appears to be a resume/play action
        const ariaLabel = buttonElement.getAttribute('aria-label') || '';
        const title = buttonElement.getAttribute('title') || '';
        const textContent = buttonElement.textContent || '';
        
        const isResuming = (
          ariaLabel.toLowerCase().includes('play') ||
          title.toLowerCase().includes('play') ||
          textContent.includes('▶') ||
          textContent.includes('⏯')
        );
        
        if (isResuming) {
          console.log(`🎵 Manual enhanced pause button triggered: ${reason}`);
          // Import triggerGameStartJingle dynamically to avoid circular imports
          import('../GameAudio').then(({ triggerGameStartJingle }) => {
            triggerGameStartJingle(`manual-enhanced-${reason}`);
          });
        }
      } catch (innerError) {
        console.warn('Error in manual enhanced button click handler:', innerError);
      }
    }, { capture: true });
    
    console.log(`🎵 Successfully enhanced pause button: ${reason}`);
  } catch (error) {
    console.warn(`Failed to manually enhance pause button (${reason}):`, error);
  }
}

// Check if element is a play/resume button
export function isPlayButton(element: HTMLElement): boolean {
  const textContent = (element.textContent || '').trim();
  const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
  const title = (element.getAttribute('title') || '').toLowerCase();
  const dataLucide = element.getAttribute('data-lucide') || '';
  
  return (
    textContent.includes('▶') || 
    textContent.includes('⏯') ||
    ariaLabel.includes('play') ||
    ariaLabel.includes('resume') ||
    title.includes('play') ||
    title.includes('resume') ||
    dataLucide === 'play'
  );
}

// Check if element is a pause button
export function isPauseButton(element: HTMLElement): boolean {
  const textContent = (element.textContent || '').trim();
  const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
  const title = (element.getAttribute('title') || '').toLowerCase();
  const dataLucide = element.getAttribute('data-lucide') || '';
  
  return (
    textContent.includes('⏸') ||
    ariaLabel.includes('pause') ||
    title.includes('pause') ||
    dataLucide === 'pause'
  );
}

// Check if element is a button
export function isButton(element: HTMLElement): boolean {
  return element.tagName === 'BUTTON' || element.getAttribute('role') === 'button';
}