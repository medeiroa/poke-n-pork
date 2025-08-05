import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DonationsPanel } from './DonationsPanel';
import { AGENCY_FUNDING_TARGETS, AVAILABLE_AGENCIES } from './causes-constants';
import { ArrowLeft, Calendar, Users, ChevronDown, X } from 'lucide-react';

interface EventsPageProps {
  onBackToGame: () => void;
  selectedAgency: string;
  onAgencyChange: (agency: string) => void;
}

// Using shared constants from causes-constants.ts

export function EventsPage({ onBackToGame, selectedAgency, onAgencyChange }: EventsPageProps) {
  const [showAgencyOverlay, setShowAgencyOverlay] = useState(false);
  const agencyButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle agency selection change
  const handleAgencyChange = (agency: string) => {
    onAgencyChange(agency);
    setShowAgencyOverlay(false);
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  return (
    <div className="min-h-screen p-4 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            onClick={onBackToGame}
            variant="outline"
            className="flex items-center gap-2 mb-4 font-boogaloo"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-green-800" />
              <h1 className="text-5xl font-bold text-green-800 font-boogaloo">Events</h1>
            </div>
            <p className="text-gray-600">Join a real funding or advocacy event</p>
          </div>
        </div>

        {/* Cause Selection Panel - Duplicate from Header */}
        <Card className="px-6 pt-3 pb-4 mb-6 w-full">
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
                  {AVAILABLE_AGENCIES.map((agency) => (
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
                              {(AGENCY_FUNDING_TARGETS[agency] || 10000).toLocaleString()} points
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

        {/* Current Cause */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Events for {selectedAgency}</h2>
              <p className="text-sm text-gray-600">Real-world opportunities to support this cause</p>
            </div>
          </div>
        </Card>

        {/* No Events Message */}
        <Card className="p-8 mb-6">
          <div>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">No Events Currently Available</h3>
            <p className="text-gray-600 mb-4 max-w-md text-left">
              There are currently no funding events scheduled for {selectedAgency}. 
              Check back soon for opportunities to get involved in real-world advocacy!
            </p>
            <div className="text-sm text-gray-500 text-left">
              <p>Events may include:</p>
              <ul className="mt-2 space-y-1">
                <li>• Fundraising campaigns</li>
                <li>• Advocacy meetups</li>
                <li>• Volunteer opportunities</li>
                <li>• Educational workshops</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Donations Panel */}
        <DonationsPanel selectedAgency={selectedAgency} />

        {/* Footer */}
        <div className="text-center mt-8">
          <Button
            onClick={onBackToGame}
            className="bg-green-600 hover:bg-green-700 text-white font-boogaloo"
          >
            Return to Poke-n-Pork
          </Button>
        </div>
      </div>
    </div>
  );
}