import React, { useState, useEffect } from 'react';
import { SimpleGamePauser } from '../components/SimpleGamePauser';
import { EventsPage } from '../components/EventsPage';
import { LeaderboardPage } from '../components/LeaderboardPage';
import { ProfilePage } from '../components/ProfilePage';
import { CommentsPage } from '../components/CommentsPage';
import { GameAudioProvider } from '../components/GameAudio';
import { initializeSampleComments } from '../components/sample-comments-data';
import { HighScoreEntry, CauseScoreEntry } from '../components/leaderboard-types';
import { DEFAULT_AGENCY } from '../components/causes-constants';

type Page = 'game' | 'events' | 'leaderboard' | 'profile' | 'comments';

const STORAGE_KEY = 'poke-n-pork-selected-agency';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('game');
  const [selectedAgency, setSelectedAgency] = useState(DEFAULT_AGENCY);
  const [selectedHighScore, setSelectedHighScore] = useState<HighScoreEntry | null>(null);
  const [selectedCauseScore, setSelectedCauseScore] = useState<CauseScoreEntry | null>(null);

  // Load saved agency from localStorage and initialize sample data on app startup
  useEffect(() => {
    // Initialize sample comments data
    initializeSampleComments();
    
    try {
      const savedAgency = localStorage.getItem(STORAGE_KEY);
      if (savedAgency) {
        setSelectedAgency(savedAgency);
      }
    } catch (error) {
      console.warn('Failed to load saved agency from localStorage:', error);
      // Fall back to default agency if localStorage fails
    }
  }, []);

  // Save agency to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selectedAgency);
    } catch (error) {
      console.warn('Failed to save agency to localStorage:', error);
    }
  }, [selectedAgency]);

  const handleNavigateToEvents = (agency: string) => {
    console.log('App: Navigating to events page');
    setSelectedAgency(agency);
    setCurrentPage('events');
  };

  const handleNavigateToLeaderboard = (agency: string) => {
    console.log('App: Navigating to leaderboard page');
    setSelectedAgency(agency);
    setCurrentPage('leaderboard');
  };

  const handleNavigateToProfile = () => {
    console.log('App: Navigating to profile page');
    setCurrentPage('profile');
  };

  const handleNavigateToComments = (highScoreEntry: HighScoreEntry) => {
    console.log('App: Navigating to comments page');
    setSelectedHighScore(highScoreEntry);
    setSelectedCauseScore(null);
    setCurrentPage('comments');
  };

  const handleNavigateToCauseComments = (causeScoreEntry: CauseScoreEntry) => {
    console.log('App: Navigating to cause comments page');
    setSelectedCauseScore(causeScoreEntry);
    setSelectedHighScore(null);
    setCurrentPage('comments');
  };

  const handleBackToGame = () => {
    console.log('App: Returning to game page');
    setCurrentPage('game');
  };

  const handleBackToLeaderboard = () => {
    console.log('App: Returning to leaderboard page');
    setCurrentPage('leaderboard');
  };

  const handleAgencyChange = (agency: string) => {
    setSelectedAgency(agency);
  };

  return (
    <GameAudioProvider>
      <div className="relative min-h-screen bg-gradient-to-b from-green-50 to-blue-50 font-boogaloo">
        {/* Keep game always mounted but hidden when not active */}
        <div 
          className={`${currentPage === 'game' ? 'block' : 'hidden'} w-full h-full`}
          style={{ display: currentPage === 'game' ? 'block' : 'none' }}
        >
          <SimpleGamePauser
            onNavigateToEvents={handleNavigateToEvents}
            onNavigateToLeaderboard={handleNavigateToLeaderboard}
            onNavigateToProfile={handleNavigateToProfile}
            selectedAgency={selectedAgency}
            onAgencyChange={handleAgencyChange}
            isCurrentPage={currentPage === 'game'}
          />
        </div>

      {/* Events page overlay */}
      {currentPage === 'events' && (
        <div className="absolute inset-0 z-50">
          <EventsPage 
            onBackToGame={handleBackToGame}
            selectedAgency={selectedAgency}
            onAgencyChange={handleAgencyChange}
          />
        </div>
      )}

      {/* Leaderboard page overlay */}
      {currentPage === 'leaderboard' && (
        <div className="absolute inset-0 z-50">
          <LeaderboardPage 
            onBackToGame={handleBackToGame}
            selectedAgency={selectedAgency}
            onNavigateToEvents={handleNavigateToEvents}
            onNavigateToComments={handleNavigateToComments}
            onNavigateToCauseComments={handleNavigateToCauseComments}
          />
        </div>
      )}

      {/* Profile page overlay */}
      {currentPage === 'profile' && (
        <div className="absolute inset-0 z-50">
          <ProfilePage 
            onBackToGame={handleBackToGame}
          />
        </div>
      )}

      {/* Comments page overlay */}
      {currentPage === 'comments' && (selectedHighScore || selectedCauseScore) && (
        <div className="absolute inset-0 z-50">
          <CommentsPage 
            onBackToLeaderboard={handleBackToLeaderboard}
            highScoreEntry={selectedHighScore}
            causeScoreEntry={selectedCauseScore}
          />
        </div>
      )}
      </div>
    </GameAudioProvider>
  );
}