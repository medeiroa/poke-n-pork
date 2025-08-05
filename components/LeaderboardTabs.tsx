import React from 'react';
import { Button } from './ui/button';
import { Trophy, Target } from 'lucide-react';

interface LeaderboardTabsProps {
  activeTab: 'global' | 'causes';
  onTabChange: (tab: 'global' | 'causes') => void;
}

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
        <Button
          variant={activeTab === 'global' ? 'default' : 'ghost'}
          className="px-3 sm:px-6"
          onClick={() => onTabChange('global')}
        >
          <Trophy className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">High Scores</span>
          <span className="sm:hidden">High</span>
        </Button>
        <Button
          variant={activeTab === 'causes' ? 'default' : 'ghost'}
          className="px-3 sm:px-6"
          onClick={() => onTabChange('causes')}
        >
          <Target className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Cause Scores</span>
          <span className="sm:hidden">Causes</span>
        </Button>
      </div>
    </div>
  );
}