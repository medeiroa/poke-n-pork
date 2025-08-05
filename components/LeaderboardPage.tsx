import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Trophy, Globe } from 'lucide-react';
import { initializeSampleComments } from './sample-comments-data';
import { loadPlayerScores, mockWorldwideCauseScores } from './leaderboard-helpers';
import { LeaderboardPageProps } from './leaderboard-types';
import { LeaderboardTabs } from './LeaderboardTabs';
import { HighScoreCard } from './HighScoreCard';
import { CauseScoreCard } from './CauseScoreCard';

export function LeaderboardPage({ 
  onBackToGame, 
  selectedAgency, 
  onNavigateToEvents, 
  onNavigateToComments, 
  onNavigateToCauseComments 
}: LeaderboardPageProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'causes'>('global');
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Load leaderboard data on component mount
  useEffect(() => {
    initializeSampleComments();
    const data = loadPlayerScores();
    setLeaderboardData(data);
  }, []);

  // Get top score for each level (exactly 12 entries)
  const getTopScoresByLevel = () => {
    const levelScores = {};
    
    leaderboardData.forEach(entry => {
      const level = entry.level;
      if (!levelScores[level] || entry.score > levelScores[level].score) {
        levelScores[level] = entry;
      }
    });
    
    const topScoresByLevel = [];
    for (let level = 1; level <= 12; level++) {
      if (levelScores[level]) {
        topScoresByLevel.push(levelScores[level]);
      } else {
        topScoresByLevel.push({
          score: 0,
          player: { name: 'No one yet', image: '❓', isAnonymous: true },
          timestamp: Date.now(),
          cause: 'No cause selected',
          level: level
        });
      }
    }
    
    return topScoresByLevel;
  };

  const topScoresByLevel = getTopScoresByLevel();
  const sortedCauses = Object.entries(mockWorldwideCauseScores)
    .sort(([, a], [, b]) => b - a);

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
              <Globe className="w-8 h-8 text-green-800" />
              <h1 className="text-5xl font-bold text-green-800 font-boogaloo">Leaderboard</h1>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <LeaderboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* High Scores Tab */}
        {activeTab === 'global' && (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-800 font-boogaloo">High Scores by Level</h2>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topScoresByLevel.map((entry, index) => {
                const currentPlayerName = localStorage.getItem('poke-n-pork-player-name') || 'Anonymous';
                const isPlayerScore = !entry.player.isAnonymous && entry.player.name === currentPlayerName;
                const hasScore = entry.score > 0;
                
                return (
                  <HighScoreCard
                    key={`level-${entry.level}`}
                    entry={entry}
                    isPlayerScore={isPlayerScore}
                    hasScore={hasScore}
                    onNavigateToComments={onNavigateToComments}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Worldwide Causes Tab */}
        {activeTab === 'causes' && (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800 font-boogaloo">Points Accumulated by Cause</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Points accumulated since inception (Check the{' '}
                <button
                  onClick={() => onNavigateToEvents?.(selectedAgency)}
                  className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                >
                  Events Page
                </button>{' '}
                for a breakdown per Event)
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCauses.map(([cause, points], index) => {
                const isPlayerCause = cause === selectedAgency;
                
                return (
                  <CauseScoreCard
                    key={cause}
                    cause={cause}
                    points={points}
                    index={index}
                    isPlayerCause={isPlayerCause}
                    onNavigateToCauseComments={onNavigateToCauseComments}
                  />
                );
              })}
            </div>
          </div>
        )}

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