import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { RockingPorkHead } from './RockingPorkHead';

interface GameHeadingProps {
  selectedAgency: string;
  availableAgencies: string[];
  agencyFundingTargets: { [key: string]: number };
  fundedAgencies: Set<string>;
  onAgencyChange: (agency: string) => void;
  onUnlockAudio?: () => Promise<void>;
}

export function GameHeading({
  selectedAgency,
  availableAgencies,
  agencyFundingTargets,
  fundedAgencies,
  onAgencyChange,
  onUnlockAudio
}: GameHeadingProps) {
  const [headerMinimized, setHeaderMinimized] = useState(true);
  const [showAgencyOverlay, setShowAgencyOverlay] = useState(false);
  
  const agencyButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const porkPotPanelRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside overlay to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAgencyOverlay && 
          overlayRef.current && 
          !overlayRef.current.contains(event.target as Node) &&
          agencyButtonRef.current &&
          !agencyButtonRef.current.contains(event.target as Node)) {
        setShowAgencyOverlay(false);
      }
    };

    if (showAgencyOverlay) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAgencyOverlay]);

  // Handle agency selection change
  const handleAgencyChange = async (agency: string) => {
    // Unlock audio on user interaction (for mobile)
    if (onUnlockAudio) {
      await onUnlockAudio();
    }
    
    onAgencyChange(agency);
    // Close overlay
    setShowAgencyOverlay(false);
    
    // Scroll to pork pot panel at the top of the screen
    setTimeout(() => {
      if (porkPotPanelRef.current) {
        porkPotPanelRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure overlay closes first
  };

  // Handle header toggle
  const handleHeaderToggle = async () => {
    // Unlock audio on user interaction (for mobile)
    if (onUnlockAudio) {
      await onUnlockAudio();
    }
    
    setHeaderMinimized(!headerMinimized);
  };

  // Handle pork head toggle (same as header toggle)
  const handlePorkHeadToggle = () => {
    setHeaderMinimized(!headerMinimized);
  };

  return (
    <>
      {/* Always Visible Pork Head - Now Clickable and Tappable */}
      <RockingPorkHead
        onToggle={handlePorkHeadToggle}
        isMinimized={headerMinimized}
        onUnlockAudio={onUnlockAudio}
        size="xl"
        showHint={true}
        className="mb-4"
      />

      {/* Header */}
      {headerMinimized ? (
        /* Minimized Header - Just a down arrow */
        <div className="text-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            onClick={handleHeaderToggle}
            title="Expand header"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>
      ) : (
        /* Full Header */
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Poke-n-Pork
          </h1>
          <p className="text-lg text-gray-600 mb-4">Where one person's pork is another person's cause</p>
          
          {/* Fund a Cause Controls */}
          <Card className="px-6 pt-3 pb-4 mb-4 w-full">
            <p className="text-base text-gray-700 mb-1 font-bold text-center">Save Your Cause from Defunding</p>
            
            {/* Agency Selection Button with Overlay */}
            <div className="flex items-center justify-center min-w-0 relative">
              <Button
                ref={agencyButtonRef}
                variant="outline"
                className="justify-between w-64 h-8 text-sm hover:bg-gray-50 cursor-pointer"
                onClick={() => setShowAgencyOverlay(!showAgencyOverlay)}
              >
                <span className="truncate">{selectedAgency}</span>
                <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
              </Button>
              
              {/* Agency Selection Overlay */}
              {showAgencyOverlay && (
                <div
                  ref={overlayRef}
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-80 max-h-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
                >
                  <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-900">Select Your Cause</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowAgencyOverlay(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {availableAgencies.map((agency) => (
                      <div
                        key={agency}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          selectedAgency === agency ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                        }`}
                        onClick={() => handleAgencyChange(agency)}
                      >
                        <div className="flex items-center w-full">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium truncate ${
                                selectedAgency === agency ? 'text-green-700' : 'text-gray-900'
                              }`}>{agency}</span>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {(agencyFundingTargets[agency] || 10000).toLocaleString()} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Minimize button */}
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={handleHeaderToggle}
              title="Minimize header"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// Utility function to get agency display status
export function getAgencyDisplayStatus(agency: string, fundedAgencies: Set<string>) {
  return {
    isFunded: fundedAgencies.has(agency),
    displayName: agency,
    statusIcon: fundedAgencies.has(agency) ? '✅' : ''
  };
}

// Utility function to get agency selection summary
export function getAgencySelectionSummary(
  availableAgencies: string[], 
  fundedAgencies: Set<string>,
  agencyFundingTargets: { [key: string]: number }
) {
  const totalAgencies = availableAgencies.length;
  const fundedCount = fundedAgencies.size;
  const totalPoints = availableAgencies.reduce((sum, agency) => 
    sum + (agencyFundingTargets[agency] || 10000), 0
  );
  const completionPercentage = (fundedCount / totalAgencies) * 100;
  
  return {
    totalAgencies,
    fundedCount,
    totalPoints,
    completionPercentage,
    isComplete: fundedCount >= totalAgencies
  };
}

// Utility function for agency search/filter
export function filterAgencies(
  agencies: string[], 
  searchTerm: string, 
  showFundedOnly: boolean = false, 
  fundedAgencies: Set<string> = new Set()
) {
  let filtered = agencies;
  
  // Filter by search term
  if (searchTerm.trim()) {
    filtered = filtered.filter(agency => 
      agency.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Filter by funded status
  if (showFundedOnly) {
    filtered = filtered.filter(agency => fundedAgencies.has(agency));
  }
  
  return filtered;
}