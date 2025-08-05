import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, MessageCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { getCommentCount } from './CommentsPage';
import { getCommentPreview, addCommentsForHighScore } from './sample-comments-data';
import { formatTimeAgo, getRankIcon, getDifficultyLevel, type LeaderboardEntry } from './leaderboard-helpers';
import { HighScoreEntry } from './leaderboard-types';

interface HighScoreCardProps {
  entry: LeaderboardEntry;
  isPlayerScore: boolean;
  hasScore: boolean;
  onNavigateToComments?: (highScoreEntry: HighScoreEntry) => void;
}

export function HighScoreCard({ entry, isPlayerScore, hasScore, onNavigateToComments }: HighScoreCardProps) {
  // Add sample comments for this high score if it has a real score and random chance
  if (hasScore && !entry.player.isAnonymous && Math.random() < 0.6) {
    const commentCount = Math.floor(Math.random() * 3) + 1;
    addCommentsForHighScore(entry.level, entry.score, entry.timestamp, commentCount);
  }

  return (
    <Card 
      key={`level-${entry.level}`}
      className={`p-3 transition-all ${
        isPlayerScore 
          ? 'bg-green-50 border-2 border-green-300 shadow-md' 
          : hasScore 
            ? 'hover:shadow-md' 
            : 'bg-gray-50 border-dashed border-2 border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {hasScore ? getRankIcon(entry.level) : <Trophy className="w-4 h-4 text-gray-300" />}
          <span className="font-bold text-lg text-gray-800">Level {entry.level}</span>
        </div>
        {(() => {
          const difficulty = getDifficultyLevel(entry.level);
          if (difficulty === 'easy') {
            return <Badge variant="secondary" className="bg-green-100 text-green-800">Easy</Badge>;
          } else if (difficulty === 'medium') {
            return <Badge variant="outline" className="border-orange-300 text-orange-700">Medium</Badge>;
          } else {
            return <Badge variant="destructive" className="bg-red-100 text-red-800">Hard</Badge>;
          }
        })()}
      </div>
      
      {hasScore ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* Left Side - Player Profile */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                <span className="text-sm">{entry.player.image}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`font-medium text-sm truncate ${isPlayerScore ? 'text-green-800' : 'text-gray-800'}`}>
                    {entry.player.name}
                  </span>
                  {isPlayerScore && (
                    <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimeAgo(entry.timestamp)}
                </div>
              </div>
            </div>
            
            {/* Right Side - Score & Cause */}
            <div className="text-right ml-4 min-w-0 flex-shrink-0">
              <div className="font-bold text-3xl text-blue-600 font-boogaloo leading-none">
                {entry.score.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 break-words mt-1">
                {entry.cause}
              </div>
            </div>
          </div>
          
          {/* Horizontal Divider */}
          <Separator className="my-1" />
          
          {/* Comment Section - Entire Row Clickable */}
          <div 
            className={`flex items-center gap-2 text-xs p-1 rounded transition-colors ${
              onNavigateToComments 
                ? 'cursor-pointer hover:bg-blue-50 hover:shadow-sm' 
                : ''
            }`}
            onClick={onNavigateToComments ? () => onNavigateToComments({
              level: entry.level,
              score: entry.score,
              cause: entry.cause,
              playerName: entry.player.name,
              playerImage: entry.player.image,
              timestamp: entry.timestamp
            }) : undefined}
          >
            <MessageCircle className="w-3 h-3 text-gray-400" />
            <span className="font-boogaloo text-gray-600">
              {getCommentCount(entry.level, entry.score, entry.timestamp) || 0} comments
            </span>
            
            {/* Comment Summary - Same Line */}
            {(() => {
              const commentInfo = getCommentPreview(entry.level, entry.score, entry.timestamp);
              if (commentInfo) {
                return (
                  <span className="text-gray-400 italic truncate flex-1">
                    {commentInfo.preview}
                  </span>
                );
              } else {
                return (
                  <span className="text-gray-400 italic">
                    No comments yet
                  </span>
                );
              }
            })()}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-center py-3">
            <div className="text-gray-400 mb-2">
              <span className="text-3xl">🎯</span>
            </div>
            <div className="text-sm text-gray-500">No high score yet</div>
            <div className="text-xs text-gray-400 mt-1">Be the first!</div>
            
            {/* Placeholder for cause section */}
            <div className="mt-2">
              <div className="text-xs text-gray-400 italic">
                No cause selected yet
              </div>
            </div>
          </div>
          
          {/* Horizontal Divider */}
          <Separator className="my-1" />
          
          {/* Comment Section for No Score - Not Clickable */}
          <div className="flex items-center gap-2 text-xs px-2 py-1">
            <MessageCircle className="w-3 h-3 text-gray-300" />
            <span className="font-boogaloo text-gray-400">
              0 comments
            </span>
            <span className="text-gray-400 italic">
              No comments yet
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}