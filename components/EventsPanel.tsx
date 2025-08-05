import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, Eye } from 'lucide-react';

interface EventsPanelProps {
  selectedAgency: string;
  onNavigateToEvents?: (agency: string) => void;
  onUnlockAudio?: () => Promise<void>;
  className?: string;
}

export function EventsPanel({
  selectedAgency,
  onNavigateToEvents,
  onUnlockAudio,
  className = ''
}: EventsPanelProps) {
  
  // Handle navigate to events
  const handleNavigateToEvents = async () => {
    // Unlock audio on user interaction (for mobile)
    if (onUnlockAudio) {
      await onUnlockAudio();
    }
    
    if (onNavigateToEvents) {
      onNavigateToEvents(selectedAgency);
    }
  };

  return (
    <Card className={`p-4 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800 text-xl font-boogaloo">Events</h3>
        </div>
        <Button
          onClick={handleNavigateToEvents}
          variant="outline"
          className="flex items-center gap-2 hover:bg-purple-50 border-purple-200 font-boogaloo"
        >
          <Eye className="w-4 h-4" />
          View Events
        </Button>
      </div>
    </Card>
  );
}

// Utility function to check if events are available for an agency
export function hasEventsForAgency(agency: string): boolean {
  // Add logic here to determine if events are available for a specific agency
  // For now, return true for all agencies
  return true;
}

// Utility function to get event count for an agency
export function getEventCountForAgency(agency: string): number {
  // Add logic here to get the actual count of events for an agency
  // This would typically come from your events data source
  return 0; // Placeholder
}

// Utility function to get next event date for an agency
export function getNextEventDate(agency: string): Date | null {
  // Add logic here to get the next event date for an agency
  // This would typically come from your events data source
  return null; // Placeholder
}