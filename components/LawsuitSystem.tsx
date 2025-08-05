
import { Button } from './ui/button';

interface LawsuitState {
  isActive: boolean;
  amount: number;
  escalationLevel: number;
  lastLawsuitTime: number;
}

interface LawsuitSystemProps {
  isGameActive: boolean;
  isGameWon: boolean;
  lawsuitsEnabled: boolean;
  money: number;
  soundEnabled: boolean;
  onMoneyChange: (newMoney: number) => void;
  onLawsuitsDisabled: () => void;
  audioContextRef?: React.MutableRefObject<AudioContext | null>;
  initializeAudio?: () => Promise<AudioContext | null>;
}

// Lawsuit configuration - Fixed 20 second interval
const LAWSUIT_TRIGGER_INTERVAL = 20000; // 20 seconds exactly
const INITIAL_LAWSUIT_AMOUNT = 500; // Points instead of dollars
const LAWSUIT_ESCALATION_MULTIPLIER = 2.5;

// Lawsuit claim variations - different "They claim..." statements
const LAWSUIT_CLAIMS = [
  "They claim you're stealing their thunder!",
  "They claim you're using their patented pork pieces technique!",
  "They claim you owe them licensing fees for political commentary!",
  "They claim your fundraising is cutting into their donation money!",
  "They claim you're violating their trademark on the word 'winning'!",
  "They claim you're illegally using the concept of finger pointing!",
  "They claim you stole their revolutionary 'poke and profit' business model!",
  "They claim you're infringing on their exclusive rights to political theatrics!",
  "They claim you're using their copyrighted method of blame deflection!",
  "They claim you owe them for every pig emoji used!",
  "They claim you're profiting from their invented political pig metaphor!",
  "They claim you're stealing their audience of frustrated Americans!",
  "They claim you plagiarized their 'drain the swamp' energy!",
  "They claim you're using their patented outrage monetization system!",
  "They claim you violated their exclusive contract with chaos!",
  "They claim you're illegally using their brand of manufactured controversy!",
  "They claim you stole their secret formula for turning anger into cash!",
  "They claim you're infringing on their monopoly of political circus acts!",
  "They claim you owe them royalties for every democratic institution you fund!",
  "They claim you're using their proprietary method of reality distortion!",
  "They claim you violated their exclusive license to point fingers at everyone!",
  "They claim you're stealing their innovative approach to avoiding responsibility!",
  "They claim you owe them for inspiration from their legal troubles!",
  "They claim you're illegally competing with their victim complex!",
  "They claim you stole their business model of selling grievances!"
];

export function LawsuitSystem({ 
  isGameActive, 
  isGameWon, 
  lawsuitsEnabled, 
  money, 
  soundEnabled,
  onMoneyChange,
  onLawsuitsDisabled,
  audioContextRef,
  initializeAudio
}: LawsuitSystemProps) {
  const [lawsuit, setLawsuit] = useState<LawsuitState>({
    isActive: false,
    amount: INITIAL_LAWSUIT_AMOUNT,
    escalationLevel: 0,
    lastLawsuitTime: 0
  });
  const [currentLawsuitClaim, setCurrentLawsuitClaim] = useState("");
  const [showFinalLawsuitScreen, setShowFinalLawsuitScreen] = useState(false);

  const lawsuitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get a random lawsuit claim
  const getLawsuitClaim = () => {
    return LAWSUIT_CLAIMS[Math.floor(Math.random() * LAWSUIT_CLAIMS.length)];
  };

  // Create simple two-note ascending alert sound with iPhone compatibility
  const playAlarmSound = useCallback(async () => {
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

      // Two ascending notes: C5 to E5
      const notes = [
        { freq: 523.25, start: 0, duration: 0.4 },    // C5 (lower note)
        { freq: 659.25, start: 0.3, duration: 0.5 }   // E5 (higher note)
      ];

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // Use sine wave for clean, pleasant sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);

        // Smooth envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + note.start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Gentle low-pass filter for warmth
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(1500, audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
      });

    } catch (error) {
      console.log('Lawsuit alert sound audio not supported or blocked');
    }
  }, [soundEnabled, initializeAudio]);

  // Lawsuit timer management - Fixed 20 second intervals for initial, 30 seconds after settlement
  const scheduleLawsuit = useCallback(() => {
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
    }
    
    // Only schedule lawsuits if they are enabled
    if (!lawsuitsEnabled) {
      return;
    }
    
    // Fixed 20 second delay for initial lawsuit
    const delay = LAWSUIT_TRIGGER_INTERVAL;
    
    lawsuitTimerRef.current = setTimeout(() => {
      setLawsuit(prev => {
        // Only show lawsuit if game is active, no lawsuit is currently active, game not won, and lawsuits enabled
        if (isGameActive && !prev.isActive && !isGameWon && lawsuitsEnabled) {
          // Set new lawsuit claim when lawsuit appears
          setCurrentLawsuitClaim(getLawsuitClaim());
          return {
            ...prev,
            isActive: true,
            amount: Math.ceil(INITIAL_LAWSUIT_AMOUNT * Math.pow(LAWSUIT_ESCALATION_MULTIPLIER, prev.escalationLevel)),
            lastLawsuitTime: Date.now()
          };
        }
        return prev;
      });
    }, delay);
  }, [isGameActive, isGameWon, lawsuitsEnabled]);

  // Start lawsuit timer when game becomes active
  useEffect(() => {
    if (isGameActive && !isGameWon && lawsuitsEnabled) {
      // Only schedule if there's no active lawsuit and no timer already running
      if (!lawsuit.isActive && !lawsuitTimerRef.current) {
        scheduleLawsuit();
      }
    } else if (!isGameActive || isGameWon || !lawsuitsEnabled) {
      // Clear timer when game becomes inactive or lawsuits are disabled
      if (lawsuitTimerRef.current) {
        clearTimeout(lawsuitTimerRef.current);
        lawsuitTimerRef.current = null;
      }
    }

    return () => {
      if (lawsuitTimerRef.current) {
        clearTimeout(lawsuitTimerRef.current);
        lawsuitTimerRef.current = null;
      }
    };
  }, [isGameActive, isGameWon, lawsuitsEnabled, scheduleLawsuit]);

  // Play alarm sound when lawsuit appears
  useEffect(() => {
    if (lawsuit.isActive && !isGameWon) {
      // Small delay to let the UI render first
      const alarmTimer = setTimeout(() => {
        playAlarmSound();
      }, 100);

      return () => clearTimeout(alarmTimer);
    }
  }, [lawsuit.isActive, isGameWon, playAlarmSound]);

  // Lawsuit decision handlers
  const handleLawsuitSettle = async () => {
    const settlementAmount = lawsuit.amount;
    onMoneyChange(money - settlementAmount);
    
    setLawsuit(prev => ({
      ...prev,
      isActive: false,
      escalationLevel: 0, // Reset escalation after settlement
      amount: INITIAL_LAWSUIT_AMOUNT
    }));

    // Clear any existing lawsuit timer
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
      lawsuitTimerRef.current = null;
    }

    // Schedule next lawsuit after exactly 30 seconds (only if lawsuits are enabled)
    lawsuitTimerRef.current = setTimeout(() => {
      if (isGameActive && !isGameWon && lawsuitsEnabled) {
        // Set new lawsuit claim when lawsuit appears
        setCurrentLawsuitClaim(getLawsuitClaim());
        setLawsuit(prev => ({
          ...prev,
          isActive: true,
          amount: Math.ceil(INITIAL_LAWSUIT_AMOUNT * Math.pow(LAWSUIT_ESCALATION_MULTIPLIER, prev.escalationLevel)),
          lastLawsuitTime: Date.now()
        }));
      }
    }, 30000); // Fixed 30 seconds after settlement
  };

  const handleLawsuitRefuse = async () => {
    const newEscalationLevel = lawsuit.escalationLevel + 1;
    
    // After 5 refuse clicks, show the final lawsuit screen
    if (newEscalationLevel >= 5) {
      setLawsuit(prev => ({
        ...prev,
        isActive: false, // Turn off current lawsuit
        escalationLevel: 0,
        amount: INITIAL_LAWSUIT_AMOUNT
      }));
      
      // Show the final lawsuit dismissal screen
      setShowFinalLawsuitScreen(true);
      
      return; // Exit early, final screen will handle the rest
    }
    
    const escalatedAmount = Math.ceil(lawsuit.amount * LAWSUIT_ESCALATION_MULTIPLIER);
    
    // Set new lawsuit claim when lawsuit escalates
    setCurrentLawsuitClaim(getLawsuitClaim());

    // Keep the lawsuit active but escalate it immediately - NO MONEY DEDUCTION
    setLawsuit(prev => ({
      ...prev,
      isActive: true, // Keep lawsuit active
      escalationLevel: newEscalationLevel,
      amount: escalatedAmount // Set the new higher amount
    }));

    // Lawsuit stays active and redisplays immediately with higher amount
  };

  // Handle final lawsuit screen dismissal
  const handleFinalLawsuitOkay = async () => {
    // Hide the final screen
    setShowFinalLawsuitScreen(false);
    
    // Disable the lawsuit system completely
    onLawsuitsDisabled();
  };

  // Get lawsuit message based on escalation level
  const getLawsuitMessage = () => {
    if (lawsuit.escalationLevel === 0) {
      return "Breaking News: The great and all powerful orange one is suing you!";
    } else {
      return "The great and all powerful orange one is STILL suing you!";
    }
  };

  const getLawsuitDescription = () => {
    if (lawsuit.escalationLevel === 0) {
      return currentLawsuitClaim;
    } else {
      const escalationMessages = [
        "Now they're REALLY mad! The settlement has increased!",
        "Their lawyers are working overtime! More money demanded!",
        "This is getting expensive! They're not backing down!",
        "Final warning! Pay up or lose everything!"
      ];
      
      return escalationMessages[Math.min(lawsuit.escalationLevel - 1, escalationMessages.length - 1)];
    }
  };

  // Reset lawsuit state when lawsuits are disabled
  useEffect(() => {
    if (!lawsuitsEnabled && lawsuit.isActive) {
      setLawsuit(prev => ({ ...prev, isActive: false, escalationLevel: 0, amount: INITIAL_LAWSUIT_AMOUNT }));
    }
  }, [lawsuitsEnabled, lawsuit.isActive]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (lawsuitTimerRef.current) {
        clearTimeout(lawsuitTimerRef.current);
        lawsuitTimerRef.current = null;
      }
    };
  }, []);

  // Public methods for external control
  const resetLawsuit = useCallback(() => {
    setLawsuit({
      isActive: false,
      amount: INITIAL_LAWSUIT_AMOUNT,
      escalationLevel: 0,
      lastLawsuitTime: 0
    });
    setShowFinalLawsuitScreen(false);
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
      lawsuitTimerRef.current = null;
    }
  }, []);

  // Expose reset function
  useEffect(() => {
    (window as any).resetLawsuit = resetLawsuit;
    return () => {
      delete (window as any).resetLawsuit;
    };
  }, [resetLawsuit]);

  if (!lawsuitsEnabled) {
    return null;
  }

  return (
    <>
      {/* Trump Lawsuit Panel Overlay */}
      {lawsuit.isActive && !isGameWon && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-4 border-red-600 rounded-xl shadow-2xl max-w-md mx-4 p-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-700 mb-1">{getLawsuitMessage()}</h2>
              <p className="text-base text-red-600 mb-2">{getLawsuitDescription()}</p>
              
              <p className="text-lg font-bold text-red-800 mb-2">
                Settlement Demand: {lawsuit.amount.toLocaleString()} points
              </p>
              {lawsuit.amount > money && money >= 0 && (
                <p className="text-xs text-red-600 mb-4">
                  This will put you in debt!
                </p>
              )}
              
              {/* Buttons side by side */}
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={handleLawsuitSettle}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                >
                  SETTLE
                </Button>
                <Button 
                  onClick={handleLawsuitRefuse}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2"
                >
                  REFUSE TO PAY
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Lawsuit Dismissal Screen */}
      {showFinalLawsuitScreen && !isGameWon && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-4 border-orange-600 rounded-xl shadow-2xl max-w-md mx-4 p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-orange-700 mb-3">
                The great and all powerful orange one says "What Lawsuit?"
              </h2>
              <p className="text-base text-orange-600 mb-4">
                "I've never heard of that lawsuit."
              </p>
              
              {/* Single Okay button */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleFinalLawsuitOkay}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2"
                >
                  OKAY
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}